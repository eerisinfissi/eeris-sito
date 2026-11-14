// Email di conferma al cliente dopo una richiesta di preventivo.
//
// Si attiva da sola quando Netlify riceve (e verifica come non-spam) un invio del
// modulo "preventivo". Manda al cliente un'email da info@eerisinfissi.it con il
// suo codice richiesta, così lo ritrova anche se non l'ha annotato.
//
// Richiede due variabili d'ambiente su Netlify (scope: Functions):
//   SMTP_USER = info@eerisinfissi.it
//   SMTP_PASS = password per le app di Google per quell'account
// Se mancano, la funzione non fa nulla (la richiesta arriva comunque a voi).
//
// Per sicurezza l'email NON contiene testo scritto dal cliente: solo il codice
// (controllato con un formato preciso) e frasi fisse. Così nessuno può usare il
// modulo per far partire email con contenuti a sua scelta.

import nodemailer from "nodemailer"

const CODE_RE = /^EER-\d{6}-[A-HJ-NP-Z2-9]{4}$/
const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/

function buildText(code) {
  return [
    "Gentile cliente,",
    "",
    "grazie per aver contattato EERIS. Abbiamo ricevuto la tua richiesta di preventivo gratuito e ti ricontatteremo al più presto.",
    "",
    `Il tuo codice richiesta è: ${code}`,
    "",
    "Conservalo: citalo se ci chiami al 338 290 6931, se ci scrivi su WhatsApp (https://wa.me/393382906931) o se rispondi a questa email, per chiedere informazioni, aggiungere qualcosa che hai dimenticato o mandarci le foto del lavoro.",
    "",
    "A presto,",
    "EERIS di Andrea Caccavale",
    "Via Stazione, 29 – 82011 Airola (BN) · P.IVA 01257410629",
    "https://eerisinfissi.it",
    "",
    "Hai ricevuto questa email perché il tuo indirizzo è stato inserito nel modulo di richiesta preventivo su eerisinfissi.it. Se non sei stato tu, puoi ignorarla.",
  ].join("\n")
}

function buildHtml(code) {
  return `<!doctype html><html lang="it"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#232427">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
  <p style="font-size:22px;font-weight:800;color:#ef454b;margin:0 0 24px">eeris.</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Gentile cliente,</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 24px">grazie per aver contattato EERIS. Abbiamo ricevuto la tua richiesta di <strong>preventivo gratuito</strong> e ti ricontatteremo al più presto.</p>
  <div style="border:1.5px solid #3aa86b;background:#eaf7ef;border-radius:12px;padding:20px 22px;margin:0 0 24px">
    <p style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#1d7442;margin:0 0 8px">Il tuo codice richiesta</p>
    <p style="font-size:28px;font-weight:800;letter-spacing:.04em;margin:0">${code}</p>
  </div>
  <p style="font-size:15px;line-height:1.6;margin:0 0 24px">Conservalo: citalo se ci chiami al <a href="tel:+393382906931" style="color:#232427">338 290 6931</a>, se ci scrivi su <a href="https://wa.me/393382906931" style="color:#232427">WhatsApp</a> o se rispondi a questa email, per chiedere informazioni, aggiungere qualcosa che hai dimenticato o mandarci le foto del lavoro.</p>
  <p style="font-size:15px;line-height:1.6;margin:0">A presto,<br><strong>EERIS di Andrea Caccavale</strong></p>
  <hr style="border:0;border-top:1px solid #e4e4e7;margin:28px 0 16px">
  <p style="font-size:12px;line-height:1.5;color:#71717a;margin:0">Via Stazione, 29 – 82011 Airola (BN) · P.IVA 01257410629 · <a href="https://eerisinfissi.it" style="color:#71717a">eerisinfissi.it</a><br>
  Hai ricevuto questa email perché il tuo indirizzo è stato inserito nel modulo di richiesta preventivo su eerisinfissi.it. Se non sei stato tu, puoi ignorarla.</p>
</div></body></html>`
}

export default {
  async formSubmitted(event) {
    const data = (event && event.data) || {}
    const code = String(data.codice_richiesta || "").trim()
    const to = String(data.email || "").trim()

    if (!CODE_RE.test(code) || !EMAIL_RE.test(to)) {
      console.log("Conferma non inviata: codice o email mancanti/non validi")
      return
    }

    const user = Netlify.env.get("SMTP_USER")
    const pass = Netlify.env.get("SMTP_PASS")
    if (!user || !pass) {
      console.log("Conferma non inviata: SMTP_USER/SMTP_PASS non impostati")
      return
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    })

    try {
      await transporter.sendMail({
        from: `"EERIS" <${user}>`,
        to,
        replyTo: user,
        subject: `La tua richiesta di preventivo EERIS – codice ${code}`,
        text: buildText(code),
        html: buildHtml(code),
      })
      console.log(`Conferma inviata per ${code}`)
    } catch (err) {
      console.error(`Errore nell'invio della conferma per ${code}:`, err && err.message)
    }
  },
}
