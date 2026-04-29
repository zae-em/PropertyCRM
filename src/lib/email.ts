import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
})

export async function sendNewLeadEmail(lead: any) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_USER,
    subject: `New Lead: ${lead.name}`,
    html: `<h2>New Lead Created</h2>
      <p><b>Name:</b> ${lead.name}</p>
      <p><b>Email:</b> ${lead.email}</p>
      <p><b>Property Interest:</b> ${lead.propertyInterest}</p>
      <p><b>Budget:</b> ${lead.budget}M PKR</p>
      <p><b>Priority:</b> ${lead.score}</p>`
  })
}

export async function sendAssignmentEmail(lead: any, agentEmail: string, agentName: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: agentEmail,
    subject: `Lead Assigned: ${lead.name}`,
    html: `<h2>Lead Assigned to You</h2>
      <p>Hi ${agentName},</p>
      <p>A new lead has been assigned to you.</p>
      <p><b>Client:</b> ${lead.name}</p>
      <p><b>Budget:</b> ${lead.budget}M PKR</p>
      <p><b>Priority:</b> ${lead.score}</p>
      <p>Login to the CRM to view details.</p>`
  })
}
