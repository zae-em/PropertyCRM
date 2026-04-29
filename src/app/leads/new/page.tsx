'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function NewLeadPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', propertyInterest: '', budget: '', notes: '', source: 'Website' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(data.error || 'Failed'); return }
    toast.success('Lead created!')
    router.push('/leads')
  }

  // Preview score based on budget
  const budget = Number(form.budget)
  const previewScore = budget > 20 ? 'High' : budget >= 10 ? 'Medium' : budget > 0 ? 'Low' : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leads" className="text-gray-400 hover:text-gray-600">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-800">New Lead</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Full Name *', name: 'name', type: 'text', required: true },
            { label: 'Email', name: 'email', type: 'email', required: false },
            { label: 'Phone (without country code)', name: 'phone', type: 'text', required: false },
            { label: 'Property Interest *', name: 'propertyInterest', type: 'text', required: true },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type} name={f.name} value={(form as any)[f.name]} onChange={handleChange} required={f.required}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (Million PKR) *</label>
            <input type="number" name="budget" value={form.budget} onChange={handleChange} required min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            {previewScore && (
              <p className="text-xs mt-1 text-gray-500">Auto priority: <span className={`font-medium ${previewScore === 'High' ? 'text-red-600' : previewScore === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>{previewScore}</span></p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
            <select name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
              {['Facebook Ads', 'Walk-in', 'Website', 'Referral'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition">
          {loading ? 'Creating...' : 'Create Lead'}
        </button>
      </form>
    </div>
  )
}
