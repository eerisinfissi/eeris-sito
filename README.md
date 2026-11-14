# Sito EERIS

Sito statico di **EERIS di Andrea Caccavale**: infissi in alluminio e PVC, ferro, legno e restauro.
Funziona senza build: solo HTML, CSS e JavaScript. Viene pubblicato con **GitHub + Netlify**, con deploy automatico a ogni modifica.

## Struttura

```
index.html            Pagina principale (tutte le sezioni)
privacy-policy.html   Privacy Policy  → /privacy-policy
cookie-policy.html    Cookie Policy   → /cookie-policy
grazie.html           Conferma invio (usata se JavaScript è disattivato)
404.html              Pagina non trovata
css/styles.css        Stili (colori e font nelle variabili in cima al file)
js/main.js            Menu, galleria, lightbox, modulo preventivo
assets/img/           Immagini, loghi, favicon
assets/fonts/         Font Montserrat e Inter (ospitati in locale)
netlify.toml          Configurazione Netlify (cache e sicurezza)
robots.txt
```

## 1. Vedere il sito sul computer

Dalla cartella del progetto:

```bash
python3 -m http.server 8080
```

Poi apri <http://localhost:8080>.

> In locale il modulo **non invia** richieste (Netlify Forms funziona solo sul sito pubblicato). Viene mostrato il messaggio di conferma con l'avviso «Anteprima locale», e i dati che verrebbero inviati compaiono nella console del browser.

## 2. Modificare i contenuti

| Cosa | Dove |
|---|---|
| Testi, telefono, link WhatsApp | `index.html` (il numero compare come `+393382906931` e `338 290 6931`) |
| Colori e font | `css/styles.css`, sezione `:root` |
| Foto | sostituisci i file in `assets/img/` mantenendo lo stesso nome, o aggiorna i percorsi in `index.html`. Per ogni foto ci sono una versione grande (1280 px) e una piccola `-sm` (500 px) |
| Lavori della galleria | in `index.html`, ogni `<li class="tile" data-category="...">` è una foto. Le categorie valide sono `alluminio`, `ferro`, `legno`, `restauro` |
| Opzioni del configuratore infissi | `js/main.js`, oggetto `CONFIG` (`productOptions`, `colorOptions`, `maxItems`) |

Dopo ogni modifica: commit e push su GitHub. Netlify ripubblica il sito da solo in circa un minuto.

## 3. Pubblicare con GitHub e Netlify (una volta sola)

1. **Crea il repository su GitHub**: su github.com scegli *New repository*, per esempio `eeris-sito`, privato o pubblico.
2. **Carica i file**. Dalla cartella del progetto:
   ```bash
   git init
   git add .
   git commit -m "Primo caricamento sito EERIS"
   git branch -M main
   git remote add origin https://github.com/TUO-UTENTE/eeris-sito.git
   git push -u origin main
   ```
   In alternativa, su GitHub usa *Add file → Upload files* e trascina tutti i file e le cartelle.
3. **Collega Netlify**: su app.netlify.com scegli *Add new site → Import an existing project → GitHub* e seleziona il repository.
   - Build command: **lascia vuoto**
   - Publish directory: **`.`** (è già impostata da `netlify.toml`)
4. Premi **Deploy**. Il sito sarà online su un indirizzo `https://nome-casuale.netlify.app`. Puoi rinominarlo in *Site configuration → Change site name*.

Da questo momento ogni `git push` sul ramo `main` pubblica automaticamente il sito.

## 4. Ricevere i preventivi via email (obbligatorio)

Il modulo usa **Netlify Forms**, che Netlify rileva da solo al primo deploy grazie all'attributo `data-netlify="true"`. Va però attivato e collegato all'email **una volta sola**:

1. Nel pannello Netlify del sito apri **Forms** e premi **Enable form detection**, se richiesto. Poi fai un nuovo deploy (*Deploys → Trigger deploy → Deploy site*). Nella lista deve comparire il modulo **`preventivo`**.
2. Apri **Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email notification**.
3. Imposta:
   - *Event to listen for*: **New form submission**
   - *Email to notify*: **info@eerisinfissi.it**
   - *Form*: **preventivo**
4. Salva e fai un **invio di prova** dal sito pubblicato.

Cosa arriva nell'email:
- oggetto «Nuova richiesta di preventivo dal sito EERIS»;
- nome, email, telefono, tipologie, descrizione e consenso;
- il campo `configurazione_infissi` con il riepilogo degli infissi (materiale, tipologia, colore, misure, quantità);
- le foto come link per scaricarle (`foto_1` … `foto_5`).

Tutte le richieste restano consultabili anche in **Forms → preventivo** nel pannello Netlify.

**Se l'email non arriva:**
- controlla la cartella Spam di Gmail e segna il mittente come «Non spam»;
- verifica in *Forms → preventivo* che la richiesta sia arrivata. Se è finita in *Spam submissions*, segnala che non è spam;
- verifica che la notifica sia impostata sul modulo `preventivo` e sull'indirizzo corretto.

**Limiti da conoscere:**
- I piani gratuiti di Netlify hanno un limite mensile di invii e di spazio per gli allegati. Controlla i limiti aggiornati nella pagina *Usage* del pannello o su netlify.com/pricing.
- Le foto vengono ridimensionate automaticamente nel browser (lato massimo 2000 px) prima dell'invio, per stare nel limite di circa 8 MB per richiesta.
- Sono protette dallo spam con un campo nascosto (honeypot) e con il filtro antispam di Netlify.

**Cambiare l'indirizzo email in futuro:** basta modificare la notifica al punto 2. Non serve toccare il codice.

## 5. Collegare il dominio personalizzato

Dopo aver acquistato il dominio, per esempio `eeris.it`:

1. In Netlify apri **Domain management → Add a domain** e inserisci il dominio.
2. Scegli uno dei due metodi:
   - **Consigliato: DNS di Netlify.** Netlify ti mostra 4 nameserver (`dns1.p0X.nsone.net` …). Inseriscili nel pannello del registrar dove hai comprato il dominio, al posto di quelli esistenti.
   - **DNS del registrar.** Crea un record `CNAME` per `www` che punta a `nome-sito.netlify.app` e un record `A` per il dominio principale (`@`) con l'IP indicato da Netlify, oppure un record `ALIAS`/`ANAME` se il registrar lo supporta.
3. Attendi la propagazione, da pochi minuti fino a 24–48 ore. Netlify attiva **HTTPS gratuito** (Let's Encrypt) in automatico.
4. Imposta la versione principale (con o senza `www`). Netlify reindirizza l'altra automaticamente.

**Dopo aver collegato il dominio:**
- in `index.html` sostituisci `/assets/img/og-image.jpg` nel tag `og:image` con l'indirizzo completo, per esempio `https://www.eeris.it/assets/img/og-image.jpg`, così le anteprime su WhatsApp e Facebook mostrano l'immagine;
- puoi aggiungere `<link rel="canonical" href="https://www.eeris.it/">` nell'`<head>`;
- registra il sito su Google Search Console.

## 6. Da completare prima della pubblicazione

- **Privacy Policy** (`privacy-policy.html`): completa i campi evidenziati in giallo `[DA COMPLETARE: …]`, cioè sede, partita IVA, email per la privacy e periodo di conservazione. Fai verificare il testo da un consulente se possibile.
- Le foto della galleria sono segnalate come «a scopo illustrativo»: quando avrai le foto dei tuoi lavori, sostituiscile e rimuovi la nota da `index.html`.
