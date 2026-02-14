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

$commits = & git rev-list --all
$findings = New-Object System.Collections.Generic.List[object]

foreach ($commit in $commits) {
  $files = & git diff-tree --no-commit-id --name-only -r $commit

  foreach ($file in $files) {
    if ([string]::IsNullOrWhiteSpace($file)) {
      continue
    }

    $blobSpec = "$commit`:$file"
    $blobOutput = & git show $blobSpec 2>$null
    if ($LASTEXITCODE -ne 0) {
      continue
    }

    $content = ($blobOutput -join "`n")
    if ([string]::IsNullOrEmpty($content)) {
      continue
    }

    if ($content.IndexOf([char]0) -ge 0) {
      continue
    }

    foreach ($pattern in $patterns) {
      if ([System.Text.RegularExpressions.Regex]::IsMatch(
          $content,
          $pattern.Regex,
          [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
        )) {
        $findings.Add(
          [PSCustomObject]@{
            Commit = $commit.Substring(0, 12)
            File = $file
            Rule = $pattern.Name
          }
        )
      }
    }
  }
}

if ($findings.Count -gt 0) {
  Write-Host 'Potential secret signatures found in git history:'
  $findings |
    Sort-Object Commit, File, Rule -Unique |
    ForEach-Object {
      Write-Host (" - {0} {1} ({2})" -f $_.Commit, $_.File, $_.Rule)
    }
  exit 1
}

Write-Host 'Git history scan passed: no high-confidence secret signatures detected.'
