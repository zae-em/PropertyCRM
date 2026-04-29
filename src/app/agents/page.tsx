import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import AgentsClient from './AgentsClient'

export default async function AgentsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const user = session.user as any
  if (user.role !== 'admin') redirect('/dashboard')
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6"><AgentsClient /></main>
    </div>
  )
}
