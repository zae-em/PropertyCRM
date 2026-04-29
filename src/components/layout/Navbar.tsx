'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as any
  const path = usePathname()

  const links = user?.role === 'admin'
    ? [{ href: '/dashboard', label: 'Dashboard' }, { href: '/leads', label: 'Leads' }, { href: '/agents', label: 'Agents' }]
    : [{ href: '/dashboard', label: 'My Leads' }]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-6">
        <span className="font-bold text-blue-600 text-lg">🏠 PropCRM</span>
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`text-sm font-medium transition ${path === l.href ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name} <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{user?.role}</span></span>
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
      </div>
    </nav>
  )
}
