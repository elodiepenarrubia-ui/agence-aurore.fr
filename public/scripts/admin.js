(function() {
  // ═══════════════════════════════════════════
  // AUTHENTIFICATION
  // ═══════════════════════════════════════════
  var ADMIN_KEY = 'admin-auth';
  var loginScreen = document.getElementById('login-screen');
  var adminApp = document.getElementById('admin-app');
  var API_TOKEN = adminApp.dataset.apiToken;
  var loginForm = document.getElementById('login-form');
  var loginPassword = document.getElementById('login-password');
  var loginError = document.getElementById('login-error');
  var ADMIN_PW = loginScreen.dataset.pw;

  function showAdmin() {
    loginScreen.style.display = 'none';
    adminApp.style.display = 'flex';
    initDevis();
  }

  if (sessionStorage.getItem(ADMIN_KEY) === 'ok') { showAdmin(); }
  else { loginScreen.style.display = 'flex'; adminApp.style.display = 'none'; }

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (loginPassword.value === ADMIN_PW) {
      sessionStorage.setItem(ADMIN_KEY, 'ok');
      showAdmin();
    } else { loginError.style.display = 'block'; loginPassword.focus(); }
  });
  loginPassword.addEventListener('keydown', function() { loginError.style.display = 'none'; });

  document.getElementById('btn-logout').addEventListener('click', function() {
    sessionStorage.removeItem(ADMIN_KEY);
    location.reload();
  });

  // ═══════════════════════════════════════════
  // NAVIGATION SIDEBAR
  // ═══════════════════════════════════════════
  var renderDashboard;

  document.querySelectorAll('.sidebar-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.sidebar-item').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.admin-section').forEach(function(s) { s.style.display = 'none'; });
      btn.classList.add('active');
      var el = document.getElementById('section-' + btn.dataset.section);
      if (el) el.style.display = 'block';
      if (btn.dataset.section === 'dashboard' && typeof renderDashboard === 'function') renderDashboard();
    });
  });

  // ═══════════════════════════════════════════
  // TOASTS
  // ═══════════════════════════════════════════
  function showToast(message, type, opts) {
    var container = document.getElementById('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    if (opts && opts.html) toast.innerHTML = message; else toast.textContent = message;
    if (opts && opts.wide) toast.style.maxWidth = '480px';
    container.appendChild(toast);
    toast.addEventListener('click', function(e) { if (e.target.tagName === 'A') return; toast.remove(); });
    setTimeout(function() { toast.remove(); }, opts && opts.duration ? opts.duration : 6000);
  }

  // ═══════════════════════════════════════════
  // GÉNÉRATEUR DE DEVIS
  // ═══════════════════════════════════════════
  var PRESETS = [
    { label: 'Pack Starter', prix: 290 },
    { label: 'Site Vitrine Essentiel', prix: 590 },
    { label: 'Site Vitrine Autonome', prix: 790 },
    { label: 'Vitrine Complet Essentiel', prix: 1100 },
    { label: 'Vitrine Complet Autonome', prix: 1490 },
    { label: 'Site R\u00E9servation Essentiel', prix: 1400 },
    { label: 'Site R\u00E9servation Autonome', prix: 1800 },
    { label: 'Migration', prix: 190 },
    { label: 'Logo seul', prix: 150 },
    { label: 'Charte graphique', prix: 100 },
    { label: 'Page suppl\u00E9mentaire', prix: 80 },
    { label: 'Formulaire contact', prix: 60 },
    { label: 'SEO on-page', prix: 150 },
    { label: 'Fiche Google Business', prix: 90 },
    { label: 'Search Console', prix: 60 },
    { label: 'Automatisation', prix: 100 },
    { label: 'Decap CMS', prix: 150 },
    { label: 'Emails pro (Zoho)', prix: 80 },
    { label: 'Domaine + config', prix: 60 },
    { label: 'Espace r\u00E9daction (Starter/Migration)', prix: 150 },
    { label: 'Session de modifications', prix: 30 },
    { label: 'Pack landing pages (10 pages SEO)', prix: 190 },
    { label: 'Support marketing', prix: 80 },
    { label: 'Maintenance technique', prix: 19 },
    { label: 'Maintenance + support', prix: 29 },
    { label: 'Cadrage logiciel m\u00E9tier', prix: 300 },
    { label: 'Personnalis\u00E9', prix: 0 },
  ];

  function initDevis() {
    var prestationsList = document.getElementById('prestations-list');
    var addBtn = document.getElementById('add-prestation');
    var downloadBtn = document.getElementById('btn-download');
    if (!prestationsList || !addBtn) { console.error('initDevis: \u00E9l\u00E9ments DOM introuvables'); return; }
    var currentTotalHT = 0;

    var devisCount = parseInt(localStorage.getItem('devis-counter') || '0', 10);
    devisCount++;
    localStorage.setItem('devis-counter', String(devisCount));
    var year = new Date().getFullYear();
    var numero = 'DEV-' + year + '-' + String(devisCount).padStart(3, '0');
    document.getElementById('devis-numero').value = numero;
    document.getElementById('devis-date').value = new Date().toISOString().split('T')[0];

    function createPrestaRow(presetLabel) {
      var row = document.createElement('div'); row.className = 'presta-row';
      var selectField = document.createElement('div'); selectField.className = 'field';
      var select = document.createElement('select'); select.className = 'input';
      var optDefault = document.createElement('option'); optDefault.value = ''; optDefault.textContent = 'Choisir une prestation...'; select.appendChild(optDefault);
      PRESETS.forEach(function(p) { var opt = document.createElement('option'); opt.value = p.label; opt.dataset.prix = p.prix; opt.textContent = p.label + (p.prix ? ' - ' + p.prix + ' \u20AC' : ''); select.appendChild(opt); });
      selectField.appendChild(select);
      var descField = document.createElement('div'); descField.className = 'field'; var descInput = document.createElement('input'); descInput.type = 'text'; descInput.className = 'input'; descInput.placeholder = 'Description'; descField.appendChild(descInput);
      var qtyField = document.createElement('div'); qtyField.className = 'field'; var qtyInput = document.createElement('input'); qtyInput.type = 'number'; qtyInput.className = 'input'; qtyInput.value = '1'; qtyInput.min = '1'; qtyField.appendChild(qtyInput);
      var prixField = document.createElement('div'); prixField.className = 'field'; var prixInput = document.createElement('input'); prixInput.type = 'number'; prixInput.className = 'input'; prixInput.value = '0'; prixInput.min = '0'; prixInput.step = '0.01'; prixField.appendChild(prixInput);
      var removeBtn = document.createElement('button'); removeBtn.type = 'button'; removeBtn.className = 'presta-remove'; removeBtn.innerHTML = '&times;'; removeBtn.title = 'Supprimer';
      row.appendChild(selectField); row.appendChild(descField); row.appendChild(qtyField); row.appendChild(prixField); row.appendChild(removeBtn);
      select.addEventListener('change', function() { var opt = select.options[select.selectedIndex]; if (opt.dataset.prix !== undefined && opt.value !== '') { prixInput.value = opt.dataset.prix; if (!descInput.value || PRESETS.some(function(p) { return p.label === descInput.value; })) { descInput.value = opt.value === 'Personnalis\u00E9' ? '' : opt.value; } } updatePreview(); });
      descInput.addEventListener('input', updatePreview); qtyInput.addEventListener('input', updatePreview); prixInput.addEventListener('input', updatePreview);
      removeBtn.addEventListener('click', function() { row.remove(); updatePreview(); });
      prestationsList.appendChild(row);
      if (presetLabel) { for (var pi = 0; pi < select.options.length; pi++) { if (select.options[pi].value === presetLabel) { select.selectedIndex = pi; select.dispatchEvent(new Event('change')); break; } } }
      updatePreview();
    }

    addBtn.addEventListener('click', function() { createPrestaRow(); });

    function formatMoney(n) { return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC'; }

    function updatePreview() {
      document.getElementById('p-client-nom').textContent = ((document.getElementById('client-prenom').value + ' ' + document.getElementById('client-nom').value).trim()) || '-';
      document.getElementById('p-client-entreprise').textContent = document.getElementById('client-entreprise').value;
      document.getElementById('p-client-email').textContent = document.getElementById('client-email').value;
      document.getElementById('p-client-tel').textContent = document.getElementById('client-tel').value;
      document.getElementById('p-client-adresse').textContent = document.getElementById('client-adresse').value;
      document.getElementById('p-numero').textContent = document.getElementById('devis-numero').value;
      var dateVal = document.getElementById('devis-date').value;
      if (dateVal) { var parts = dateVal.split('-'); document.getElementById('p-date').textContent = parts[2] + '/' + parts[1] + '/' + parts[0]; }
      document.getElementById('p-validite').textContent = document.getElementById('devis-validite').value;
      var tbody = document.getElementById('p-prestations-body'); if (!tbody) return; tbody.innerHTML = '';
      var rows = prestationsList ? prestationsList.querySelectorAll('.presta-row') : []; var totalHT = 0;
      if (rows.length === 0) { tbody.innerHTML = '<tr class="empty-row"><td colspan="4">Aucune prestation ajout\u00E9e</td></tr>'; }
      else { Array.prototype.forEach.call(rows, function(row) { var desc = row.querySelectorAll('input')[0].value || row.querySelector('select').value || '-'; var qty = parseFloat(row.querySelectorAll('input')[1].value) || 0; var pu = parseFloat(row.querySelectorAll('input')[2].value) || 0; var lineTotal = qty * pu; totalHT += lineTotal; var tr = document.createElement('tr'); tr.innerHTML = '<td>' + desc + '</td><td class="col-qty">' + qty + '</td><td class="col-pu">' + formatMoney(pu) + '</td><td class="col-total">' + formatMoney(lineTotal) + '</td>'; tbody.appendChild(tr); }); }
      currentTotalHT = totalHT;
      document.getElementById('total-ht').textContent = formatMoney(totalHT);
      document.getElementById('p-total').textContent = formatMoney(totalHT);
      var acomptePct = parseInt(document.getElementById('devis-acompte').value) || 0; var soldePct = 100 - acomptePct;
      document.getElementById('p-acompte').textContent = 'Acompte de ' + acomptePct + ' % \u00E0 la commande : ' + formatMoney(totalHT * acomptePct / 100);
      document.getElementById('p-solde').textContent = 'Solde de ' + soldePct + ' % \u00E0 la livraison : ' + formatMoney(totalHT * soldePct / 100);
      document.getElementById('p-delai').textContent = 'D\u00E9lai estim\u00E9 : ' + (document.getElementById('devis-delai').value || '-');
      var notes = document.getElementById('devis-notes').value; var pNotes = document.getElementById('p-notes');
      if (notes) { pNotes.textContent = notes; pNotes.style.display = ''; } else { pNotes.style.display = 'none'; }
    }

    ['client-prenom','client-nom','client-entreprise','client-email','client-tel','client-adresse','devis-numero','devis-date','devis-acompte','devis-validite','devis-delai','devis-notes'].forEach(function(id) { var el = document.getElementById(id); if (el) el.addEventListener('input', updatePreview); });

    function capitalizeValue(str) { return str.replace(/(^|\n|\s)(\S)/g, function(m, p, l) { return p + l.toUpperCase(); }); }
    ['client-prenom', 'client-nom', 'client-adresse'].forEach(function(id) { var el = document.getElementById(id); if (el) el.addEventListener('blur', function() { el.value = capitalizeValue(el.value); updatePreview(); }); });

    var params = new URLSearchParams(window.location.search);
    if (params.get('prenom')) document.getElementById('client-prenom').value = params.get('prenom');
    if (params.get('nom')) document.getElementById('client-nom').value = params.get('nom');
    if (params.get('email')) document.getElementById('client-email').value = params.get('email');
    if (params.get('tel')) document.getElementById('client-tel').value = params.get('tel');
    if (params.get('entreprise')) document.getElementById('client-entreprise').value = params.get('entreprise');

    var offreParam = params.get('offre');
    if (offreParam) { var presetMap = { 'starter': 'Pack Starter', 'vitrine': 'Site Vitrine Essentiel', 'pro': 'Site Vitrine Autonome', 'migration': 'Migration' }; var pl = presetMap[offreParam.toLowerCase()]; if (pl) createPrestaRow(pl); else createPrestaRow(); } else { createPrestaRow(); }
    updatePreview();

    // ─── LOCALSTORAGE DEVIS ───
    function getDevisHistory() { try { return JSON.parse(localStorage.getItem('devis-history') || '[]'); } catch(e) { return []; } }
    function saveDevisHistory(h) { localStorage.setItem('devis-history', JSON.stringify(h)); }
    function saveDevisToHistory(entry) { var h = getDevisHistory(); if (!h.some(function(d) { return d.id === entry.id; })) { h.unshift(entry); if (h.length > 50) h = h.slice(0, 50); saveDevisHistory(h); } renderDashboard(); }
    function updateDevisStatus(id, statut) { var h = getDevisHistory(); h.forEach(function(d) { if (d.id === id) d.statut = statut; }); saveDevisHistory(h); renderDashboard(); }
    function deleteDevis(id) { saveDevisHistory(getDevisHistory().filter(function(d) { return d.id !== id; })); renderDashboard(); }

    function clearFieldError(id) { var el = document.getElementById(id); if (!el) return; el.classList.remove('input-error'); var err = el.parentNode.querySelector('.field-error'); if (err) err.remove(); }
    function setFieldError(id, msg) { var el = document.getElementById(id); if (!el) return; clearFieldError(id); el.classList.add('input-error'); var errP = document.createElement('p'); errP.className = 'field-error'; errP.textContent = msg; el.parentNode.appendChild(errP); }
    var emailEl = document.getElementById('client-email'); if (emailEl) emailEl.addEventListener('input', function() { clearFieldError('client-email'); });

    // ─── PDF ───
    function generatePDF() {
      var jsPDF = window.jspdf.jsPDF; var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      var prenom = document.getElementById('client-prenom').value.trim(); var nom = document.getElementById('client-nom').value.trim(); var entreprise = document.getElementById('client-entreprise').value.trim(); var email = document.getElementById('client-email').value.trim(); var tel = document.getElementById('client-tel').value.trim(); var adresse = document.getElementById('client-adresse').value.trim(); var numero = document.getElementById('devis-numero').value; var dateVal = document.getElementById('devis-date').value; var validite = document.getElementById('devis-validite').value; var acomptePct = parseInt(document.getElementById('devis-acompte').value) || 50; var soldePct = 100 - acomptePct; var delai = document.getElementById('devis-delai').value; var notes = document.getElementById('devis-notes').value.trim();
      var dateFormatted = ''; if (dateVal) { var p = dateVal.split('-'); dateFormatted = p[2] + '/' + p[1] + '/' + p[0]; }
      function fmtMoney(n) { return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' \u20AC'; }
      var plEl = document.getElementById('prestations-list'); var rows = plEl ? plEl.querySelectorAll('.presta-row') : []; var prestations = []; var totalHT = 0;
      Array.prototype.forEach.call(rows, function(row) { var inputs = row.querySelectorAll('input'); var desc = inputs[0].value || row.querySelector('select').value || '-'; var qty = parseFloat(inputs[1].value) || 0; var pu = parseFloat(inputs[2].value) || 0; var lt = qty * pu; totalHT += lt; prestations.push({ desc: desc, qty: qty, pu: pu, total: lt }); });
      var acompteVal = totalHT * acomptePct / 100; var soldeVal = totalHT * soldePct / 100;
      var clientNomFile = (prenom + '-' + nom).trim().replace(/\s+/g, '-') || 'client'; var filename = 'Devis-Aurore-' + clientNomFile + '-' + numero + '.pdf';
      var mL = 20, mR = 20, mT = 18, pageW = 210, contentW = pageW - mL - mR, y = mT;
      function hexToRGB(hex) { return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]; }
      var ORANGE = hexToRGB('#FF6B1A'), BLACK = hexToRGB('#0A0A0A'), GRAY = hexToRGB('#999999'), GRAY_DARK = hexToRGB('#555555'), PALE_BG = hexToRGB('#FFF4EE'), CLIENT_BG = hexToRGB('#F7F7F7');
      function wrapText(text, maxWidth, fontSize) { doc.setFontSize(fontSize); var words = text.split(' '); var lines = []; var cur = ''; for (var i = 0; i < words.length; i++) { var test = cur ? cur + ' ' + words[i] : words[i]; if (doc.getTextWidth(test) > maxWidth && cur) { lines.push(cur); cur = words[i]; } else { cur = test; } } if (cur) lines.push(cur); return lines; }
      doc.setFont('helvetica','bold'); doc.setFontSize(20); doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]); doc.text('aur',mL,y); var aurW=doc.getTextWidth('aur'); doc.setTextColor(ORANGE[0],ORANGE[1],ORANGE[2]); doc.text('o',mL+aurW,y); var oW=doc.getTextWidth('o'); doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]); doc.text('re',mL+aurW+oW,y);
      doc.setTextColor(ORANGE[0],ORANGE[1],ORANGE[2]); doc.setFontSize(22); doc.text('DEVIS',pageW-mR,y,{align:'right'});
      y+=4; doc.setFillColor(ORANGE[0],ORANGE[1],ORANGE[2]); doc.rect(mL,y,contentW,1,'F'); y+=6;
      var emY=y; doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]); doc.text('\u00C9lodie Penarrubia',mL,emY); emY+=4;
      doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(GRAY_DARK[0],GRAY_DARK[1],GRAY_DARK[2]);
      ['Entrepreneur individuel','Nom commercial : Aurore','17 rue Ferm\u00E9e, 13100 Aix-en-Provence','elodie@agence-aurore.fr','06 59 65 92 18','SIRET 91387543100029 - Code APE 62.01Z'].forEach(function(l){doc.text(l,mL,emY);emY+=3.5;});
      var infoY=y; doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]); doc.text('Devis n\u00B0 '+numero,pageW-mR,infoY,{align:'right'}); infoY+=4.5; doc.setFontSize(8); doc.text('Date : '+dateFormatted,pageW-mR,infoY,{align:'right'}); infoY+=4; doc.text('Validit\u00E9 : '+validite,pageW-mR,infoY,{align:'right'});
      y=Math.max(emY,infoY)+6;
      var clientLines=[]; var clientName=(prenom+' '+nom).trim(); if(clientName) clientLines.push({text:clientName,bold:true}); if(entreprise) clientLines.push({text:entreprise,bold:false}); if(email) clientLines.push({text:email,bold:false}); if(tel) clientLines.push({text:tel,bold:false}); if(adresse) adresse.split('\n').forEach(function(l){clientLines.push({text:l,bold:false});});
      var clientBlockH=10+clientLines.length*4; doc.setFillColor(CLIENT_BG[0],CLIENT_BG[1],CLIENT_BG[2]); doc.roundedRect(mL,y,contentW,clientBlockH,2,2,'F');
      var cY=y+5; doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]); doc.text('CLIENT',mL+5,cY); cY+=4;
      clientLines.forEach(function(cl){doc.setFont('helvetica',cl.bold?'bold':'normal');doc.setFontSize(cl.bold?9:8);doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.text(cl.text,mL+5,cY);cY+=4;});
      y+=clientBlockH+6;
      var colDescW=contentW-50,colQtyW=15,colPuW=20,colTotW=15,colQtyX=mL+colDescW,colPuX=colQtyX+colQtyW,colTotX=colPuX+colPuW,rowH=7;
      doc.setFillColor(ORANGE[0],ORANGE[1],ORANGE[2]); doc.roundedRect(mL,y,contentW,rowH,1.5,1.5,'F'); doc.rect(mL,y+1.5,contentW,rowH-1.5,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(255,255,255); var hdrY=y+5;
      doc.text('DESCRIPTION',mL+3,hdrY); doc.text('QT\u00C9',colQtyX+colQtyW-2,hdrY,{align:'right'}); doc.text('PRIX UNIT.',colPuX+colPuW-2,hdrY,{align:'right'}); doc.text('TOTAL',colTotX+colTotW-2,hdrY,{align:'right'}); y+=rowH;
      doc.setFontSize(8);
      if(prestations.length===0){doc.setFont('helvetica','italic');doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.text('Aucune prestation',mL+contentW/2,y+5,{align:'center'});y+=rowH+3;}
      else{prestations.forEach(function(pr,i){if(i%2===1){doc.setFillColor(PALE_BG[0],PALE_BG[1],PALE_BG[2]);doc.rect(mL,y,contentW,rowH,'F');}doc.setDrawColor(240,240,240);doc.setLineWidth(0.2);doc.line(mL,y+rowH,mL+contentW,y+rowH);var rY=y+5;doc.setFont('helvetica','normal');doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);var descText=pr.desc;var maxDescW=colDescW-6;if(doc.getTextWidth(descText)>maxDescW){while(doc.getTextWidth(descText+'...')>maxDescW&&descText.length>0)descText=descText.slice(0,-1);descText+='...';}doc.text(descText,mL+3,rY);doc.text(String(pr.qty),colQtyX+colQtyW-2,rY,{align:'right'});doc.text(fmtMoney(pr.pu),colPuX+colPuW-2,rY,{align:'right'});doc.text(fmtMoney(pr.total),colTotX+colTotW-2,rY,{align:'right'});y+=rowH;});}
      doc.setFillColor(ORANGE[0],ORANGE[1],ORANGE[2]);doc.rect(mL,y,contentW,0.6,'F');y+=0.6;doc.setFillColor(PALE_BG[0],PALE_BG[1],PALE_BG[2]);doc.rect(mL,y,contentW,9,'F');doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.text('Total HT',mL+4,y+6.5);doc.setTextColor(ORANGE[0],ORANGE[1],ORANGE[2]);doc.text(fmtMoney(totalHT),mL+contentW-4,y+6.5,{align:'right'});y+=12;
      doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.text('TVA non applicable, art. 293B du CGI',mL,y);y+=7;
      doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.text('Conditions de paiement',mL,y);y+=4.5;doc.setFont('helvetica','normal');doc.setFontSize(8);
      ['Acompte de '+acomptePct+' % \u00E0 la commande : '+fmtMoney(acompteVal),'Solde de '+soldePct+' % \u00E0 la livraison : '+fmtMoney(soldeVal),'D\u00E9lai estim\u00E9 : '+delai].forEach(function(cl){doc.text(cl,mL,y);y+=3.8;});
      if(notes){doc.setFont('helvetica','italic');wrapText(notes,contentW,8).forEach(function(nl){doc.text(nl,mL,y);y+=3.8;});doc.setFont('helvetica','normal');}y+=4;
      doc.setFontSize(6.5);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
      ['En cas de retard de paiement, des p\u00E9nalit\u00E9s au taux de 3 fois le taux d\'int\u00E9r\u00EAt l\u00E9gal seront appliqu\u00E9es, ainsi qu\'une indemnit\u00E9 forfaitaire de recouvrement de 40 \u20AC (art. L441-10 du Code de commerce).','Ce devis peut \u00EAtre accept\u00E9 par retour d\'email confirmant votre accord explicite (art. 1366-1367 du Code civil). La cr\u00E9ation d\u00E9butera apr\u00E8s un appel de lancement et r\u00E9ception de l\'acompte.','Ce devis est valable 30 jours. Sa signature vaut acceptation des CGV disponibles sur agence-aurore.fr/cgv/'].forEach(function(leg){wrapText(leg,contentW,6.5).forEach(function(wl){doc.text(wl,mL,y);y+=3;});y+=1;});y+=3;
      doc.setDrawColor(200,200,200);doc.setLineWidth(0.3);doc.line(mL,y,mL+contentW,y);y+=5;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.text('Bon pour accord - Lu et approuv\u00E9',mL,y);y+=8;doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('Date : _______________',mL,y);doc.text('Signature :',mL+80,y);y+=16;doc.setDrawColor(200,200,200);doc.setLineWidth(0.3);doc.line(mL+80,y,mL+140,y);y+=8;
      doc.setDrawColor(240,240,240);doc.setLineWidth(0.2);doc.line(mL,y,mL+contentW,y);y+=4;doc.setFontSize(6.5);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.text('Aurore - \u00C9lodie Penarrubia - SIRET 91387543100029 - agence-aurore.fr',pageW/2,y,{align:'center'});
      return{instance:{save:function(){return new Promise(function(resolve){doc.save(filename);resolve();});},outputPdf:function(){return new Promise(function(resolve){resolve(doc.output('arraybuffer'));});}},cleanup:function(){}};
    }

    downloadBtn.addEventListener('click', function() { downloadBtn.disabled = true; downloadBtn.textContent = 'G\u00E9n\u00E9ration...'; var pdf = generatePDF(); pdf.instance.save().then(function() { pdf.cleanup(); downloadBtn.disabled = false; downloadBtn.textContent = 'T\u00E9l\u00E9charger le PDF'; }).catch(function() { pdf.cleanup(); downloadBtn.disabled = false; downloadBtn.textContent = 'T\u00E9l\u00E9charger le PDF'; }); });

    // ─── ENVOI ───
    var sendBtn = document.getElementById('btn-send');
    sendBtn.addEventListener('click', function() {
      var email = document.getElementById('client-email').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('client-email', 'Email invalide ou manquant'); return; }
      sendBtn.disabled = true; sendBtn.innerHTML = '<span class="spinner"></span>Envoi en cours...';
      var prenom = document.getElementById('client-prenom').value.trim(); var nom = document.getElementById('client-nom').value.trim();
      var devisNumber = document.getElementById('devis-numero').value; var totalHT = currentTotalHT;
      var pdf = generatePDF();
      pdf.instance.outputPdf('arraybuffer').then(function(ab) { pdf.cleanup(); var bytes = new Uint8Array(ab); var bin = ''; for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]); return fetch('/api/send-devis', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-token': API_TOKEN }, body: JSON.stringify({ pdfBase64: btoa(bin), clientEmail: email, clientName: (prenom + ' ' + nom).trim(), devisNumber: devisNumber, totalHT: totalHT }) }); })
      .then(function(r) { return r.json(); }).then(function(data) {
        if (data.success) { showToast('Devis envoy\u00E9 \u00E0 ' + email, 'success'); sendBtn.innerHTML = '&#10003; Envoy\u00E9';
          var nt = 0; prestationsList.querySelectorAll('.presta-row').forEach(function(row) { var q = parseFloat(row.querySelectorAll('input')[1].value) || 0; var p = parseFloat(row.querySelectorAll('input')[2].value) || 0; nt += q * p; });
          var dv = document.getElementById('devis-date').value; var dp = dv ? dv.split('-') : []; var df = dp.length === 3 ? dp[2]+'/'+dp[1]+'/'+dp[0] : dv;
          saveDevisToHistory({ id: devisNumber, date: df, clientName: (prenom+' '+nom).trim(), clientEmail: email, totalHT: nt, acomptePct: parseFloat(document.getElementById('devis-acompte').value) || 50, statut: 'envoy\u00E9' });
        } else { showToast(data.error || 'Erreur envoi', 'error'); sendBtn.disabled = false; sendBtn.innerHTML = '&#9993; Envoyer au client'; }
      }).catch(function(err) { showToast('Erreur : ' + err.message, 'error'); sendBtn.disabled = false; sendBtn.innerHTML = '&#9993; Envoyer au client'; });
    });

    // ─── FACTURE ───
    var invoiceBtn = document.getElementById('btn-invoice');
    invoiceBtn.addEventListener('click', function() {
      var email = document.getElementById('client-email').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldError('client-email', 'Email invalide ou manquant'); return; }
      if (currentTotalHT <= 0) { showToast('Ajoutez au moins une prestation', 'warning'); return; }
      invoiceBtn.disabled = true; invoiceBtn.innerHTML = '<span class="spinner"></span>Envoi...';
      var prenom = document.getElementById('client-prenom').value.trim(); var nom = document.getElementById('client-nom').value.trim();
      var devisNumber = document.getElementById('devis-numero').value; var acomptePct = parseFloat(document.getElementById('devis-acompte').value) || 50;
      fetch('/api/send-invoice', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-token': API_TOKEN }, body: JSON.stringify({ clientEmail: email, clientName: (prenom+' '+nom).trim(), devisNumber: devisNumber, totalHT: currentTotalHT, acomptePct: acomptePct, description: 'Acompte '+acomptePct+'% - Devis '+devisNumber }) })
      .then(function(r) { return r.json(); }).then(function(data) { if (data.success) { var m = (currentTotalHT*acomptePct/100).toFixed(2).replace('.',','); showToast('Facture envoy\u00E9e \u00E0 '+email+' - '+m+' \u20AC', 'success'); invoiceBtn.innerHTML = '&#10003; Facture envoy\u00E9e'; } else { showToast(data.error||'Erreur facturation','error'); invoiceBtn.disabled=false; invoiceBtn.innerHTML='\u20AC Facture d\u2019acompte'; } }).catch(function(err) { showToast('Erreur : '+err.message,'error'); invoiceBtn.disabled=false; invoiceBtn.innerHTML='\u20AC Facture d\u2019acompte'; });
    });

    // ─── DASHBOARD ───
    function statusToClass(s){var m={'envoy\u00E9':'envoye','factur\u00E9':'facture','sold\u00E9':'solde','refus\u00E9':'refuse','livr\u00E9':'livre'};return m[s]||'envoye';}
    function statusLabel(s){var m={'envoy\u00E9':'Envoy\u00E9','factur\u00E9':'Factur\u00E9','sold\u00E9':'Sold\u00E9','refus\u00E9':'Refus\u00E9','livr\u00E9':'Livr\u00E9'};return m[s]||s;}

    renderDashboard = function() {
      var tbody = document.getElementById('dashboard-body'); var history = getDevisHistory().slice(0, 10);
      if (history.length === 0) { tbody.innerHTML = '<tr class="dashboard-empty"><td colspan="6">Aucun devis envoy\u00E9</td></tr>'; return; }
      tbody.innerHTML = '';
      history.forEach(function(d) {
        var tr = document.createElement('tr'); var tf = d.totalHT.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' \u20AC';
        var isFact=d.statut==='factur\u00E9',isSolde=d.statut==='sold\u00E9',isRef=d.statut==='refus\u00E9',isEnv=d.statut==='envoy\u00E9',isLiv=d.statut==='livr\u00E9';
        var a='';
        if(!isFact&&!isSolde&&!isRef&&!isLiv){a+='<button class="btn-dash btn-dash-invoice" data-action="invoice" data-id="'+d.id+'">\u20AC Facturer</button>';a+='<button class="btn-dash btn-dash-refuse" data-action="refuse" data-id="'+d.id+'">\u2715 Refus\u00E9</button>';}
        if(isEnv){a+='<button class="btn-dash btn-dash-paid" data-action="paid" data-id="'+d.id+'">\u2713 Marquer pay\u00E9</button>';}
        if(isFact){a+='<button class="btn-dash btn-dash-solde" data-action="solde" data-id="'+d.id+'">\u20AC Solde</button>';a+='<button class="btn-dash btn-dash-preview" data-action="preview" data-id="'+d.id+'">\uD83D\uDD0D Preview</button>';}
        if(isSolde){a+='<button class="btn-dash btn-dash-livraison" data-action="livraison" data-id="'+d.id+'">\uD83D\uDE80 Livr\u00E9</button>';}
        a+='<button class="btn-dash btn-dash-delete" data-action="delete" data-id="'+d.id+'">\uD83D\uDDD1</button>';
        tr.innerHTML='<td><strong>'+d.id+'</strong></td><td>'+(d.date||'-')+'</td><td>'+d.clientName+'<br><span style="color:var(--gray-500);font-size:11px;">'+d.clientEmail+'</span></td><td>'+tf+'</td><td><span class="badge badge-'+statusToClass(d.statut)+'">'+statusLabel(d.statut)+'</span></td><td><div class="dashboard-actions">'+a+'</div></td>';
        tbody.appendChild(tr);
      });
    };

    document.getElementById('dashboard-body').addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action]'); if (!btn) return;
      var action = btn.dataset.action, id = btn.dataset.id, history = getDevisHistory(), devis = history.find(function(d){return d.id===id;}); if (!devis) return;
      if(action==='delete'){if(!confirm('Supprimer '+id+' ?'))return;deleteDevis(id);return;}
      if(action==='refuse'){updateDevisStatus(id,'refus\u00E9');return;}
      if(action==='paid'){updateDevisStatus(id,'factur\u00E9');showToast('Devis '+id+' marqu\u00E9 pay\u00E9','success');return;}
      if(action==='invoice'){btn.disabled=true;btn.textContent='...';var ap=devis.acomptePct||50;fetch('/api/send-invoice',{method:'POST',headers:{'Content-Type':'application/json','x-api-token':API_TOKEN},body:JSON.stringify({clientEmail:devis.clientEmail,clientName:devis.clientName,devisNumber:devis.id,totalHT:devis.totalHT,acomptePct:ap,description:'Acompte '+ap+'% - Devis '+devis.id})}).then(function(r){return r.json();}).then(function(data){if(data.success){updateDevisStatus(id,'factur\u00E9');var m=(devis.totalHT*ap/100).toFixed(2).replace('.',',');showToast('Facture envoy\u00E9e \u00E0 '+devis.clientEmail+' - '+m+' \u20AC','success');}else{showToast(data.error||'Erreur','error');btn.disabled=false;btn.textContent='\u20AC Facturer';}}).catch(function(err){showToast('Erreur : '+err.message,'error');btn.disabled=false;btn.textContent='\u20AC Facturer';});}
      if(action==='solde'){btn.disabled=true;btn.textContent='...';var aps=devis.acomptePct||50;fetch('/api/send-solde',{method:'POST',headers:{'Content-Type':'application/json','x-api-token':API_TOKEN},body:JSON.stringify({clientEmail:devis.clientEmail,clientName:devis.clientName,devisNumber:devis.id,totalHT:devis.totalHT,acomptePct:aps})}).then(function(r){return r.json();}).then(function(data){if(data.success){updateDevisStatus(id,'sold\u00E9');var sp=100-aps;var m=(devis.totalHT*sp/100).toFixed(2).replace('.',',');showToast('Facture solde envoy\u00E9e - '+m+' \u20AC','solde');}else{showToast(data.error||'Erreur','error');btn.disabled=false;btn.textContent='\u20AC Solde';}}).catch(function(err){showToast('Erreur : '+err.message,'error');btn.disabled=false;btn.textContent='\u20AC Solde';});}
      if(action==='preview'){window._previewDevisId=id;document.getElementById('preview-url-input').value='';document.getElementById('modal-preview').style.display='flex';}
      if(action==='livraison'){window._livraisonDevisId=id;document.getElementById('livraison-url').value='';document.getElementById('livraison-cms-login').value='';document.getElementById('livraison-cms-password').value='';document.getElementById('livraison-comptes').value='';document.getElementById('modal-livraison').style.display='flex';}
    });

    // ─── MODALES ───
    document.getElementById('btn-cancel-preview').addEventListener('click',function(){document.getElementById('modal-preview').style.display='none';});
    document.getElementById('modal-preview').addEventListener('click',function(e){if(e.target===this)this.style.display='none';});
    document.getElementById('btn-confirm-preview').addEventListener('click',function(){var url=document.getElementById('preview-url-input').value.trim();if(!url){showToast('URL requise','error');return;}var id=window._previewDevisId;var h=getDevisHistory();var d=h.find(function(x){return x.id===id;});if(!d)return;var b=document.getElementById('btn-confirm-preview');b.disabled=true;b.textContent='Envoi...';fetch('/api/send-preview',{method:'POST',headers:{'Content-Type':'application/json','x-api-token':API_TOKEN},body:JSON.stringify({clientEmail:d.clientEmail,clientPrenom:d.clientName?d.clientName.split(' ')[0]:'',previewUrl:url,devisNumber:d.id})}).then(function(r){return r.json();}).then(function(data){if(data.success){document.getElementById('modal-preview').style.display='none';showToast('Preview envoy\u00E9','success');}else showToast(data.error||'Erreur','error');b.disabled=false;b.textContent='Envoyer au client';}).catch(function(err){showToast('Erreur : '+err.message,'error');b.disabled=false;b.textContent='Envoyer au client';});});
    document.getElementById('btn-cancel-livraison').addEventListener('click',function(){document.getElementById('modal-livraison').style.display='none';});
    document.getElementById('modal-livraison').addEventListener('click',function(e){if(e.target===this)this.style.display='none';});
    document.getElementById('btn-confirm-livraison').addEventListener('click',function(){var url=document.getElementById('livraison-url').value.trim();if(!url){showToast('URL requise','error');return;}var id=window._livraisonDevisId;var h=getDevisHistory();var d=h.find(function(x){return x.id===id;});if(!d)return;var b=document.getElementById('btn-confirm-livraison');b.disabled=true;b.textContent='Envoi...';fetch('/api/send-livraison',{method:'POST',headers:{'Content-Type':'application/json','x-api-token':API_TOKEN},body:JSON.stringify({clientEmail:d.clientEmail,clientPrenom:d.clientName?d.clientName.split(' ')[0]:'',siteUrl:url,cmsUrl:document.getElementById('livraison-cms-login').value.trim(),cmsPassword:document.getElementById('livraison-cms-password').value.trim(),comptes:document.getElementById('livraison-comptes').value.trim(),devisNumber:d.id})}).then(function(r){return r.json();}).then(function(data){if(data.success){updateDevisStatus(id,'livr\u00E9');document.getElementById('modal-livraison').style.display='none';showToast('Email livraison envoy\u00E9','success');}else showToast(data.error||'Erreur','error');b.disabled=false;b.textContent='Envoyer l\u2019email de livraison';}).catch(function(err){showToast('Erreur : '+err.message,'error');b.disabled=false;b.textContent='Envoyer l\u2019email de livraison';});});

    renderDashboard();
  }

  // ═══════════════════════════════════════════
  // AUDIT SEO
  // ═══════════════════════════════════════════
  var lastAuditData=null,lastProspectName='',lastChecks=[],lastScore=0;
  function escapeHtml(s){if(!s)return '';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function getRecommendation(score){if(score<=4)return{text:'Ce site n\u00E9cessite une refonte compl\u00E8te.',action:'Migration recommand\u00E9e.',color:'#DC2626',bg:'#FEF2F2'};if(score<=6)return{text:'Des corrections cibl\u00E9es am\u00E9lioreraient le r\u00E9f\u00E9rencement.',action:'Corriger les points critiques en rouge.',color:'#D97706',bg:'#FFFBEB'};if(score<=8)return{text:'Bon niveau technique, quelques optimisations recommand\u00E9es.',action:'Focus sur les points orange.',color:'#2563EB',bg:'#EFF6FF'};return{text:'Excellent niveau SEO technique.',action:'Continuez \u00E0 publier r\u00E9guli\u00E8rement.',color:'#16A34A',bg:'#F0FDF4'};}

  document.getElementById('btn-analyze').addEventListener('click',function(){
    var url=document.getElementById('audit-url').value.trim(),name=document.getElementById('audit-name').value.trim(),errorEl=document.getElementById('analyze-error');errorEl.style.display='none';
    if(!url){errorEl.textContent='URL requise';errorEl.style.display='block';return;}if(!name){errorEl.textContent='Nom requis';errorEl.style.display='block';return;}
    if(!url.startsWith('http'))url='https://'+url;
    var btn=this;btn.disabled=true;btn.textContent='Analyse en cours...';
    var rd=document.getElementById('audit-results');rd.style.display='block';rd.innerHTML='<div class="audit-loading"><div class="audit-spinner"></div><p style="margin-top:12px;color:var(--gray-500);font-size:14px;">Analyse de '+url+'...</p></div>';
    fetch('/api/audit-seo',{method:'POST',headers:{'Content-Type':'application/json','x-api-token':API_TOKEN},body:JSON.stringify({url:url})})
    .then(function(r){return r.json();}).then(function(data){if(data.error){rd.innerHTML='<div class="audit-loading"><p style="color:#dc2626;">'+data.error+'</p></div>';}else{lastAuditData=data;lastProspectName=name;rd.innerHTML=renderAuditResults(data,name);var cb=document.getElementById('btn-copy-report');if(cb)cb.addEventListener('click',function(){navigator.clipboard.writeText(generateTextReport()).then(function(){showToast('Rapport copi\u00E9','success');});});}btn.disabled=false;btn.textContent='Analyser le site \u2192';}).catch(function(err){rd.innerHTML='<div class="audit-loading"><p style="color:#dc2626;">Erreur : '+err.message+'</p></div>';btn.disabled=false;btn.textContent='Analyser le site \u2192';});
  });

  function renderAuditCheck(c){var icon=c.status==='ok'?'\u2713':c.status==='warning'?'\u26A0':'\u2717';var color=c.status==='ok'?'#16A34A':c.status==='warning'?'#D97706':'#DC2626';var bg=c.status==='ok'?'#F0FDF4':c.status==='warning'?'#FFFBEB':'#FEF2F2';var h='<div class="audit-item" style="background:'+bg+';"><span class="audit-icon" style="color:'+color+'">'+icon+'</span><div class="audit-item-content"><span class="audit-label">'+c.label+'</span><span class="audit-value">'+escapeHtml(c.value)+'</span>'+(c.detail?'<span class="audit-detail">'+escapeHtml(c.detail)+'</span>':'');if(c.extra&&c.extra.length>0){h+='<span class="audit-schema-types">Types : ';c.extra.forEach(function(t){h+='<code>'+escapeHtml(t)+'</code>';});h+='</span>';}h+='</div></div>';return h;}

  function renderAuditResults(data,pn){
    var sc=data.schema||{},co=data.content||{},pe=data.perf||{},sp=0;
    if(!data.title)sp+=2;else if(data.title.length<=30||data.title.length>=65)sp+=1;if(!data.metaDescription)sp+=1;if(!data.h1)sp+=2;if(!sc.hasLocalBusiness)sp+=1;if(!data.httpsEnabled)sp+=2;if(data.keywordStuffing)sp+=2;if(['Wix','Webador','Squarespace'].indexOf(data.platform)!==-1)sp+=1;if(co.wordCount<150)sp+=1;
    var checks=[
      {label:'HTTPS',status:data.httpsEnabled?'ok':'error',value:data.httpsEnabled?'Oui':'Non',detail:data.httpsEnabled?'':'Pas de HTTPS (-2 pts)'},
      {label:'Balise Title',status:data.title?(data.title.length>30&&data.title.length<65?'ok':'warning'):'error',value:data.title||'Absente',detail:data.title?data.title.length+' car.'+(data.title.length<=30||data.title.length>=65?' (-1 pt)':''):'Absente (-2 pts)'},
      {label:'Meta Description',status:data.metaDescription?(data.metaDescription.length>100?'ok':'warning'):'error',value:data.metaDescription?data.metaDescription.length+' car.':'Absente',detail:data.metaDescription?(data.metaDescription.length<=100?'Courte':''):'Absente (-1 pt)'},
      {label:'Balise H1',status:data.h1?'ok':'error',value:data.h1||'Absente',detail:data.h1?'':'Absent (-2 pts)'},
      {label:'Schema.org',status:sc.hasSchema?'ok':'warning',value:sc.hasSchema?sc.types.length+' type(s)':'Absent',detail:sc.hasSchema?'':'Invisible pour les IA',extra:sc.types&&sc.types.length>0?sc.types:null},
      {label:'LocalBusiness',status:sc.hasLocalBusiness?'ok':'error',value:sc.hasLocalBusiness?'Pr\u00E9sent':'Absent',detail:sc.hasLocalBusiness?'':'(-1 pt)'},
      {label:'FAQPage',status:sc.hasFAQPage?'ok':'warning',value:sc.hasFAQPage?'Pr\u00E9sent':'Absent',detail:sc.hasFAQPage?'':'Invisible pour les IA'},
      {label:'Review/Avis',status:sc.hasReview?'ok':'warning',value:sc.hasReview?'Pr\u00E9sent':'Absent',detail:sc.hasReview?'':'Pas d\u2019\u00E9toiles Google'},
      {label:'Google Analytics',status:data.hasGoogleAnalytics?'ok':'warning',value:data.hasGoogleAnalytics?'D\u00E9tect\u00E9':'Non',detail:data.hasGoogleAnalytics?'':'Pas de suivi'},
      {label:'Canonical',status:data.hasCanonical?'ok':'warning',value:data.hasCanonical?'Pr\u00E9sente':'Absente',detail:''},
      {label:'Sitemap',status:data.hasSitemap?'ok':'warning',value:data.hasSitemap?'Pr\u00E9sent':'Absent',detail:data.hasSitemap?'':'Indexation difficile'},
      {label:'Robots.txt',status:data.hasRobots?'ok':'warning',value:data.hasRobots?'Pr\u00E9sent':'Absent',detail:''},
      {label:'Images sans alt',status:data.imagesWithoutAlt===0?'ok':'warning',value:data.imagesWithoutAlt+'/'+data.imageCount,detail:data.imagesWithoutAlt>0?'Images sans alt':''},
      {label:'Contenu',status:co.wordCount>300?'ok':co.wordCount>150?'warning':'error',value:co.wordCount+' mots',detail:co.wordCount<150?'Insuffisant (-1 pt)':co.wordCount<300?'L\u00E9ger':''},
      {label:'FAQ',status:co.hasFAQ?'ok':'warning',value:co.hasFAQ?'D\u00E9tect\u00E9e':'Absente',detail:''},
      {label:'Blog',status:co.hasBlog?'ok':'warning',value:co.hasBlog?'D\u00E9tect\u00E9':'Absent',detail:co.hasBlog?'':'Pas de longue tra\u00EEne'},
      {label:'NAP',status:co.hasAddress&&co.hasPhone?'ok':'warning',value:co.hasAddress&&co.hasPhone?'Pr\u00E9sent':'Incomplet',detail:''},
      {label:'Keyword stuffing',status:data.keywordStuffing?'error':'ok',value:data.keywordStuffing?'D\u00E9tect\u00E9':'Non',detail:data.keywordStuffing?'(-2 pts)':''},
      {label:'Taille page',status:pe.pageSizeKb<200?'ok':'warning',value:pe.pageSizeKb+' Ko',detail:pe.pageSizeKb>200?'Page lourde':''},
      {label:'Scripts JS',status:pe.scriptCount<10?'ok':'warning',value:pe.scriptCount+' scripts',detail:pe.scriptCount>=10?'Trop de scripts':''},
      {label:'WebP',status:pe.hasWebP?'ok':'warning',value:pe.hasWebP?'Oui':'Non',detail:pe.hasWebP?'':'Format moderne manquant'},
      {label:'Lazy Loading',status:pe.hasLazyLoading?'ok':'warning',value:pe.hasLazyLoading?'Activ\u00E9':'Non',detail:''},
      {label:'Plateforme',status:['Wix','Webador','Squarespace'].indexOf(data.platform)!==-1?'error':['WordPress','Jimdo'].indexOf(data.platform)!==-1?'warning':'ok',value:data.platform,detail:['Wix','Webador','Squarespace'].indexOf(data.platform)!==-1?'(-1 pt)':''},
    ];
    lastChecks=checks;var score=Math.max(0,Math.min(10,10-sp));lastScore=score;
    var scoreColor=score>=7?'#16A34A':score>=4?'#D97706':'#DC2626';var reco=getRecommendation(score);
    var html='<div class="audit-header"><h2>'+escapeHtml(pn)+'</h2><a href="'+escapeHtml(data.url)+'" target="_blank">'+escapeHtml(data.url)+'</a><div class="audit-score" style="color:'+scoreColor+'">Score SEO : <strong>'+score+'/10</strong></div><div style="background:'+reco.bg+';border-radius:8px;padding:16px 20px;margin-top:16px;border-left:4px solid '+reco.color+';"><p style="margin:0 0 4px;font-weight:700;color:'+reco.color+';font-size:14px;">'+reco.text+'</p><p style="margin:0;color:#1a1a1a;font-size:13px;">'+reco.action+'</p></div></div>';
    var errors=checks.filter(function(c){return c.status==='error';}),warnings=checks.filter(function(c){return c.status==='warning';}),oks=checks.filter(function(c){return c.status==='ok';});
    if(errors.length>0)html+='<div class="audit-section-el"><h3 class="audit-section-title error">\u2717 Critiques ('+errors.length+')</h3><div class="audit-grid">'+errors.map(renderAuditCheck).join('')+'</div></div>';
    if(warnings.length>0)html+='<div class="audit-section-el"><h3 class="audit-section-title warning">\u26A0 \u00C0 am\u00E9liorer ('+warnings.length+')</h3><div class="audit-grid">'+warnings.map(renderAuditCheck).join('')+'</div></div>';
    if(oks.length>0)html+='<div class="audit-section-el"><h3 class="audit-section-title ok">\u2713 Positifs ('+oks.length+')</h3><div class="audit-grid">'+oks.map(renderAuditCheck).join('')+'</div></div>';
    html+='<div class="audit-actions"><button id="btn-copy-report" class="btn btn-outline">Copier le rapport</button></div>';
    return html;
  }

  function generateTextReport(){
    var e=lastChecks.filter(function(c){return c.status==='error';}),w=lastChecks.filter(function(c){return c.status==='warning';}),o=lastChecks.filter(function(c){return c.status==='ok';});
    var t='Audit SEO - '+lastProspectName+'\nURL : '+lastAuditData.url+'\nScore : '+lastScore+'/10\n\n';
    if(e.length>0){t+='POINTS CRITIQUES :\n';e.forEach(function(c){t+='\u2717 '+c.label+' : '+c.value+(c.detail?' - '+c.detail:'')+'\n';});t+='\n';}
    if(w.length>0){t+='\u00C0 AM\u00C9LIORER :\n';w.forEach(function(c){t+='\u26A0 '+c.label+' : '+c.value+(c.detail?' - '+c.detail:'')+'\n';});t+='\n';}
    if(o.length>0){t+='POSITIFS :\n';o.forEach(function(c){t+='\u2713 '+c.label+'\n';});t+='\n';}
    t+='Rapport g\u00E9n\u00E9r\u00E9 par Aurore - agence-aurore.fr';return t;
  }
})();
