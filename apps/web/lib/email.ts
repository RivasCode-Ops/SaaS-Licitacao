import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)
const from = process.env.EMAIL_FROM || "SaaS Licitação <noreply@licita.dev>"

type EmailParams = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailParams) {
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

export function welcomeEmail(name: string) {
  return {
    subject: `Bem-vindo ao SaaS Licitação, ${name}!`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 16px;color:#111">Bem-vindo, ${name}!</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 16px">
        Sua conta foi criada com sucesso. Agora você pode gerenciar processos licitatórios
        de forma simples e eficiente.
      </p>
      <a href="${process.env.BASE_URL || "http://localhost:3000"}/dashboard"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        Acessar Dashboard
      </a>
    `),
  }
}

export function stageAdvancedEmail(userName: string, processTitle: string, stageName: string) {
  return {
    subject: `Etapa "${stageName}" concluída — ${processTitle}`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 16px;color:#111">Etapa concluída</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        Olá, <strong>${userName}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        A etapa <strong>${stageName}</strong> do processo <strong>${processTitle}</strong>
        foi concluída.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 16px">
        Acesse a plataforma para acompanhar as próximas etapas.
      </p>
      <a href="${process.env.BASE_URL || "http://localhost:3000"}/dashboard/workflow"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        Ver Workflow
      </a>
    `),
  }
}

export function deadlineAlertEmail(userName: string, processTitle: string, stageName: string, deadline: string) {
  return {
    subject: `⚠️ Prazo próximo — ${stageName} de ${processTitle}`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 16px;color:#111">Prazo se aproximando</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        Olá, <strong>${userName}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        O prazo para a etapa <strong>${stageName}</strong> do processo
        <strong>${processTitle}</strong> termina em <strong>${deadline}</strong>.
      </p>
      <a href="${process.env.BASE_URL || "http://localhost:3000"}/dashboard/workflow"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        Ver Workflow
      </a>
    `),
  }
}

export function newProcessEmail(userName: string, processTitle: string, modality: string) {
  return {
    subject: `Novo processo criado — ${processTitle}`,
    html: layout(`
      <h1 style="font-size:22px;margin:0 0 16px;color:#111">Novo processo</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 8px">
        Olá, <strong>${userName}</strong>.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 16px">
        O processo licitatório <strong>${processTitle}</strong>
        (modalidade: ${modality}) foi criado.
        A primeira etapa já está ativa.
      </p>
      <a href="${process.env.BASE_URL || "http://localhost:3000"}/dashboard/workflow"
         style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;
                border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
        Acompanhar
      </a>
    `),
  }
}
