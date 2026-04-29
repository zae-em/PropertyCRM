'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { format } from 'date-fns'

const STATUSES = ['New', 'Contacted', 'In Progress', 'Closed', 'Lost']

function ScoreBadge({ score }: { score: string }) {
  const c = score === 'High' ? 'bg-red-100 text-red-700' : score === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{score}</span>
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const user = session?.user as any
  const router = useRouter()

  const [lead, setLead] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    fetch(`/api/leads/${id}`).then(r => r.json()).then(d => {
      setLead(d.lead)
      setActivities(d.activities || [])
      setForm({
        status: d.lead?.status, notes: d.lead?.notes || '',
        assignedTo: d.lead?.assignedTo?._id || '',
        followUpDate: d.lead?.followUpDate ? d.lead.followUpDate.substring(0, 10) : ''
      })
    })
    if (user?.role === 'admin') fetch('/api/agents').then(r => r.json()).then(setAgents)
  }, [id, user?.role])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json()
      setLead(updated)
      toast.success('Lead updated!')
      // Refresh activities
      fetch(`/api/leads/${id}`).then(r => r.json()).then(d => setActivities(d.activities || []))
    } else toast.error('Update failed')
  }

  if (!lead) return <div className="text-center py-20 text-gray-400">Loading...</div>

  const whatsappUrl = lead.phone ? `https://wa.me/92${lead.phone.replace(/^0/, '')}` : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/leads" className="text-gray-400 hover:text-gray-600">← Leads</Link>
          <h1 className="text-2xl font-bold text-gray-800">{lead.name}</h1>
          <ScoreBadge score={lead.score} />
        </div>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition">
            💬 WhatsApp
          </a>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <Info label="Email" value={lead.email} />
        <Info label="Phone" value={lead.phone} />
        <Info label="Property Interest" value={lead.propertyInterest} />
        <Info label="Budget" value={`${lead.budget}M PKR`} />
        <Info label="Source" value={lead.source} />
        <Info label="Created" value={format(new Date(lead.createdAt), 'dd MMM yyyy')} />
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-gray-700">Update Lead</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {user?.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Assign To Agent</label>
              <select value={form.assignedTo} onChange={e => setForm((f: any) => ({ ...f, assignedTo: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">Unassigned</option>
                {agents.map((a: any) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Follow-up Date</label>
            <input type="date" value={form.followUpDate} onChange={e => setForm((f: any) => ({ ...f, followUpDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Activity timeline */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-4">Activity Timeline</h3>
        {activities.length === 0 ? (
          <p className="text-gray-400 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((act: any) => (
              <div key={act._id} className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700">{act.description}</p>
                  <p className="text-xs text-gray-400">{format(new Date(act.createdAt), 'dd MMM yyyy, HH:mm')}{act.performedByName ? ` · ${act.performedByName}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value || '—'}</p>
    </div>
  )
}
