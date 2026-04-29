'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUSES = ['', 'New', 'Contacted', 'In Progress', 'Closed', 'Lost']
const SCORES = ['', 'High', 'Medium', 'Low']

function ScoreBadge({ score }: { score: string }) {
  const c = score === 'High' ? 'bg-red-100 text-red-700' : score === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c}`}>{score}</span>
}

export default function LeadsPage() {
  const { data: session } = useSession()
  const user = session?.user as any
  const [leads, setLeads] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [score, setScore] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (score) params.set('score', score)
    const res = await fetch(`/api/leads?${params}`)
    const data = await res.json()
    setLeads(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [status, score])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchLeads, 15000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  async function deleteLead(id: string) {
    if (!confirm('Delete this lead?')) return
    const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Lead deleted'); fetchLeads() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Leads</h1>
        <Link href="/leads/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          + New Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={status} onChange={e => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={score} onChange={e => setScore(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          {SCORES.map(s => <option key={s} value={s}>{s || 'All Priorities'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>{['Name', 'Property Interest', 'Budget', 'Status', 'Priority', 'Assigned To', 'WhatsApp', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-gray-500 font-medium">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead._id} className={`border-b border-gray-50 hover:bg-gray-50 transition ${lead.score === 'High' ? 'border-l-4 border-l-red-400' : ''}`}>
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead._id}`} className="font-medium text-blue-600 hover:underline">{lead.name}</Link>
                      {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{lead.propertyInterest}</td>
                    <td className="px-4 py-3 font-medium">{lead.budget}M PKR</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{lead.status}</span></td>
                    <td className="px-4 py-3"><ScoreBadge score={lead.score} /></td>
                    <td className="px-4 py-3 text-gray-500">{lead.assignedTo?.name || <span className="text-gray-300 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      {lead.phone && (
                        <a href={`https://wa.me/92${lead.phone.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 text-lg">💬</a>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link href={`/leads/${lead._id}`} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Edit</Link>
                      {user?.role === 'admin' && (
                        <button onClick={() => deleteLead(lead._id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
