import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const from = process.env.EMAIL_FROM || "SaaS Licitação <noreply@licita.dev>"

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] dry-run: to=${to} subject="${subject}"`)
    return
  }
  await resend.emails.send({ from, to, subject, html })
}

function layout(body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="padding:32px 32px 0">
<img src="https://licita.dev/logo.png" alt="SaaS Licitação" width="160" style="display:block;margin-bottom:24px"/>
</td></tr>
<tr><td style="padding:0 32px 32px">
${body}
</td></tr>
<tr><td style="padding:16px 32px;background:#f9f9f9;border-top:1px solid #eee">
<p style="margin:0;font-size:12px;color:#888">
SaaS Licitação — Plataforma de gestão de licitações públicas<br/>
<a href="${process.env.BASE_URL || "http://localhost:3000"}" style="color:#2563eb">Acessar plataforma</a>
</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

export function proposalSubmittedEmail(adminName: string, supplierName: string, processTitle: string, value: string) {
  return {
    subject: `Nova proposta recebida — ${processTitle}`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 16px;color:#111">Nova proposta recebida</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        Olá, <strong>${adminName}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        O fornecedor <strong>${supplierName}</strong> enviou uma proposta
        para o processo <strong>${processTitle}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 16px">
        Valor proposto: <strong>R$ ${value}</strong>
      </p>
      <a href="${process.env.BASE_URL || "http://localhost:3000"}/dashboard/propostas"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        Ver Propostas
      </a>
    `),
  }
}
