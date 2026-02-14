$ErrorActionPreference = 'Stop'

$patterns = @(
  @{ Name = 'PrivateKeyBlock'; Regex = '-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----' },
  @{ Name = 'AWSAccessKey'; Regex = '\b(A3T[A-Z0-9]|AKIA|ASIA|AGPA|AIDA|AROA|AIPA)[A-Z0-9]{16}\b' },
  @{ Name = 'GitHubTokenClassic'; Regex = '\bghp_[A-Za-z0-9]{36}\b' },
  @{ Name = 'GitHubTokenFineGrained'; Regex = '\bgithub_pat_[A-Za-z0-9_]{80,}\b' },
  @{ Name = 'OpenAIStyleKey'; Regex = '\bsk-(?:live|test|proj|service-account)-[A-Za-z0-9_-]{16,}\b' },
  @{ Name = 'GoogleAPIKey'; Regex = '\bAIza[0-9A-Za-z\-_]{35}\b' },
  @{ Name = 'SlackToken'; Regex = '\bxox[baprs]-[A-Za-z0-9-]{10,48}\b' },
  @{ Name = 'SendGridKey'; Regex = '\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b' },
  @{ Name = 'ConnectionStringCredential'; Regex = '(?im)^(?:DATABASE_URL|POSTGRES_URL|MYSQL_URL|MONGO_URL)\s*=\s*(?!["'']?(?:example|placeholder|changeme|your_))[^\r\n]{16,}$' },
  @{ Name = 'GenericSecretAssignment'; Regex = '(?im)^(?:[A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|API_KEY|PRIVATE_KEY)[A-Z0-9_]*)\s*=\s*(?!["'']?(?:example|placeholder|changeme|your_))[^\r\n]{12,}$' }
)

function Get-LineNumber {
  param (
    [string]$Text,
    [int]$Index
  )

  if ($Index -le 0) {
    return 1
  }

  return ($Text.Substring(0, $Index) -split "`n").Count
}

$files = & git ls-files
$findings = New-Object System.Collections.Generic.List[object]

foreach ($file in $files) {
  if (-not [System.IO.File]::Exists($file)) {
    continue
  }

  $content = $null
  try {
    $content = [System.IO.File]::ReadAllText((Resolve-Path -Path $file))
  } catch {
    continue
  }

  if ([string]::IsNullOrEmpty($content)) {
    continue
  }

  foreach ($pattern in $patterns) {
    $matches = [System.Text.RegularExpressions.Regex]::Matches(
      $content,
      $pattern.Regex,
      [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    foreach ($match in $matches) {
      $lineNumber = Get-LineNumber -Text $content -Index $match.Index
      $findings.Add(
        [PSCustomObject]@{
          File = $file
          Line = $lineNumber
          Rule = $pattern.Name
        }
      )
    }
  }
}

if ($findings.Count -gt 0) {
  Write-Host 'Potential secret signatures found in tracked files:'
  $findings |
    Sort-Object File, Line, Rule -Unique |
    ForEach-Object {
      Write-Host (" - {0}:{1} ({2})" -f $_.File, $_.Line, $_.Rule)
    }
  exit 1
}

Write-Host 'Tracked files scan passed: no high-confidence secret signatures detected.'
