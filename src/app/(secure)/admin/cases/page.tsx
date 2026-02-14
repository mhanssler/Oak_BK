import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdminUser } from '@/lib/auth/roles'
import type { BankruptcyCase } from '@/lib/cases/types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

function compactUserId(userId: string): string {
  if (!userId || userId.length < 12) {
    return userId
  }
  return `${userId.slice(0, 8)}...${userId.slice(-4)}`
}

export default async function AdminCasesPage() {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  if (!isAdminUser(user)) {
    redirect('/dashboard')
  }

  const { data: casesRaw } = await supabase
    .from('bankruptcy_cases')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(250)

  const cases = (casesRaw || []) as BankruptcyCase[]

  return (
    <main>
      <section className="hero">
        <h1>Admin Case Review</h1>
        <p>View all submitted and draft client cases across accounts.</p>
      </section>

      <section className="surface" style={{ padding: '1.2rem' }}>
        <div className="stack">
          <h2 style={{ margin: 0 }}>All Cases</h2>
          {cases.length === 0 ? (
            <p className="hint">No cases available.</p>
          ) : (
            <table className="list-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Chapter</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td>{caseItem.case_ref || caseItem.id}</td>
                    <td>{caseItem.title}</td>
                    <td>{caseItem.chapter}</td>
                    <td>{caseItem.status}</td>
                    <td>{compactUserId(caseItem.user_id)}</td>
                    <td>{new Date(caseItem.updated_at).toLocaleString()}</td>
                    <td>
                      <Link className="button-secondary" href={`/admin/cases/${caseItem.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  )
}
