import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Lead from '@/models/Lead'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const leads = await Lead.find({}).populate('assignedTo', 'name').lean()

  const rows = leads.map((l: any) => ({
    Name: l.name,
    Email: l.email || '',
    Phone: l.phone || '',
    'Property Interest': l.propertyInterest,
    'Budget (M PKR)': l.budget,
    Status: l.status,
    Priority: l.score,
    Source: l.source,
    'Assigned To': l.assignedTo?.name || 'Unassigned',
    'Created At': new Date(l.createdAt).toLocaleDateString()
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leads')
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="leads.xlsx"'
    }
  })
}
