/* ==========================================================================
   EERIS — Script del sito
   Moduli: header · menu mobile · voce di menu attiva · animazioni di comparsa
           galleria con filtri · lightbox · modulo preventivo
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Anno nel footer ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Header: ombra allo scroll ---------- */
  var header = $('#site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = $('.menu-toggle');
  var menu = $('#mobile-menu');
  if (toggle && menu) {
    var useEl = $('use', toggle);
    var setMenu = function (open) {
      menu.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
      useEl.setAttribute('href', open ? '#i-close' : '#i-menu');
      document.body.classList.toggle('no-scroll', open);
      if (open) { var first = $('a', menu); if (first) first.focus(); }
    };
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1021px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------- Voce di menu attiva in base alla sezione visibile ---------- */
  var navLinks = $$('.main-nav .nav-link');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sectionToNav = { 'perche-eeris': 'chi-siamo', preventivo: 'contatti' };
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = sectionToNav[entry.target.id] || entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a === byId[id]); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Animazioni di comparsa ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    reveals.forEach(function (el) {
      var siblings = $$(':scope > .reveal', el.parentElement);
      var index = siblings.indexOf(el);
      if (index > 0) el.style.transitionDelay = Math.min(index, 4) * 90 + 'ms';
    });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Galleria con filtri ---------- */
  var gallery = $('#gallery');
  var chips = $$('.filters .chip');
  var galleryStatus = $('#gallery-status');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      var count = 0;
      $$('.tile', gallery).forEach(function (tile) {
        var show = filter === 'tutti' || tile.dataset.category === filter;
        tile.hidden = !show;
        if (show) {
          count++;
          tile.style.animation = 'none';
          void tile.offsetWidth; // riavvia l'animazione di ingresso
          tile.style.animation = '';
        }
      });
      gallery.classList.toggle('is-filtered', filter !== 'tutti');
      if (galleryStatus) galleryStatus.textContent = count + (count === 1 ? ' lavoro mostrato' : ' lavori mostrati');
    });
  });

  /* ---------- Lightbox ---------- */
  var lightbox = $('#lightbox');
  if (lightbox && gallery && typeof lightbox.showModal === 'function') {
    var lbImg = $('#lightbox-img');
    var lbCat = $('#lightbox-cat');
    var lbTitle = $('#lightbox-title');
    var lbCounter = $('#lightbox-counter');
    var lbItems = [];
    var lbIndex = 0;
    var lbOpener = null;

    var lbShow = function (i) {
      lbIndex = (i + lbItems.length) % lbItems.length;
      var card = lbItems[lbIndex];
      var thumb = $('img', card);
      lbImg.src = card.dataset.full;
      lbImg.alt = thumb.alt;
      lbCat.textContent = $('.work-category', card).textContent;
      lbTitle.textContent = $('.work-title', card).textContent;
      lbCounter.textContent = (lbIndex + 1) + ' / ' + lbItems.length;
    };
    var lbClose = function () { lightbox.close(); };

    gallery.addEventListener('click', function (e) {
      var card = e.target.closest('.work-card');
      if (!card) return;
      lbItems = $$('.tile:not([hidden]) .work-card', gallery);
      lbOpener = card;
      lbShow(lbItems.indexOf(card));
      lightbox.showModal();
      document.body.classList.add('no-scroll');
    });
    lightbox.addEventListener('close', function () {
      document.body.classList.remove('no-scroll');
      if (lbOpener) lbOpener.focus();
    });
    lightbox.addEventListener('click', function (e) {
      var action = e.target.closest('[data-lb]');
      if (action) {
        var a = action.dataset.lb;
        if (a === 'close') lbClose();
        if (a === 'prev') lbShow(lbIndex - 1);
        if (a === 'next') lbShow(lbIndex + 1);
      } else if (e.target === lightbox) {
        lbClose();
      }
    });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
      if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
    });
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) lbShow(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });
  }

  /* ==========================================================================
     MODULO PREVENTIVO
     Invio tramite Netlify Forms (POST multipart alla pagina "/").
     Le notifiche email si configurano nel pannello Netlify: vedi README.md.
     ========================================================================== */
  var form = $('#quote-form');
  if (!form) return;

  var CONFIG = {
    maxFiles: 5,
    maxFileMb: 8,
    // Netlify accetta richieste fino a circa 8 MB in totale: le foto vengono
    // ridimensionate nel browser e il totale è mantenuto sotto questa soglia.
    maxTotalMb: 7.2,
    maxImageSide: 2000,
    maxItems: 20,
    configMaterials: ['Alluminio', 'PVC'],
    productOptions: ['Infissi'],
    colorOptions: ['Bianco', 'Effetto legno'],
    summaryTitle: 'Richiesta preventivo – Configurazione infissi'
  };
  var MSG = {
    nome: 'Inserisci nome e cognome.',
    email: 'Inserisci un indirizzo email valido.',
    telefono: 'Inserisci un numero di telefono valido.',
    tipologia: 'Seleziona almeno una tipologia di lavoro.',
    descrizione: 'Descrivi il lavoro richiesto con qualche dettaglio in più.',
    consenso: 'Per inviare la richiesta è necessario il consenso al trattamento dei dati.',
    product: 'Seleziona la tipologia.',
    color: 'Seleziona il colore.',
    measure: 'Inserisci la misura in cm.',
    qty: 'Inserisci la quantità.',
    submit: 'Non siamo riusciti a inviare la richiesta. Riprova tra qualche istante oppure chiamaci al <a href="tel:+393382906931">338 290 6931</a>.'
  };

  var isLocalPreview = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  var state = { configs: {}, files: [], submitted: false, nextId: 1 };
  CONFIG.configMaterials.forEach(function (m) { state.configs[m] = [newItem()]; });

  function newItem() {
    return {
      id: state.nextId++,
      product: CONFIG.productOptions.length === 1 ? CONFIG.productOptions[0] : '',
      color: '', width: '', height: '', qty: '1'
    };
  }

  var el = {
    nome: $('#f-nome'), email: $('#f-email'), telefono: $('#f-telefono'),
    descrizione: $('#f-descrizione'), consenso: $('#f-consenso'),
    tipologia: $('#f-tipologia'), tipologiaValue: $('#f-tipologia-value'), configValue: $('#f-config-value'),
    configurators: $('#configurators'),
    fileInput: $('#f-foto'), drop: $('#drop'), dropButton: $('#drop-button'), fileList: $('#file-list'), fileErr: $('#f-foto-err'),
    submitBtn: $('#submit-btn'), submitErr: $('#submit-error'),
    success: $('#form-success'), devNote: $('#dev-note'), resetBtn: $('#form-reset'), card: $('#quote-card')
  };
  var typeBoxes = $$('input[type="checkbox"]', el.tipologia);

  /* ----- utilità ----- */
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmtSize(bytes) { return bytes < 1024 * 1024 ? Math.round(bytes / 1024) + ' KB' : (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'; }
  function selectedTypes() { return typeBoxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; }); }
  function activeMaterials() { var t = selectedTypes(); return CONFIG.configMaterials.filter(function (m) { return t.indexOf(m) !== -1; }); }

  function setError(fieldEl, errEl, message) {
    var wrap = fieldEl.closest('.field') || fieldEl;
    wrap.classList.toggle('is-invalid', !!message);
    if (fieldEl.matches('input, textarea, select')) fieldEl.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (errEl) { errEl.textContent = message || ''; errEl.hidden = !message; }
  }

  /* ----- validazione campi principali ----- */
  var validators = {
    nome: function () { return el.nome.value.trim().length >= 2 ? '' : MSG.nome; },
    email: function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.email.value.trim()) ? '' : MSG.email; },
    telefono: function () {
      var v = el.telefono.value.trim();
      var digits = v.replace(/\D/g, '');
      return /^[+\d][\d\s.\-/()]*$/.test(v) && digits.length >= 6 && digits.length <= 15 ? '' : MSG.telefono;
    },
    tipologia: function () { return selectedTypes().length ? '' : MSG.tipologia; },
    descrizione: function () { return el.descrizione.value.trim().length >= 15 ? '' : MSG.descrizione; },
    consenso: function () { return el.consenso.checked ? '' : MSG.consenso; }
  };
  function checkField(name) {
    var msg = validators[name]();
    var target = name === 'tipologia' ? el.tipologia : el[name];
    setError(target, $('#f-' + name + '-err'), msg);
    return !msg;
  }

  ['nome', 'email', 'telefono', 'descrizione'].forEach(function (name) {
    el[name].addEventListener('blur', function () { if (el[name].value.trim() || state.submitted) checkField(name); });
    el[name].addEventListener('input', function () { if (el[name].closest('.field').classList.contains('is-invalid')) checkField(name); });
  });
  el.consenso.addEventListener('change', function () { if (state.submitted) checkField('consenso'); });

  /* ----- tipologie + configuratore ----- */
  typeBoxes.forEach(function (box) {
    box.addEventListener('change', function () {
      if (state.submitted) checkField('tipologia');
      if (box.hasAttribute('data-config')) renderConfigurators();
    });
  });

  // I pulsanti "Richiedi informazioni" preselezionano la tipologia
  $$('[data-prefill]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = typeBoxes.filter(function (b) { return b.value === btn.dataset.prefill; })[0];
      if (box && !box.checked) { box.checked = true; box.dispatchEvent(new Event('change')); }
    });
  });

  // Tutti i link al preventivo portano direttamente al campo "Nome e cognome"
  var nomeInput = $('#f-nome');
  $$('a[href="#preventivo"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (!nomeInput) return;
      e.preventDefault();
      // Attende la chiusura del menu mobile prima di scorrere
      requestAnimationFrame(function () {
        // Mostra subito il riquadro del modulo (senza animazione) per misurarne la posizione esatta
        var revealParents = $$('.reveal').filter(function (r) { return r.contains(nomeInput); });
        revealParents.forEach(function (r) { r.style.transition = 'none'; r.classList.add('is-visible'); });
        var header = $('#site-header');
        var offset = (header ? header.offsetHeight : 0) + 24;
        var field = nomeInput.closest('.field') || nomeInput;
        var top = field.getBoundingClientRect().top + window.pageYOffset - offset;
        revealParents.forEach(function (r) { r.style.transition = ''; });
        window.scrollTo({ top: Math.max(top, 0), behavior: reducedMotion ? 'auto' : 'smooth' });
        nomeInput.focus({ preventScroll: true });
        if (history.replaceState) history.replaceState(null, '', '#preventivo');
      });
    });
  });

  function selectHtml(id, field, label, options, value, err) {
    var opts = '<option value="" disabled' + (value ? '' : ' selected') + '>Scegli</option>' +
      options.map(function (o) { return '<option' + (o === value ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('');
    return '<div class="field' + (err ? ' is-invalid' : '') + '">' +
      '<label class="label" for="' + id + '">' + label + '<span class="req" aria-hidden="true"> *</span></label>' +
      '<div class="select-wrap"><select class="control" id="' + id + '" data-field="' + field + '" required' + (err ? ' aria-invalid="true"' : '') + ' aria-describedby="' + id + '-err">' + opts + '</select>' +
      '<svg class="icon" aria-hidden="true"><use href="#i-chevron"/></svg></div>' +
      '<p class="error" id="' + id + '-err"' + (err ? '' : ' hidden') + '>' + (err || '') + '</p></div>';
  }
  function numberHtml(id, field, label, value, err, suffix, extraClass) {
    return '<div class="field' + (extraClass ? ' ' + extraClass : '') + (err ? ' is-invalid' : '') + '">' +
      '<label class="label" for="' + id + '">' + label + '<span class="req" aria-hidden="true"> *</span></label>' +
      '<div class="input-wrap"><input class="control" id="' + id + '" data-field="' + field + '" type="number" inputmode="numeric" min="1" max="' + (suffix ? 2000 : 999) + '" step="1" value="' + esc(value) + '"' + (err ? ' aria-invalid="true"' : '') + ' aria-describedby="' + id + '-err" required>' +
      (suffix ? '<span class="input-suffix" aria-hidden="true">' + suffix + '</span>' : '') + '</div>' +
      '<p class="error" id="' + id + '-err"' + (err ? '' : ' hidden') + '>' + (err || '') + '</p></div>';
  }

  function itemErrors(item) {
    var e = {};
    if (!item.product) e.product = MSG.product;
    if (!item.color) e.color = MSG.color;
    ['width', 'height'].forEach(function (k) { var n = Number(item[k]); if (!(n >= 1 && n <= 2000 && Number.isInteger(n))) e[k] = MSG.measure; });
    var q = Number(item.qty); if (!(q >= 1 && q <= 999 && Number.isInteger(q))) e.qty = MSG.qty;
    return e;
  }

  function renderConfigurators() {
    var html = activeMaterials().map(function (mat) {
      var items = state.configs[mat];
      var full = items.length >= CONFIG.maxItems;
      return '<div class="config" data-material="' + esc(mat) + '" role="group" aria-label="Configurazione infissi in ' + esc(mat) + '">' +
        '<div class="config-head"><p class="title title-xs">Configurazione infissi in ' + esc(mat) + '</p>' +
        '<span class="config-count">' + items.length + ' / ' + CONFIG.maxItems + '</span></div>' +
        '<div class="config-items">' + items.map(function (item, i) {
          var err = state.submitted ? itemErrors(item) : {};
          var p = 'cfg-' + item.id;
          return '<div class="config-item" data-id="' + item.id + '">' +
            '<div class="config-item-head"><span class="config-item-title">Infisso ' + (i + 1) + '</span>' +
            (items.length > 1 ? '<button type="button" class="config-remove" data-remove aria-label="Elimina infisso ' + (i + 1) + ' in ' + esc(mat) + '"><svg class="icon" aria-hidden="true"><use href="#i-trash"/></svg>Elimina</button>' : '') +
            '</div><div class="config-body"><div class="config-pair">' +
            selectHtml(p + '-product', 'product', 'Tipologia', CONFIG.productOptions, item.product, err.product) +
            selectHtml(p + '-color', 'color', 'Colore', CONFIG.colorOptions, item.color, err.color) +
            '</div><div class="config-triple">' +
            numberHtml(p + '-width', 'width', 'Larghezza', item.width, err.width, 'cm') +
            numberHtml(p + '-height', 'height', 'Altezza', item.height, err.height, 'cm') +
            numberHtml(p + '-qty', 'qty', 'Quantità', item.qty, err.qty, '', 'config-qty') +
            '</div></div></div>';
        }).join('') + '</div>' +
        (full ? '<p class="config-limit">Hai raggiunto il numero massimo di infissi per questo materiale.</p>'
              : '<button type="button" class="btn btn-outline btn-sm config-add" data-add><svg class="icon" aria-hidden="true"><use href="#i-plus"/></svg>Aggiungi infisso</button>') +
        '</div>';
    }).join('');
    el.configurators.innerHTML = html;
  }

  function findItem(target) {
    var box = target.closest('.config');
    var itemEl = target.closest('.config-item');
    if (!box) return null;
    var list = state.configs[box.dataset.material];
    var item = itemEl ? list.filter(function (it) { return String(it.id) === itemEl.dataset.id; })[0] : null;
    return { material: box.dataset.material, list: list, item: item, itemEl: itemEl };
  }

  el.configurators.addEventListener('input', function (e) {
    var f = e.target.dataset.field;
    var ref = f && findItem(e.target);
    if (!ref || !ref.item) return;
    ref.item[f] = e.target.value;
    if (state.submitted) {
      var msg = itemErrors(ref.item)[f] || '';
      setError(e.target, $('#' + e.target.id + '-err'), msg);
    }
  });
  el.configurators.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    var remove = e.target.closest('[data-remove]');
    if (!add && !remove) return;
    var ref = findItem(e.target);
    if (add && ref.list.length < CONFIG.maxItems) {
      var item = newItem();
      ref.list.push(item);
      renderConfigurators();
      var firstField = $('#cfg-' + item.id + '-color');
      if (firstField) firstField.focus();
    }
    if (remove && ref.item) {
      var idx = ref.list.indexOf(ref.item);
      ref.list.splice(idx, 1);
      renderConfigurators();
      var box = $('.config[data-material="' + ref.material + '"]');
      var next = box && ($$('[data-remove]', box)[Math.max(0, idx - 1)] || $('[data-add]', box) || $('select', box));
      if (next) next.focus();
    }
  });

  function configsValid() {
    var firstInvalid = null;
    activeMaterials().forEach(function (mat) {
      state.configs[mat].forEach(function (item) {
        var errs = itemErrors(item);
        if (!firstInvalid) {
          var key = ['product', 'color', 'width', 'height', 'qty'].filter(function (k) { return errs[k]; })[0];
          if (key) firstInvalid = 'cfg-' + item.id + '-' + key;
        }
      });
    });
    return firstInvalid;
  }

  function buildSummary() {
    var mats = activeMaterials();
    if (!mats.length) return '';
    var lines = [CONFIG.summaryTitle];
    mats.forEach(function (mat) {
      lines.push('', mat.toUpperCase());
      state.configs[mat].forEach(function (it, i) {
        lines.push((i + 1) + '. ' + it.product + ' – colore ' + it.color + ' – ' + it.width + ' × ' + it.height + ' cm (L × H) – quantità ' + it.qty);
      });
    });
    return lines.join('\n');
  }

  /* ----- foto: selezione, ridimensionamento, anteprima ----- */
  function totalBytes() { return state.files.reduce(function (s, f) { return s + f.blob.size; }, 0); }

  function compressImage(file) {
    if (typeof createImageBitmap !== 'function') return Promise.resolve(null);
    return createImageBitmap(file).then(function (bmp) {
      var scale = Math.min(1, CONFIG.maxImageSide / Math.max(bmp.width, bmp.height));
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(bmp.width * scale);
      canvas.height = Math.round(bmp.height * scale);
      canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
      if (bmp.close) bmp.close();
      return new Promise(function (resolve) { canvas.toBlob(resolve, 'image/jpeg', 0.82); });
    }).catch(function () { return null; }); // es. HEIC non decodificabile nel browser
  }

  function addFiles(fileList) {
    var incoming = Array.prototype.slice.call(fileList);
    var rejected = [];
    var chain = Promise.resolve();
    el.fileErr.hidden = true;
    incoming.forEach(function (file) {
      chain = chain.then(function () {
        var isImage = /^image\//.test(file.type) || /\.(heic|heif)$/i.test(file.name);
        if (!isImage) { rejected.push(file.name + ': non è un\'immagine'); return; }
        if (state.files.length >= CONFIG.maxFiles) { rejected.push(file.name + ': massimo ' + CONFIG.maxFiles + ' foto'); return; }
        if (file.size > CONFIG.maxFileMb * 1024 * 1024) { rejected.push(file.name + ': supera ' + CONFIG.maxFileMb + ' MB'); return; }
        return compressImage(file).then(function (out) {
          var blob = file, name = file.name;
          if (out && (out.size < file.size || !/jpe?g$/i.test(file.type.split('/')[1] || ''))) {
            blob = out;
            name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          }
          if (totalBytes() + blob.size > CONFIG.maxTotalMb * 1024 * 1024) {
            rejected.push(file.name + ': dimensione totale delle foto troppo elevata');
            return;
          }
          state.files.push({ blob: blob, name: name, url: URL.createObjectURL(blob) });
        });
      });
    });
    return chain.then(function () {
      renderFiles();
      if (rejected.length) {
        el.fileErr.innerHTML = 'Alcuni file non sono stati aggiunti (sono ammesse solo immagini, fino a ' + CONFIG.maxFiles + ' foto da massimo ' + CONFIG.maxFileMb + ' MB ciascuna):<br>' + rejected.map(esc).join('<br>');
        el.fileErr.hidden = false;
      }
    });
  }

  function renderFiles() {
    el.fileList.innerHTML = state.files.map(function (f, i) {
      return '<li class="file"><img src="' + f.url + '" alt="" onerror="this.style.visibility=\'hidden\'">' +
        '<span class="file-name">' + esc(f.name) + '</span><span class="file-size">' + fmtSize(f.blob.size) + '</span>' +
        '<button type="button" class="file-remove" data-index="' + i + '" aria-label="Rimuovi ' + esc(f.name) + '"><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button></li>';
    }).join('');
    var full = state.files.length >= CONFIG.maxFiles;
    el.dropButton.disabled = full;
    el.dropButton.textContent = full ? 'Hai raggiunto il numero massimo di foto' : 'Scegli le foto o trascinale qui';
  }

  el.dropButton.addEventListener('click', function () { el.fileInput.click(); });
  el.fileInput.addEventListener('change', function () { addFiles(el.fileInput.files).then(function () { el.fileInput.value = ''; }); });
  el.fileList.addEventListener('click', function (e) {
    var btn = e.target.closest('.file-remove');
    if (!btn) return;
    var f = state.files.splice(Number(btn.dataset.index), 1)[0];
    if (f) URL.revokeObjectURL(f.url);
    el.fileErr.hidden = true;
    renderFiles();
    el.dropButton.focus();
  });
  ['dragenter', 'dragover'].forEach(function (t) {
    el.drop.addEventListener(t, function (e) { e.preventDefault(); el.drop.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    el.drop.addEventListener(t, function (e) { e.preventDefault(); el.drop.classList.remove('is-dragover'); });
  });
  el.drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });

  /* ----- invio ----- */
  function setSending(sending) {
    el.submitBtn.disabled = sending;
    $('.submit-label', el.submitBtn).textContent = sending ? 'Invio in corso…' : 'Invia la richiesta di preventivo';
    var icon = $('.btn-arrow', el.submitBtn);
    var spin = $('.spinner', el.submitBtn);
    if (sending && !spin) { spin = document.createElement('span'); spin.className = 'spinner'; spin.setAttribute('aria-hidden', 'true'); el.submitBtn.appendChild(spin); }
    if (spin) spin.hidden = !sending;
    icon.style.display = sending ? 'none' : '';
  }

  function showSuccess() {
    form.hidden = true;
    el.success.hidden = false;
    el.devNote.hidden = !isLocalPreview;
    el.card.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    el.success.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    state.submitted = true;
    el.submitErr.hidden = true;

    var order = ['nome', 'email', 'telefono', 'tipologia'];
    var firstInvalid = null;
    order.forEach(function (n) { if (!checkField(n) && !firstInvalid) firstInvalid = n === 'tipologia' ? el.tipologia : el[n]; });
    renderConfigurators(); // mostra gli eventuali errori del configuratore
    var cfgInvalid = configsValid();
    if (cfgInvalid && !firstInvalid) firstInvalid = document.getElementById(cfgInvalid);
    ['descrizione', 'consenso'].forEach(function (n) { if (!checkField(n) && !firstInvalid) firstInvalid = el[n]; });

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      firstInvalid.focus({ preventScroll: true });
      return;
    }

    el.tipologiaValue.value = selectedTypes().join(', ');
    el.configValue.value = buildSummary();

    var data = new FormData(form);
    for (var i = 1; i <= CONFIG.maxFiles; i++) data.delete('foto_' + i);
    state.files.forEach(function (f, idx) { data.append('foto_' + (idx + 1), f.blob, f.name); });

    if (isLocalPreview) {
      // In locale Netlify Forms non è disponibile: si mostra il riepilogo in console.
      var preview = {};
      data.forEach(function (v, k) { preview[k] = v instanceof Blob ? v.name + ' (' + fmtSize(v.size) + ')' : v; });
      console.info('[Anteprima locale] Dati che verrebbero inviati a Netlify:', preview);
      showSuccess();
      return;
    }

    setSending(true);
    fetch('/', { method: 'POST', body: data })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); showSuccess(); })
      .catch(function () {
        el.submitErr.innerHTML = MSG.submit;
        el.submitErr.hidden = false;
        el.submitErr.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      })
      .then(function () { setSending(false); });
  });

  el.resetBtn.addEventListener('click', function () {
    form.reset();
    state.submitted = false;
    state.files.forEach(function (f) { URL.revokeObjectURL(f.url); });
    state.files = [];
    CONFIG.configMaterials.forEach(function (m) { state.configs[m] = [newItem()]; });
    $$('.is-invalid', form).forEach(function (n) { n.classList.remove('is-invalid'); });
    $$('.error', form).forEach(function (n) { n.hidden = true; });
    $$('[aria-invalid]', form).forEach(function (n) { n.removeAttribute('aria-invalid'); });
    renderFiles();
    renderConfigurators();
    el.success.hidden = true;
    form.hidden = false;
    el.nome.focus();
  });

  renderFiles();
})();
