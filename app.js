'use strict';
/* =====================================================================
   GULF PRODUCT PAGE 2.0 – APPLICATION (app.js)
   One template (viewProduct) renders every product in data.js.
   Sections: HELPERS · ANALYTICS · STATE/ROUTING · SEO/GEO · COMPONENTS ·
   PRODUCT TEMPLATE · ENTITY PAGES · FINDER · COMPARE · MODALS ·
   AI ADVISOR · FORMS · EVENTS · INIT
   ===================================================================== */

/* ============================== HELPERS ============================== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P = id => PRODUCTS.find(p => p.id === id);
const APP = id => APPLICATIONS.find(a => a.id === id), IND = id => INDUSTRIES.find(a => a.id === id), ART = id => ARTICLES.find(a => a.id === id);
const uniq = a => [...new Set(a)];
const ALL_OEMS = () => uniq(PRODUCTS.flatMap(p => p.oems)).sort();
const SITE = 'https://www.example-gulf-domain.in';   // PRODUCTION: real domain
const DEMO = '<span class="demo">Demo data</span>';
function toast(m) { const t = $('#toast'); t.textContent = m; clearTimeout(toast.t); toast.t = setTimeout(() => t.textContent = '', 3500); }
function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type:'text/plain'})); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

/* ============================= ANALYTICS =============================
   Mock data layer. PRODUCTION: push to GA4 / CDP through window.dataLayer. */
const Analytics = { events: [], track(event, detail = {}) { const e = {event, ...detail, ts: new Date().toISOString()}; this.events.push(e); (window.dataLayer = window.dataLayer || []).push(e); } };

/* =========================== STATE / ROUTING ===========================
   Hash routes mirror the clean production URLs, e.g.
   #/products/passenger-car-motor-oil/gulf-demo-ultra-5w-30
   → /products/passenger-car-motor-oil/gulf-demo-ultra-5w-30               */
const state = { current: PRODUCTS[0].id, compare: [], ai: [], graph: 'application', dist: {} };
const R = { path: [], q: {} };
function parse() { const h = location.hash.replace(/^#\/?/, ''); const [p, qs] = h.split('?'); R.path = p ? p.split('/').filter(Boolean).map(decodeURIComponent) : []; R.q = Object.fromEntries(new URLSearchParams(qs || '')); }
function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
const Leads = { key: 'gpp_leads', all() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch (e) { return this.mem || []; } }, add(l) { const a = this.all(); a.push(l); this.mem = a; try { localStorage.setItem(this.key, JSON.stringify(a)); } catch (e) {} } };

/* ============================== SEO / GEO ==============================
   Title, description, canonical, Open Graph and JSON-LD are generated from
   the same record that renders the page, so they can never drift apart.   */
function setMeta(title, desc, path) {
  document.title = title; $('#meta-desc').content = desc; $('#canonical').href = SITE + path;
  $('#og-title').content = title; $('#og-desc').content = desc;
}
function setLD(id, obj) { $('#ld-' + id).textContent = JSON.stringify(obj, null, 1); }
function crumbLD(items) { setLD('breadcrumb', {'@context':'https://schema.org','@type':'BreadcrumbList', itemListElement: items.map((c, i) => ({'@type':'ListItem', position: i + 1, name: c[0], item: SITE + (c[1] || '').replace(/^#/, '')}))}); }
function productLD(p) {
  setLD('product', {'@context':'https://schema.org','@type':'Product', name: p.name, sku: p.sku, category: p.categoryPath.join(' > '), description: p.description, url: SITE + p.url,
    brand: {'@type':'Brand', name:'Gulf'}, manufacturer: {'@type':'Organization', name:'Gulf Oil Lubricants India Limited'},
    additionalProperty: [...p.technicalData.map(([name, value]) => ({'@type':'PropertyValue', name, value})), ...p.specifications.map(s => ({'@type':'PropertyValue', name: s.type, value: s.value}))],
    isRelatedTo: p.relatedProducts.map(id => ({'@type':'Product', name: P(id).name, url: SITE + P(id).url})),
    subjectOf: p.technicalArticles.map(id => ({'@type':'Article', headline: ART(id).title, url: SITE + '/knowledge/' + id}))});
  setLD('faq', {'@context':'https://schema.org','@type':'FAQPage', mainEntity: p.faqs.map(f => ({'@type':'Question', name: f.q, acceptedAnswer: {'@type':'Answer', text: f.a}}))});
  setLD('article', {});
}

/* ============================= COMPONENTS ============================= */
const bn = n => `<span class="bn" title="Band ${n} of the Product Page 2.0 template">${String(n).padStart(2, '0')}</span>`;
function crumbs(items) {
  crumbLD(items);
  return `<nav class="crumbs" aria-label="Breadcrumb"><div class="wrap"><ol>${items.map((c, i) => `<li>${i === items.length - 1 ? `<span aria-current="page">${esc(c[0])}</span>` : `<a href="${c[1]}">${esc(c[0])}</a>`}</li>`).join('')}</ol></div></nav>`;
}
function pack(p) {
  return `<svg class="pack" viewBox="0 0 108 150" role="img" aria-label="Neutral lubricant container placeholder for ${esc(p.name)}"><rect x="30" y="6" width="34" height="18" rx="3" fill="#1c2233"/><rect x="8" y="28" width="92" height="116" rx="9" fill="${p.color}"/><rect x="8" y="60" width="92" height="50" fill="#fff"/><text x="54" y="80" text-anchor="middle" font-size="10" font-weight="800" fill="#213074" font-family="Arial">DEMO PACK</text><text x="54" y="98" text-anchor="middle" font-size="${p.grade.length > 8 ? 9 : 12}" font-weight="800" fill="#b84508" font-family="Arial">${esc(p.grade)}</text><rect x="8" y="118" width="92" height="6" fill="#eb5d0b"/></svg>`;
}
function pcard(p) {
  const on = state.compare.includes(p.id);
  return `<article class="pcard"><div class="img">${pack(p)}</div><div class="body"><span class="cat">${esc(p.category)}</span><h3>${esc(p.name)}</h3><div><span class="chip" style="margin-bottom:0">${esc(p.grade)}</span></div><p class="small muted" style="margin:0">${esc(APP(p.applications[0]).name)}</p>
    <div class="row"><a class="btn sm" href="#${p.url}" data-track="related_product_clicked|${p.id}">View Product</a><button class="btn sm sec" data-act="cmp" data-arg="${p.id}" aria-pressed="${on}">${on ? '✓ Comparing' : 'Compare'}</button></div></div></article>`;
}
const artCard = a => `<article class="card"><div class="eyebrow">${esc(a.category)}</div><h3>${esc(a.title)}</h3><p class="small">${esc(a.summary)}</p><p class="small muted">${a.mins} min read</p><a class="btn sm sec" href="#/knowledge/${a.id}">Read Article</a></article>`;
const finderCTA = text => `<p style="margin:18px 0 0"><span class="muted">${text || 'Not sure this is the right product?'}</span> <a href="#/finder" data-track="product_finder_opened|inline"><strong>Find the Right Gulf Product →</strong></a></p>`;

function distFinder(idp) {
  const res = state.dist[idp];
  return `<form class="row" data-form="dist" data-idp="${idp}" novalidate style="align-items:flex-end">
      <div class="field" style="margin:0;flex:1;min-width:200px"><label for="${idp}-pin">Enter your pincode</label><input id="${idp}-pin" name="pin" inputmode="numeric" maxlength="6" placeholder="e.g. 400093" value="${esc(res ? res.pin : '')}"></div>
      <button class="btn" type="submit">Find a Distributor</button></form>
    <p class="err" role="alert" style="color:#b3261e;margin:6px 0 0" id="${idp}-err"></p>
    ${res ? `<h3 style="margin-top:16px">${res.list.length} distributor${res.list.length > 1 ? 's' : ''} near ${esc(res.pin)} ${DEMO}</h3>${res.exact ? '' : '<p class="small muted">No exact match in the demo data. Showing sample locations.</p>'}
      <div class="grid g3">${res.list.map(d => `<div class="card"><strong style="color:var(--blue)">${esc(d.name)}</strong><p style="margin:4px 0">${esc(d.area)}, ${esc(d.city)} – ${d.pin}</p><p class="small muted" style="margin:0 0 4px">${esc(d.range)}</p><p class="small" style="margin:0 0 10px">Contact: prototype placeholder</p><div class="row"><a class="btn sm" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.area + ', ' + d.city)}">Get Directions</a><button class="btn sm sec" data-act="lead" data-arg="enquiry">Enquire</button></div></div>`).join('')}</div>
      <p class="note">Distributor information is prototype data.</p>` : ''}`;
}
const LEAD = { enquiry: {title:'Enquire about this product', eyebrow:'Product enquiry', ev:'enquiry'}, quote: {title:'Request a Quote', eyebrow:'Commercial enquiry', ev:'enquiry'}, expert: {title:'Talk to a Gulf Technical Expert', eyebrow:'Technical support', ev:'expert_form'} };
function leadForm(kind, idp) {
  const p = P(state.current), f = (n, label, attrs = '', req = true) => `<div class="field" data-f="${n}"><label for="${idp}-${n}">${label}${req ? ' *' : ''}</label><input id="${idp}-${n}" name="${n}" ${attrs}><span class="err" role="alert"></span></div>`;
  return `<form data-form="lead" data-kind="${kind}" novalidate>
    <div class="field"><label for="${idp}-product">Product of interest</label><input id="${idp}-product" name="product" value="${esc(p.name)}" readonly></div>
    <div class="formgrid">${f('name', 'Name', 'autocomplete="name"')}${f('company', 'Company', 'autocomplete="organization"', false)}${f('mobile', 'Mobile', 'type="tel" inputmode="numeric" maxlength="10" placeholder="10-digit mobile"')}${f('email', 'Email', 'type="email" autocomplete="email"')}${f('city', 'City')}${f('vehicle', 'Vehicle / Equipment', 'placeholder="e.g. make and model"', false)}${f('current', 'Current lubricant', '', false)}
      <div class="field" data-f="requirement"><label for="${idp}-requirement">Requirement *</label><select id="${idp}-requirement" name="requirement"><option value="">Select…</option>${['Product recommendation','Technical advice','Price / quote','Bulk supply','Switching from another lubricant','Other'].map(o => `<option ${kind === 'quote' && o.startsWith('Price') ? 'selected' : ''}>${o}</option>`).join('')}</select><span class="err" role="alert"></span></div></div>
    <div class="field"><label for="${idp}-message">Message</label><textarea id="${idp}-message" name="message" rows="3"></textarea></div>
    <div class="row"><button class="btn" type="submit">Submit</button></div>
    <p class="small muted" style="margin-top:10px">Prototype: the request is stored only in this browser and is not sent anywhere.</p></form>`;
}

/* =========================== PRODUCT TEMPLATE ===========================
   The single scalable template. Every block reads from the product record. */
function viewProduct(p) {
  state.current = p.id; Analytics.track('product_viewed', {product: p.id});
  const apps = p.applications.map(APP), inds = p.industries.map(IND), fit = [...p.vehicles.map(v => ({...v, kind:'Vehicle'})), ...p.equipment.map(v => ({...v, kind:'Equipment'}))];
  const desk = window.innerWidth > 760, open = desk ? 'open' : '', on = state.compare.includes(p.id);
  setMeta(`${p.name} | ${p.category} | Gulf Oil Lubricants India`, `${p.name}: Gulf ${p.category.toLowerCase()}, grade ${p.grade}, for ${apps.map(a => a.name.toLowerCase()).join(', ')}. Specifications, technical data, documents and distributor enquiry.`, p.url);
  productLD(p);
  const other = P(p.relatedProducts[0]);
  return `${crumbs([['Home', '#/'], ['Products', '#/products'], [p.category, '#/products/' + p.categorySlug], [p.name]])}
<article>
  <section class="hero" aria-labelledby="pname"><div class="wrap">
    <div>
      <div class="eyebrow">${esc(p.category)}</div>
      <h1 id="pname">${bn(1)}${esc(p.name)}</h1>
      <p class="lead">${esc(p.tagline)}</p>
      <p class="ident">Product code ${esc(p.sku)} · Status: ${esc(p.status)} · <span class="demo">Prototype / demonstration data</span></p>
      <dl class="meta"><div><dt>Viscosity / grade</dt><dd>${esc(p.grade)}</dd></div><div><dt>Category</dt><dd>${esc(p.category)}</dd></div><div><dt>Application</dt><dd>${esc(apps[0].name)}</dd></div><div><dt>Key specification</dt><dd>${esc(p.keySpec)}</dd></div></dl>
      <div class="row"><button class="btn" data-act="dist">Buy / Find Distributor</button><button class="btn ghost" data-act="lead" data-arg="enquiry">Enquire</button><button class="btn ghost" data-act="lead" data-arg="expert">Talk to a Gulf Expert</button></div>
      <div class="row" style="margin-top:12px"><button class="link" style="color:#fff" data-act="cmp" data-arg="${p.id}" aria-pressed="${on}">${on ? '✓ Added to comparison' : '+ Compare this product'}</button><a href="#/finder" style="color:#fff;font-weight:700" data-track="product_finder_opened|hero">Find the Right Gulf Product →</a></div>
    </div>
    <div class="packbox">${pack(p)}<p class="small muted" style="margin:8px 0 12px">Neutral container placeholder, not an official pack image</p>
      <div class="row" style="justify-content:center"><button class="btn sm sec" data-act="dl" data-arg="TDS">Download TDS</button><button class="btn sm sec" data-act="dl" data-arg="SDS">Download SDS</button></div></div>
  </div></section>

  <div class="wrap"><section class="quick" aria-labelledby="qa"><div class="eyebrow">Quick answer</div><h2 id="qa">What is ${esc(p.name)}?</h2>
    <p>${esc(p.name)} is a lubricant in the ${esc(p.category.toLowerCase())} category, grade ${esc(p.grade)}, designed for ${esc(apps.map(a => a.name.toLowerCase()).join(', '))}. It is associated with the ${esc(inds.map(i => i.name.toLowerCase()).join(', '))} ${inds.length > 1 ? 'industries' : 'industry'} and the ${esc(p.specifications.map(s => s.type).join(', '))} specifications listed below. Refer to the current Gulf technical documentation for validated specifications and approvals.</p></section></div>

  <section class="band" aria-labelledby="b2"><div class="wrap">
    <h2 id="b2">${bn(2)}Product category</h2>
    <div class="taxo">${p.categoryPath.map((c, i) => `${i ? '<span class="sep" aria-hidden="true">→</span>' : ''}<a class="chip" style="margin:0" href="#/search?q=${encodeURIComponent(c)}">${esc(c)}</a>`).join('')}</div>
    <p class="small muted" style="margin:14px 0 0">Unique page URL: <span class="urlbar">${esc(p.url)}</span></p>
  </div></section>

  <section class="band grey" aria-label="Fit: where this product is used"><div class="wrap">
    <p class="group-title">Fit · the entry points from search</p>
    <div class="grid g2">
      <div><h2>${bn(3)}Recommended applications</h2>${apps.map(a => `<a class="card" style="margin-bottom:10px" href="#/applications/${a.id}" data-track="application_clicked|${a.id}"><strong>${esc(a.name)}</strong><span class="small muted">${esc(a.desc)}</span></a>`).join('')}</div>
      <div><h2>${bn(4)}Industries</h2>${inds.map(a => `<a class="card" style="margin-bottom:10px" href="#/industries/${a.id}"><strong>${esc(a.name)}</strong><span class="small muted">${esc(a.desc)}</span></a>`).join('')}</div>
    </div>
    <h2 style="margin-top:28px">${bn(5)}Compatible vehicles / equipment <span class="demo">Illustrative compatibility data</span></h2>
    <div class="field" style="max-width:420px"><label for="vf">Search manufacturer or model</label><input id="vf" type="search" placeholder="e.g. ${esc(p.oems[0])}" data-input="vf"></div>
    <div id="vchips" role="group" aria-label="Filter by manufacturer"><button class="chip on" data-act="vf" data-arg="">All</button>${p.oems.map(o => `<button class="chip" data-act="vf" data-arg="${esc(o)}">${esc(o)}</button>`).join('')}</div>
    <div class="grid g3" id="vlist" style="margin-top:10px">${fit.map(v => `<div class="card" data-v="${esc((v.oem + ' ' + v.models.join(' ')).toLowerCase())}" data-oem="${esc(v.oem)}"><div class="eyebrow">${v.kind} manufacturer</div><h3><a href="#/oems/${slug(v.oem)}" data-track="vehicle_clicked|${esc(v.oem)}">${esc(v.oem)}</a></h3><p class="small" style="margin:0">${v.models.map(esc).join(' · ')}</p></div>`).join('')}</div>
    <p id="vnone" class="muted" hidden>No match in the illustrative data. <button class="link" data-act="lead" data-arg="expert">Ask a Gulf expert about your vehicle or equipment</button>.</p>
    <p class="note">Model names are placeholders. Manufacturer names show how the relationship works and do not indicate approval or confirmed compatibility.</p>
    ${finderCTA()}
  </div></section>

  <div aria-label="Evidence: specifications, approvals and technical data">
  <details class="band" ${open}><summary><h2>${bn(6)}OEM / specifications</h2></summary><div class="wrap">
    <p class="group-title">Evidence · in indexable HTML, not only in a PDF</p>
    <div class="tblwrap"><table class="tbl"><thead><tr><th scope="col">Specification</th><th scope="col">Value</th><th scope="col">Status</th><th scope="col">Meaning</th></tr></thead><tbody>
      ${p.specifications.map((s, i) => `<tr><th scope="row">${esc(s.type)}</th><td>${esc(s.value)}</td><td>${DEMO}</td><td><button class="link" data-act="spec" data-arg="${i}">What does this mean?</button></td></tr>`).join('')}</tbody></table></div></div></details>
  <details class="band grey" ${open}><summary><h2>${bn(7)}Approvals</h2></summary><div class="wrap">
    <div class="grid g3">${p.approvals.map((a, i) => `<div class="card"><div class="eyebrow">OEM approval</div><h3>${esc(a.name)}</h3><p class="small" style="margin-bottom:10px">Status: <strong>${esc(a.status)}</strong></p><button class="btn sm sec" data-act="approval" data-arg="${i}">View Approval Details</button></div>`).join('')}</div>
    <p class="note">No real approvals are shown. In production each card is a verified approval from the Gulf technical database, linked to its OEM page.</p></div></details>
  <details class="band" ${open}><summary><h2>${bn(8)}Technical data</h2></summary><div class="wrap">
    <div class="tblwrap"><table class="tbl"><thead><tr><th scope="col">Property</th><th scope="col">Typical value</th></tr></thead><tbody>${p.technicalData.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)} <span class="demo">Prototype value</span></td></tr>`).join('')}</tbody></table></div>
    <p class="note">Prototype technical data — validate against current Gulf TDS before production use.</p></div></details>
  </div>

  <section class="band grey" aria-labelledby="b9"><div class="wrap">
    <h2 id="b9">${bn(9)}Key benefits <span class="demo">Illustrative</span></h2>
    <div class="grid g3">${p.benefits.map(b => `<div class="card"><h3>${esc(b.title)}</h3><p class="small" style="margin:0">${esc(b.text)}</p></div>`).join('')}</div>
  </div></section>

  <section class="band" aria-labelledby="b10"><div class="wrap">
    <h2 id="b10">${bn(10)}Technical documents</h2>
    <div class="grid g2">
      ${p.documents.map(d => `<div class="card"><div class="eyebrow">${d.type}</div><h3>${esc(d.title)}</h3><p class="small muted">${esc(d.version)} · Prototype document</p><div class="row"><button class="btn sm sec" data-act="doc" data-arg="${d.type}">View ${d.type}</button><button class="btn sm" data-act="dl" data-arg="${d.type}">Download ${d.type}</button></div></div>`).join('')}
    </div>
    <div class="card" style="margin-top:16px"><h3>On this page, without downloading</h3>
      <p class="small" style="margin:0"><strong>Grade:</strong> ${esc(p.grade)} · <strong>Specifications:</strong> ${esc(p.specifications.map(s => s.type + ' ' + s.value).join('; '))} · <strong>Applications:</strong> ${esc(apps.map(a => a.name).join(', '))} · <strong>Approvals:</strong> ${p.approvals.length} listed above · <strong>Technical properties:</strong> ${p.technicalData.length} in the table above.</p>
      <p class="small muted" style="margin:8px 0 0">The PDF is supporting evidence. The information itself is on the page.</p></div>
  </div></section>

  <section class="band grey" aria-labelledby="b11"><div class="wrap">
    <h2 id="b11">${bn(11)}Frequently asked questions</h2>
    <div class="faq">${p.faqs.map((f, i) => `<details data-faq="${i}"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>
    <p class="small muted" style="margin-top:12px">Each answer is written to stand alone and is also published as FAQPage structured data.</p>
  </div></section>

  <section class="band" aria-labelledby="bg"><div class="wrap">
    <div class="eyebrow">Entity hub</div><h2 id="bg">Explore this product through</h2>
    <div style="margin-bottom:16px">${[['application','Applications'],['vehicle','Vehicles'],['equipment','Equipment'],['industry','Industries'],['specification','Specifications'],['oem','OEMs'],['article','Technical Knowledge'],['related','Related Products']].map(x => `<button class="chip" data-act="gnode" data-arg="${x[0]}">${x[1]}</button>`).join('')}</div>
    <div class="graph"><div id="gsvg">${graphSVG(p)}</div><div class="card" id="gpanel" aria-live="polite">${graphPanel(p)}</div></div>
  </div></section>

  <section class="band grey" aria-label="Connections to other pages"><div class="wrap">
    <p class="group-title">Connections · internal links that build the entity graph</p>
    <h2>${bn(12)}Related products</h2>
    <div class="scroller">${p.relatedProducts.map(id => pcard(P(id))).join('')}</div>
    <h2 style="margin-top:32px">${bn(13)}Related applications</h2>
    <div>${p.relatedApplications.map(APP).map(a => `<a class="chip" href="#/applications/${a.id}" data-track="application_clicked|${a.id}">${esc(a.name)} →</a>`).join('')}</div>
    <h2 style="margin-top:32px">${bn(14)}Technical knowledge</h2>
    <div class="grid g4">${p.technicalArticles.map(ART).map(artCard).join('')}</div>
  </div></section>

  <section class="band" aria-labelledby="bs"><div class="wrap">
    <div class="eyebrow">Long-tail search entry points</div><h2 id="bs">Search this product</h2>
    <p class="muted">Queries this one page is built to answer:</p>
    <div>${[p.name, `${p.name} specifications`, `${p.name} applications`, `${p.name} for ${p.oems[0]}`, `${p.name} TDS`, `${p.name} approval`, `${p.name} vs ${other.name}`].map(q => `<span class="q">“${esc(q)}”</span>`).join('')}</div>
  </div></section>

  <section class="band dark" aria-labelledby="br"><div class="wrap">
    <div class="eyebrow">Why Product Page 2.0</div><h2 id="br">A product page is no longer a product description</h2>
    <div class="roles">${[['Search entry point','SEO'],['Answer source','GEO'],['Technical knowledge asset','Technical authority'],['Entity hub','Knowledge graph'],['Discovery experience','Product Finder'],['Commercial touchpoint','Lead generation'],['Platform connection','Gulf Lubrication Intelligence']].map(r => `<div><strong>${r[0]}</strong><span>${r[1]}</span></div>`).join('')}</div>
    <p style="margin:18px 0 0;color:#c5cdea">One product template → hundreds of product pages → each page an SEO, GEO, technical and conversion asset. Use “View another product” in the top bar to see the same template with different data.</p>
  </div></section>

  <section class="band grey" id="buy" aria-labelledby="b15"><div class="wrap">
    <p class="group-title">Conversion · a commercial next step on every page</p>
    <h2 id="b15">${bn(15)}Ready to buy Gulf?</h2>
    <div class="row" style="margin-bottom:18px"><button class="btn sec" data-act="lead" data-arg="enquiry">Buy / Enquire</button><button class="btn sec" data-act="lead" data-arg="quote">Request a Quote</button></div>
    <div class="card" id="dist-inline">${distFinder('bd')}</div>
  </div></section>

  <section class="band" id="expert" aria-labelledby="b16"><div class="wrap"><div class="grid g2">
    <div><h2 id="b16">${bn(16)}Need help choosing the right lubricant?</h2><h3>Talk to a Gulf Technical Expert</h3>
      <p>Tell us what you run and how you use it. Your request goes to a Gulf technical expert with <strong>${esc(p.name)}</strong> as the product of interest.</p>${finderCTA('Prefer to explore first?')}
      <p style="margin-top:10px"><button class="link" data-act="ai">Or ask Gulf AI about this product</button></p></div>
    <div class="card" id="expert-inline">${leadForm('expert', 'be')}</div>
  </div></div></section>
</article>`;
}

/* Product knowledge graph: OEM → Vehicle → PRODUCT ↔ Application / Specification → Industry → Technical Article */
function graphSVG(p) {
  const N = { oem:[320,36,'OEM'], vehicle:[320,112, p.vehicles.length ? 'Vehicle' : 'Equipment'], application:[100,205,'Application'], specification:[540,205,'Specification'], industry:[320,298,'Industry'], article:[320,378,'Technical Article'], related:[540,298,'Related Products'] };
  const line = (a, b) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#9aa3c4" stroke-width="2"/>`, C = [320, 205];
  const sel = state.graph === 'equipment' ? 'vehicle' : state.graph;
  return `<svg viewBox="0 0 640 414" role="group" aria-label="Product knowledge graph for ${esc(p.name)}">
    ${line(N.oem, N.vehicle)}${line(N.vehicle, C)}${line(N.application, C)}${line(N.specification, C)}${line(C, N.industry)}${line(N.industry, N.article)}${line(C, N.related)}
    ${Object.entries(N).map(([k, n]) => `<g class="gnode ${sel === k ? 'on' : ''}" role="button" tabindex="0" data-act="gnode" data-arg="${k}" aria-label="${n[2]}"><rect x="${n[0] - 78}" y="${n[1] - 20}" width="156" height="40" rx="4"/><text x="${n[0]}" y="${n[1] + 5}" text-anchor="middle">${n[2]}</text></g>`).join('')}
    <g class="gnode center"><rect x="${C[0] - 110}" y="${C[1] - 24}" width="220" height="48" rx="4"/><text x="${C[0]}" y="${C[1] + 5}" text-anchor="middle">${esc(p.name)}</text></g></svg>`;
}
function graphPanel(p) {
  const k = state.graph, list = (title, items) => `<div class="eyebrow">Connected to ${esc(p.name)}</div><h3>${title}</h3><div>${items.join('') || '<span class="muted">None in the demo record.</span>'}</div>`;
  const oemChip = o => `<a class="chip" href="#/oems/${slug(o)}" data-track="vehicle_clicked|${esc(o)}">${esc(o)}</a>`;
  if (k === 'application') return list('Applications', p.applications.map(APP).map(a => `<a class="chip" href="#/applications/${a.id}" data-track="application_clicked|${a.id}">${esc(a.name)}</a>`));
  if (k === 'industry') return list('Industries', p.industries.map(IND).map(a => `<a class="chip" href="#/industries/${a.id}">${esc(a.name)}</a>`));
  if (k === 'vehicle') return list('Vehicles ' + DEMO, p.vehicles.map(v => oemChip(v.oem))) + (p.vehicles.length ? '' : '<p class="small muted">This product is listed against equipment.</p>');
  if (k === 'equipment') return list('Equipment ' + DEMO, p.equipment.map(v => oemChip(v.oem)));
  if (k === 'oem') return list('OEMs ' + DEMO, p.oems.map(oemChip));
  if (k === 'specification') return list('Specifications ' + DEMO, p.specifications.map((s, i) => `<button class="chip" data-act="spec" data-arg="${i}">${esc(s.type)}: ${esc(s.value)}</button>`));
  if (k === 'article') return list('Technical knowledge', p.technicalArticles.map(ART).map(a => `<a class="chip" href="#/knowledge/${a.id}">${esc(a.title)}</a>`));
  return list('Related products', p.relatedProducts.map(P).map(x => `<a class="chip" href="#${x.url}" data-track="related_product_clicked|${x.id}">${esc(x.name)}</a>`));
}

/* ============================ ENTITY PAGES ============================
   Applications, industries, OEMs and articles: each is its own URL and
   links back to products, which is what forms the internal entity graph. */
function page(crumbItems, eyebrow, title, intro, body) {
  return `${crumbs(crumbItems)}<section class="band" style="border:0"><div class="wrap"><div class="eyebrow">${eyebrow}</div><h1>${esc(title)}</h1>${intro ? `<p class="muted" style="max-width:760px;font-size:18px">${intro}</p>` : ''}${body}
    <p style="margin-top:28px"><a class="btn sec" href="#${P(state.current).url}">← Back to ${esc(P(state.current).name)}</a></p></div></section>`;
}
const prodGrid = list => list.length ? `<div class="grid g3">${list.map(pcard).join('')}</div>` : '<p class="muted">No demo products linked yet.</p>';
function viewEntity(kind, id) {
  const cfg = { applications: {title:'Applications', list: APPLICATIONS, prods: e => PRODUCTS.filter(p => p.applications.includes(e.id) || p.relatedApplications.includes(e.id))},
                industries: {title:'Industries', list: INDUSTRIES, prods: e => PRODUCTS.filter(p => p.industries.includes(e.id))} }[kind];
  if (!id) { setMeta(`${cfg.title} | Gulf Oil Lubricants India`, `Gulf lubricants by ${cfg.title.toLowerCase()}.`, '/' + kind);
    return page([['Home', '#/'], [cfg.title]], 'Browse', cfg.title, '', `<div class="grid g3">${cfg.list.map(e => `<a class="card" href="#/${kind}/${e.id}"><strong>${esc(e.name)}</strong><span class="small muted">${esc(e.desc)}</span></a>`).join('')}</div>`); }
  const e = cfg.list.find(x => x.id === id); if (!e) return notFound();
  const prods = cfg.prods(e), arts = uniq(prods.flatMap(p => p.technicalArticles)).map(ART), oems = uniq(prods.flatMap(p => p.oems));
  setMeta(`${e.name} | ${cfg.title} | Gulf Oil Lubricants India`, `Gulf lubricants for ${e.name.toLowerCase()}: products, vehicles and technical knowledge.`, `/${kind}/${e.id}`);
  return page([['Home', '#/'], [cfg.title, '#/' + kind], [e.name]], kind === 'industries' ? 'Industry' : 'Application', e.name, esc(e.desc),
    `<h2 style="margin-top:24px">Related products</h2>${prodGrid(prods)}
     <h2 style="margin-top:32px">Related vehicles / equipment ${DEMO}</h2><div>${oems.map(o => `<a class="chip" href="#/oems/${slug(o)}" data-track="vehicle_clicked|${esc(o)}">${esc(o)}</a>`).join('')}</div>
     <h2 style="margin-top:32px">Technical knowledge</h2><div class="grid g4">${arts.slice(0, 4).map(artCard).join('')}</div>`);
}
function viewOem(id) {
  const name = ALL_OEMS().find(o => slug(o) === id); if (!name) return notFound();
  const prods = PRODUCTS.filter(p => p.oems.includes(name));
  setMeta(`Gulf lubricants for ${name} | Gulf Oil Lubricants India`, `Gulf products listed against ${name} vehicles and equipment (illustrative data).`, '/oems/' + id);
  return page([['Home', '#/'], ['OEMs', '#/search?q='], [name]], 'OEM ' + DEMO, `Gulf lubricants for ${name}`, 'Illustrative compatibility data. Model names are placeholders and no approval is implied.',
    `<h2 style="margin-top:24px">Demo models</h2><div><span class="chip">Demo model A</span><span class="chip">Demo model B</span><span class="chip">Demo model C</span></div><h2 style="margin-top:28px">Products listed against ${esc(name)}</h2>${prodGrid(prods)}`);
}
function viewKnowledge(id) {
  if (!id) { setMeta('Technical Knowledge | Gulf Oil Lubricants India', 'Gulf technical articles on lubricants, specifications and maintenance.', '/knowledge');
    return page([['Home', '#/'], ['Technical Knowledge']], 'Technical', 'Technical Knowledge', 'Articles that explain the terms used on product pages.', `<div class="grid g3">${ARTICLES.map(artCard).join('')}</div>`); }
  const a = ART(id); if (!a) return notFound();
  const prods = PRODUCTS.filter(p => p.technicalArticles.includes(id));
  setMeta(`${a.title} | Technical Knowledge | Gulf Oil Lubricants India`, a.summary, '/knowledge/' + id);
  const html = page([['Home', '#/'], ['Technical Knowledge', '#/knowledge'], [a.title]], `${esc(a.category)} · ${a.mins} min read`, a.title, esc(a.summary),
    `<div style="max-width:760px">${a.body.map(b => `<p>${esc(b)}</p>`).join('')}</div><p class="note" style="max-width:760px">General guidance. Always follow the vehicle or equipment manufacturer's manual.</p>
     <h2 style="margin-top:32px">Products this article relates to</h2>${prodGrid(prods)}`);
  setLD('article', {'@context':'https://schema.org','@type':'Article', headline: a.title, description: a.summary, articleSection: a.category, url: SITE + '/knowledge/' + id, publisher: {'@type':'Organization', name:'Gulf Oil Lubricants India Limited'}, about: prods.map(p => ({'@type':'Product', name: p.name}))});
  return html;
}
function viewProducts(cat) {
  const list = PRODUCTS.filter(p => !cat || p.categorySlug === cat), c = cat && list[0] ? list[0].category : null;
  setMeta(`${c || 'Products'} | Gulf Oil Lubricants India`, `Gulf ${c ? c.toLowerCase() : 'lubricant'} range.`, '/products' + (cat ? '/' + cat : ''));
  return page(c ? [['Home', '#/'], ['Products', '#/products'], [c]] : [['Home', '#/'], ['Products']], 'Products', c || 'Gulf product range', 'Every product below uses the same page template.',
    `<div style="margin-bottom:16px"><a class="chip ${cat ? '' : 'on'}" href="#/products">All</a>${uniq(PRODUCTS.map(p => p.category)).map(x => `<a class="chip ${slug(x) === cat ? 'on' : ''}" href="#/products/${slug(x)}">${esc(x)}</a>`).join('')}</div>${prodGrid(list)}`);
}
function viewSearch(q) {
  const m = t => !q || t.toLowerCase().includes(q.toLowerCase());
  const prods = PRODUCTS.filter(p => m([p.name, p.category, p.grade, p.categoryPath.join(' '), p.specifications.map(s => s.type + ' ' + s.value).join(' '), p.oems.join(' ')].join(' ')));
  const apps = APPLICATIONS.filter(a => m(a.name)), inds = INDUSTRIES.filter(a => m(a.name)), arts = ARTICLES.filter(a => m(a.title + ' ' + a.category)), oems = ALL_OEMS().filter(m);
  const n = prods.length + apps.length + inds.length + arts.length + oems.length;
  setMeta('Search | Gulf Oil Lubricants India', 'Search Gulf products, applications and technical knowledge.', '/search');
  return page([['Home', '#/'], ['Search']], 'Search', q ? `Results for “${q}”` : 'Browse everything', n ? `${n} result${n > 1 ? 's' : ''}` : 'We couldn\'t find a match. Try a product name, grade, application or manufacturer.',
    `${prods.length ? `<h2>Products</h2>${prodGrid(prods)}` : ''}
     ${apps.length + inds.length ? `<h2 style="margin-top:28px">Applications and industries</h2><div>${apps.map(a => `<a class="chip" href="#/applications/${a.id}">${esc(a.name)}</a>`).join('')}${inds.map(a => `<a class="chip" href="#/industries/${a.id}">${esc(a.name)}</a>`).join('')}</div>` : ''}
     ${oems.length ? `<h2 style="margin-top:28px">OEMs ${DEMO}</h2><div>${oems.map(o => `<a class="chip" href="#/oems/${slug(o)}">${esc(o)}</a>`).join('')}</div>` : ''}
     ${arts.length ? `<h2 style="margin-top:28px">Technical knowledge</h2><div class="grid g4">${arts.slice(0, 8).map(artCard).join('')}</div>` : ''}
     ${n ? '' : '<p><a class="btn" href="#/finder">Find the Right Gulf Product</a></p>'}`);
}
function viewSimple(kind) {
  const p = P(state.current), map = {
    services: ['Services', 'Find a Gulf distributor', `<div class="card">${distFinder('pg')}</div>`],
    contact: ['Contact', 'Enquire', `<div class="card" style="max-width:760px">${leadForm('enquiry', 'pc')}</div>`],
    expert: ['Talk to a Gulf Expert', 'Talk to a Gulf Technical Expert', `<div class="card" style="max-width:760px">${leadForm('expert', 'px')}</div>`],
    about: ['About Gulf', 'Existing Gulf website page', '<p>Corporate pages such as About, Careers, News, Privacy and Terms stay as they are on the live website and are outside the scope of this product-page prototype.</p>'] }[kind];
  setMeta(`${map[0]} | Gulf Oil Lubricants India`, map[1], '/' + kind);
  return page([['Home', '#/'], [map[0]]], map[0], map[1], kind === 'about' ? '' : `Product of interest: ${esc(p.name)}`, map[2]);
}
const notFound = () => page([['Home', '#/'], ['Not found']], 'Not found', 'We couldn\'t find that page', 'The link may be out of date.', '<p><a class="btn" href="#/products">Browse products</a></p>');

/* =============================== FINDER ===============================
   Product Page → Finder → Vehicle / Equipment → Application → Recommendation → Product Page */
function viewFinder() {
  const [, pid, oem, app] = R.path, p = pid && P(pid), step = !p ? 1 : !oem ? 2 : !app ? 3 : 4;
  setMeta('Product Finder | Gulf Oil Lubricants India', 'Find the right Gulf lubricant for your vehicle or equipment.', '/finder');
  const opts = step === 1 ? FINDER_TYPES.map(t => [`#/finder/${t.product}`, `${t.icon} ${t.label}`, 'Start here'])
    : step === 2 ? p.oems.map(o => [`#/finder/${pid}/${slug(o)}`, o, 'Manufacturer (demo)'])
    : step === 3 ? p.applications.map(APP).map(a => [`#/finder/${pid}/${oem}/${a.id}`, a.name, a.desc]) : [];
  const q = ['What do you have?', 'Who is the manufacturer?', 'How is it used?', 'Recommended Gulf product'][step - 1];
  const trail = p ? [FINDER_TYPES.find(t => t.product === pid).label, oem && p.oems.find(o => slug(o) === oem), app && APP(app) && APP(app).name].filter(Boolean) : [];
  return `${crumbs([['Home', '#/'], ['Product Finder']])}<section class="band" style="border:0"><div class="wrap">
    <div class="eyebrow">Product Finder · Step ${step} of 4</div><h1>${q}</h1>
    ${trail.length ? `<p>${trail.map(t => `<span class="chip">${esc(t)}</span>`).join('<span aria-hidden="true">→ </span>')}</p>` : ''}
    ${step < 4 ? `<div class="grid g3">${opts.map(o => `<a class="card" href="${o[0]}"><strong>${esc(o[1])}</strong><span class="small muted">${esc(o[2])}</span></a>`).join('')}</div>`
      : `<div class="card" style="border-top-color:var(--orange);display:grid;grid-template-columns:140px 1fr;gap:24px;align-items:center"><div>${pack(p)}</div><div><span class="demo">Illustrative recommendation</span><h2 style="margin-top:8px">${esc(p.name)}</h2><p>${esc(p.description)} Grade ${esc(p.grade)}.</p><p class="small muted">Why: it is the demo product listed for ${esc(trail[0].toLowerCase())} use, ${esc(trail[1])} and ${esc(trail[2].toLowerCase())}.</p><div class="row"><a class="btn" href="#${p.url}">View Product Page</a><button class="btn sec" data-act="lead" data-arg="expert">Validate with a Gulf Expert</button></div></div></div>`}
    <p style="margin-top:24px" class="row"><a class="btn sec" href="${step === 1 ? '#' + P(state.current).url : '#/finder' + (step > 2 ? '/' + pid : '') + (step > 3 ? '/' + oem : '')}">← Back</a><a href="#/finder">Start again</a></p>
    <p class="note">Simplified finder for this prototype. The full Product &amp; Application Finder 2.0 prototype covers more pathways.</p></div></section>`;
}

/* =============================== COMPARE =============================== */
function viewCompare() {
  const ps = state.compare.map(P); setMeta('Compare Products | Gulf Oil Lubricants India', 'Compare Gulf products side by side.', '/compare');
  const props = uniq(ps.flatMap(p => p.technicalData.map(t => t[0])));
  const rows = [['Category', p => p.category], ['Grade', p => p.grade], ['Application', p => p.applications.map(a => APP(a).name).join(', ')], ['Specifications (demo)', p => p.specifications.map(s => s.type + ' ' + s.value).join('; ')], ['Benefits', p => p.benefits.map(b => b.title).join(', ')], ...props.map(k => [k + ' (prototype value)', p => (p.technicalData.find(t => t[0] === k) || [0, '–'])[1]])];
  return page([['Home', '#/'], ['Compare Products']], 'Compare', 'Product comparison', '',
    ps.length < 2 ? `<div class="card"><p>Add at least two products to compare.${ps.length ? ` Selected so far: <strong>${esc(ps[0].name)}</strong>.` : ''}</p>${prodGrid(PRODUCTS.filter(p => !state.compare.includes(p.id)))}</div>`
    : `<div class="tblwrap"><table class="tbl"><thead><tr><th scope="col">Product</th>${ps.map(p => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><th scope="row">${esc(r[0])}</th>${ps.map(p => `<td>${esc(r[1](p))}</td>`).join('')}</tr>`).join('')}
      <tr><th scope="row">Actions</th>${ps.map(p => `<td><a class="btn sm" href="#${p.url}">View Product</a> <button class="link" data-act="cmp" data-arg="${p.id}">Remove</button></td>`).join('')}</tr></tbody></table></div><p class="note">Specifications and values are demo data.</p>`);
}
function toggleCompare(id) {
  if (state.compare.includes(id)) state.compare = state.compare.filter(x => x !== id);
  else if (state.compare.length >= 3) return toast('You can compare up to 3 products. Remove one first.');
  else { state.compare.push(id); Analytics.track('product_comparison', {product: id, count: state.compare.length}); toast(`${P(id).name} added to comparison`); }
  const y = window.scrollY; render(true); window.scrollTo(0, y);
}

/* =============================== RENDER =============================== */
function render(keep) {
  parse(); const [a, b, c] = R.path; let html;
  if (!a) html = viewProduct(P(state.current));
  else if (a === 'products') html = c ? (P(c) ? viewProduct(P(c)) : notFound()) : viewProducts(b);
  else if (a === 'applications' || a === 'industries') html = viewEntity(a, b);
  else if (a === 'oems') html = viewOem(b);
  else if (a === 'knowledge') html = viewKnowledge(b);
  else if (a === 'finder') html = viewFinder();
  else if (a === 'compare') html = viewCompare();
  else if (a === 'search') html = viewSearch(R.q.q || '');
  else if (['services', 'contact', 'expert', 'about'].includes(a)) html = viewSimple(a);
  else html = notFound();
  if (a !== 'knowledge' || !b) { if (a && a !== 'products') setLD('article', {}); }
  $('#main').innerHTML = html;
  $('#switcher').value = state.current;
  $$('#mainnav a').forEach(l => l.toggleAttribute('aria-current', false));
  const navMap = {products:0, industries:1, applications:2, services:3, knowledge:4, about:5, contact:6}, cur = $$('#mainnav a')[navMap[a || 'products']]; if (cur) cur.setAttribute('aria-current', 'page');
  renderSticky(); $('#mainnav').classList.remove('open'); $('.hamb').setAttribute('aria-expanded', 'false');
  if (!keep) window.scrollTo(0, 0);
}
function renderSticky() {
  const p = P(state.current), n = state.compare.length;
  $('#sticky').innerHTML = `<div class="wrap"><span class="name">${esc(p.name)}</span>${n ? `<a class="btn sm ghost" href="#/compare">Compare (${n})</a>` : ''}<button class="btn sm" data-act="dist">Find Distributor</button><button class="btn sm ghost" data-act="lead" data-arg="enquiry">Enquire</button><button class="btn sm ghost" data-act="lead" data-arg="expert">Talk to Expert</button></div>`;
}

/* =============================== MODALS =============================== */
let lastFocus = null;
function modal(html, label) {
  lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="modal-bg" data-bg><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}"><button class="x" data-act="close" aria-label="Close">×</button>${html}</div></div>`;
  $('#modal-root [data-bg]').addEventListener('mousedown', e => { if (e.target.hasAttribute('data-bg')) closeModal(); });
  ($('#modal-root .modal input:not([readonly]), #modal-root .modal .btn') || $('#modal-root .x')).focus();
}
function closeModal() { if (!$('#modal-root').innerHTML) return; $('#modal-root').innerHTML = ''; if (lastFocus && document.contains(lastFocus)) lastFocus.focus(); }
function docText(p, type) {
  return [`${p.name} – ${type === 'TDS' ? 'Technical Data Sheet' : 'Safety Data Sheet'}`, 'PROTOTYPE DOCUMENT – demonstration data, not a Gulf document', '', p.description, '', `Grade: ${p.grade}`, `Applications: ${p.applications.map(a => APP(a).name).join(', ')}`, `Specifications (demo): ${p.specifications.map(s => s.type + ' ' + s.value).join('; ')}`, '', 'Typical properties (prototype values):', ...p.technicalData.map(t => `  ${t[0]}: ${t[1]}`), '', 'Validate against the current Gulf TDS/SDS before any use.'].join('\n');
}
const ACT = {
  close: closeModal,
  menu: () => { const o = $('#mainnav').classList.toggle('open'); $('.hamb').setAttribute('aria-expanded', o); },
  bands: (_, b) => { const off = document.body.classList.toggle('nobands'); b.setAttribute('aria-pressed', !off); },
  cmp: toggleCompare,
  dist: () => modal(`<div class="eyebrow">Buy / find distributor</div><h2>Find a Gulf distributor</h2><p class="muted">For ${esc(P(state.current).name)}</p><div id="dist-modal">${distFinder('md')}</div>`, 'Find a distributor'),
  lead: kind => { const k = LEAD[kind]; if (kind === 'expert') Analytics.track('expert_form_opened', {product: state.current}); modal(`<div class="eyebrow">${k.eyebrow}</div><h2>${k.title}</h2>${leadForm(kind, 'ml')}`, k.title); },
  dl: type => { const p = P(state.current); Analytics.track(type === 'TDS' ? 'tds_clicked' : 'sds_clicked', {product: p.id, action:'download'}); download(`${p.id}-${type}-PROTOTYPE.txt`, docText(p, type)); toast(`Prototype ${type} downloaded as a text file. Production serves the current PDF.`); },
  doc: type => { const p = P(state.current); Analytics.track(type === 'TDS' ? 'tds_clicked' : 'sds_clicked', {product: p.id, action:'view'});
    modal(`<div class="eyebrow">Prototype document preview</div><div class="doc"><div class="dochead"><img src="assets/gulf-logo.png" alt="Gulf"><strong style="color:var(--blue)">${type === 'TDS' ? 'TECHNICAL DATA SHEET' : 'SAFETY DATA SHEET'}</strong></div>
      <h2 style="margin-top:16px">${esc(p.name)}</h2><p>${esc(p.description)}</p>
      ${type === 'TDS' ? `<h3>Applications</h3><ul>${p.applications.map(a => `<li>${esc(APP(a).name)}</li>`).join('')}</ul><h3>Specifications <span class="demo">Demo</span></h3><ul>${p.specifications.map(s => `<li>${esc(s.type)}: ${esc(s.value)}</li>`).join('')}</ul><h3>Typical properties <span class="demo">Prototype values</span></h3><table class="tbl"><tbody>${p.technicalData.map(t => `<tr><th scope="row">${esc(t[0])}</th><td>${esc(t[1])}</td></tr>`).join('')}</tbody></table>`
        : '<h3>Identification</h3><p>Lubricating oil. Prototype placeholder section.</p><h3>Handling and storage</h3><p>Placeholder: store in a cool, dry place in the original closed container.</p><h3>First-aid and disposal</h3><p>Placeholder: sections follow the standard SDS structure in production.</p>'}
      <h3>Safety notes</h3><p>Placeholder text. Refer to the current Gulf Safety Data Sheet.</p></div>
      <div class="row" style="margin-top:14px"><button class="btn" data-act="dl" data-arg="${type}">Download ${type}</button><button class="btn sec" data-act="close">Close</button></div>`, type + ' preview'); },
  spec: i => { const p = P(state.current), s = p.specifications[+i], t = SPEC_TYPES[s.type]; Analytics.track('specification_clicked', {product: p.id, specification: s.type});
    modal(`<div class="eyebrow">Specification</div><h2>What does this specification mean?</h2><p><strong>${esc(s.type)}: ${esc(s.value)}</strong> ${DEMO}</p><p>${esc(t.meaning)}</p><p class="small muted">Other Gulf products listing ${esc(s.type)}: ${PRODUCTS.filter(x => x.id !== p.id && x.specifications.some(y => y.type === s.type)).map(x => esc(x.name)).join(', ') || 'none in the demo data'}.</p><div class="row"><a class="btn" href="#/knowledge/${t.article}" data-act="closenav">Read: ${esc(ART(t.article).title)}</a><button class="btn sec" data-act="close">Close</button></div>`, 'Specification'); },
  closenav: (_, el) => { closeModal(); location.hash = el.getAttribute('href'); },
  approval: i => { const a = P(state.current).approvals[+i]; modal(`<div class="eyebrow">Approval details</div><h2>${esc(a.name)}</h2><table class="tbl"><tbody>${[['Approval name', a.name], ['Issuing organisation', a.org], ['Applicability', a.applicability], ['Source / document', a.source], ['Status', a.status]].map(r => `<tr><th scope="row">${r[0]}</th><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table><p class="note">Not a real approval. This shows the fields a verified approval record would carry.</p><div class="row" style="margin-top:14px"><button class="btn sec" data-act="close">Close</button></div>`, 'Approval details'); },
  gnode: k => { state.graph = k; const p = P(state.current); $('#gsvg').innerHTML = graphSVG(p); $('#gpanel').innerHTML = graphPanel(p); },
  vf: (o, b) => { $$('#vchips .chip').forEach(c => c.classList.toggle('on', c === b)); $('#vf').value = ''; filterVehicles(o.toLowerCase(), true); if (o) Analytics.track('vehicle_clicked', {oem: o}); },
  ai: () => { const a = $('#ai'); a.hidden = !a.hidden; if (!a.hidden) { Analytics.track('ai_advisor_opened', {product: state.current}); renderAI(); $('#aiq').focus(); } },
  ask: q => ask(q),
  seo: openSEO, analytics: openAnalytics
};
function filterVehicles(v, byOem) { let n = 0; $$('#vlist [data-v]').forEach(c => { const hit = !v || (byOem ? c.dataset.oem.toLowerCase() === v : c.dataset.v.includes(v)); c.hidden = !hit; n += hit; }); $('#vnone').hidden = n > 0; }
function openSEO() {
  const heads = $$('#main h1, #main h2, #main h3').slice(0, 40).map(h => `${'  '.repeat(+h.tagName[1] - 1)}${h.tagName}  ${h.textContent.replace(/^\d\d/, '').trim().slice(0, 60)}`).join('\n');
  const ld = id => { const t = $('#ld-' + id).textContent; return t.length > 4 ? esc(t) : '(not used on this page)'; };
  modal(`<div class="eyebrow">SEO / GEO inspector</div><h2>What search and answer engines read on this page</h2>
    <table class="tbl"><tbody><tr><th scope="row">Title</th><td>${esc(document.title)}</td></tr><tr><th scope="row">Meta description</th><td>${esc($('#meta-desc').content)}</td></tr><tr><th scope="row">Canonical URL</th><td>${esc($('#canonical').href)}</td></tr><tr><th scope="row">Open Graph</th><td>${esc($('#og-title').content)}<br><span class="muted small">image: placeholder</span></td></tr></tbody></table>
    <h3 style="margin-top:16px">Heading outline</h3><pre class="code">${esc(heads)}</pre>
    ${['product', 'breadcrumb', 'faq', 'article', 'organization'].map(k => `<h3>JSON-LD: ${k}</h3><pre class="code">${ld(k)}</pre>`).join('')}
    <p class="note">Generated from the product record. Placeholder domain. No ranking outcome is implied.</p>`, 'SEO and GEO inspector');
}
function openAnalytics() {
  const ev = Analytics.events.slice().reverse(), count = {}; Analytics.events.forEach(e => count[e.event] = (count[e.event] || 0) + 1);
  modal(`<div class="eyebrow">Prototype analytics</div><h2>Events this page would generate</h2><p class="small muted">${ev.length} events this session · ${Leads.all().length} form submission${Leads.all().length === 1 ? '' : 's'} stored in this browser.</p>
    <div style="margin-bottom:12px">${Object.entries(count).map(([k, v]) => `<span class="chip">${k} · ${v}</span>`).join('')}</div>
    <div style="max-height:40vh;overflow:auto">${ev.map(e => { const {event, ts, ...rest} = e; return `<div class="evt"><strong>${esc(event)}</strong> ${esc(JSON.stringify(rest))} <span class="muted">${ts.slice(11, 19)}</span></div>`; }).join('')}</div>`, 'Prototype analytics');
}

/* ============================= AI ADVISOR =============================
   Rule-based and answered only from the current product record.
   PRODUCTION: a grounded assistant that retrieves from product pages.    */
function answer(q) {
  const p = P(state.current), t = q.toLowerCase(), other = P(p.relatedProducts[0]), specs = p.specifications.map(s => `${s.type} ${s.value}`).join('; ');
  const oem = ALL_OEMS().find(o => t.includes(o.toLowerCase()));
  if (/differ|\bvs\b|versus|compare/.test(t)) return `<p><strong>${esc(p.name)}</strong> is a ${esc(p.category.toLowerCase())}, grade ${esc(p.grade)}, for ${esc(p.applications.map(a => APP(a).name.toLowerCase()).join(', '))}.</p><p><strong>${esc(other.name)}</strong> is a ${esc(other.category.toLowerCase())}, grade ${esc(other.grade)}, for ${esc(other.applications.map(a => APP(a).name.toLowerCase()).join(', '))}.</p><p><a href="#${other.url}">Open ${esc(other.name)}</a></p>`;
  if (/instead|another|which gulf|other product|alternative|right product/.test(t)) return `<p>That depends on what you run. Related products on this page: ${p.relatedProducts.map(P).map(x => `<a href="#${x.url}">${esc(x.name)}</a>`).join(', ')}.</p><p><a href="#/finder" data-track="product_finder_opened|ai"><strong>Find the Right Gulf Product →</strong></a></p>`;
  if (oem || /vehicle|suitable|my car|my bike|my truck|equipment|compatib|fit/.test(t)) { const listed = oem && p.oems.includes(oem);
    return `<p>${oem ? (listed ? `${esc(oem)} is listed in the illustrative compatibility data for ${esc(p.name)}.` : `${esc(oem)} is not listed against ${esc(p.name)} in the demo data.`) : `The demo record for ${esc(p.name)} lists: ${esc(p.oems.join(', '))}.`}</p><p>This is illustrative data. Confirm the grade and specification in your manual, or ask an expert.</p><p><button class="link" data-act="lead" data-arg="expert">Talk to a Gulf Expert</button></p>`; }
  if (/spec|api|acea|jaso|meet|standard/.test(t)) return `<p>The record for ${esc(p.name)} lists: ${esc(specs)}.</p><p>These are demo specifications. The current Gulf TDS is the validated source.</p>`;
  if (/viscos|grade|sae|thick/.test(t)) return `<p>${esc(p.name)} is grade ${esc(p.grade)}.</p><p><a href="#/knowledge/understanding-engine-oil-viscosity">Understanding viscosity grades</a></p>`;
  if (/approv/.test(t)) return `<p>This prototype shows ${p.approvals.length} placeholder approval cards and no real approvals. In production, verified approvals appear in the Approvals section.</p>`;
  if (/tds|sds|data sheet|document|download/.test(t)) return `<p>The key technical data is on the page. You can also open the documents:</p><p><button class="link" data-act="doc" data-arg="TDS">View TDS</button> · <button class="link" data-act="doc" data-arg="SDS">View SDS</button></p>`;
  if (/buy|price|cost|distribut|where|dealer/.test(t)) return `<p>${esc(p.name)} is sold through Gulf authorized distributors. Prices are not shown in this prototype.</p><p><button class="link" data-act="dist">Find a distributor</button> · <button class="link" data-act="lead" data-arg="quote">Request a quote</button></p>`;
  if (/temperat|hot|heat/.test(t)) return `<p>Suitability at high temperature depends on the grade and specification your manufacturer requires. ${esc(p.name)} is grade ${esc(p.grade)}; see the technical data table.</p><p><button class="link" data-act="lead" data-arg="expert">Ask an expert about your conditions</button></p>`;
  if (/used for|what is|use|purpose|about/.test(t)) return `<p>${esc(p.name)} is a ${esc(p.category.toLowerCase())}, grade ${esc(p.grade)}. It is designed for: ${esc(p.applications.map(a => APP(a).name).join(', '))}.</p>`;
  return `<p>I can answer from the ${esc(p.name)} product record: what it is used for, vehicles and equipment, specifications, grade, documents, related products and where to buy.</p><p><button class="link" data-act="lead" data-arg="expert">Or talk to a Gulf Expert</button></p>`;
}
function ask(q) { q = q.trim(); if (!q) return; Analytics.track('ai_advisor_question', {product: state.current, question: q}); state.ai.push({u: q}, {a: answer(q)}); renderAI(); }
function renderAI() {
  const p = P(state.current), prompts = ['What is this product used for?', 'Which vehicles is this suitable for?', 'What specification does it meet?', 'What is the difference between this and the related product?', 'Which Gulf product should I use instead?'];
  $('#ai').innerHTML = `<header><h2>Ask Gulf AI</h2><button class="x" data-act="ai" aria-label="Close advisor">×</button></header>
    <div class="log" id="ailog"><div class="msg a"><p>Ask about <strong>${esc(p.name)}</strong>. Answers come from this product page's data.</p><p class="small muted">Simulated, rule-based advisor. Demo data.</p></div>${state.ai.map(m => m.u ? `<div class="msg u">${esc(m.u)}</div>` : `<div class="msg a">${m.a}</div>`).join('')}</div>
    <div class="prompts">${prompts.map(x => `<button class="chip" data-act="ask" data-arg="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <form data-form="ai"><label class="sr" for="aiq">Your question</label><input id="aiq" name="q" placeholder="Is this suitable for my vehicle?" autocomplete="off"><button class="btn sm" type="submit">Ask</button></form>`;
  const l = $('#ailog'); l.scrollTop = l.scrollHeight;
}

/* ================================ FORMS ================================
   PRODUCTION: POST /api/leads → validation, consent → CRM (e.g. Salesforce),
   carrying product, page URL and form type as lead context.               */
function submitLead(form) {
  const d = Object.fromEntries(new FormData(form)), kind = form.dataset.kind, e = {};
  if (d.name.trim().length < 2) e.name = 'Enter your name.';
  if (!/^[6-9]\d{9}$/.test(d.mobile.trim())) e.mobile = 'Enter a valid 10-digit mobile number.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) e.email = 'Enter a valid email address.';
  if (d.city.trim().length < 2) e.city = 'Enter your city.';
  if (!d.requirement) e.requirement = 'Select a requirement.';
  $$('.field[data-f]', form).forEach(f => { const er = $('.err', f); if (er) er.textContent = e[f.dataset.f] || ''; f.classList.toggle('bad', !!e[f.dataset.f]); });
  const first = Object.keys(e)[0]; if (first) return form.querySelector(`[name=${first}]`).focus();
  Leads.add({...d, kind, productId: state.current, page: P(state.current).url, at: new Date().toISOString()});
  Analytics.track(LEAD[kind].ev + '_submitted', {product: state.current, requirement: d.requirement, city: d.city});
  const box = document.createElement('div'); box.setAttribute('role', 'status');
  box.innerHTML = `<div class="eyebrow" style="color:var(--ok)">Request received</div><h3>Thank you. Your request has been received.</h3><p>Product of interest: <strong>${esc(d.product)}</strong>. A Gulf representative will contact you.</p><p class="small muted">Prototype: stored in this browser only.</p>${form.closest('.modal') ? '<button class="btn" data-act="close">Continue</button>' : ''}`;
  form.replaceWith(box); const b = $('.btn', box); if (b) b.focus();
}
function submitDist(form) {
  const idp = form.dataset.idp, pin = new FormData(form).get('pin').trim();
  if (!/^\d{6}$/.test(pin)) { $('#' + idp + '-err').textContent = 'Enter a valid 6-digit pincode.'; return; }
  let list = DISTRIBUTORS.filter(d => d.pin.slice(0, 2) === pin.slice(0, 2)); const exact = list.length > 0; if (!exact) list = DISTRIBUTORS.slice(0, 3);
  state.dist[idp] = {pin, list, exact}; Analytics.track('distributor_search', {product: state.current, pincode: pin, results: list.length});
  form.parentElement.innerHTML = distFinder(idp);
}

/* ================================ EVENTS ================================ */
document.addEventListener('click', e => {
  const tr = e.target.closest('[data-track]'); if (tr) { const [ev, d] = tr.dataset.track.split('|'); Analytics.track(ev, {detail: d, from: state.current}); }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const fn = ACT[b.dataset.act]; if (fn) { e.preventDefault(); fn(b.dataset.arg || '', b); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#modal-root').innerHTML) closeModal(); else if (!$('#ai').hidden) ACT.ai(); }
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.gnode[data-act]')) { e.preventDefault(); ACT.gnode(e.target.dataset.arg); }
});
document.addEventListener('submit', e => {
  const f = e.target.dataset.form; if (!f) return; e.preventDefault();
  if (f === 'lead') submitLead(e.target);
  if (f === 'dist') submitDist(e.target);
  if (f === 'search') { const q = new FormData(e.target).get('q').trim(); go('/search?q=' + encodeURIComponent(q)); }
  if (f === 'ai') { const i = $('#aiq'); ask(i.value); }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.input === 'vf') { $$('#vchips .chip').forEach((c, i) => c.classList.toggle('on', i === 0)); filterVehicles(t.value.toLowerCase().trim()); }
  const lf = t.closest('[data-form=lead]'); if (lf && !lf.dataset.started) { lf.dataset.started = 1; Analytics.track(LEAD[lf.dataset.kind].ev + '_started', {product: state.current}); }
});
document.addEventListener('change', e => { if (e.target.dataset.change === 'switch') { state.ai = []; state.graph = 'application'; go(P(e.target.value).url); } });
document.addEventListener('toggle', e => { const d = e.target; if (d.dataset && d.dataset.faq !== undefined && d.open) Analytics.track('faq_opened', {product: state.current, question: P(state.current).faqs[+d.dataset.faq].q}); }, true);
window.addEventListener('hashchange', () => { if (R.path[0] !== 'finder' && location.hash.startsWith('#/finder')) Analytics.track('product_finder_opened', {from: state.current}); closeModal(); render(); });

/* ================================= INIT ================================= */
$('#switcher').innerHTML = PRODUCTS.map(p => `<option value="${p.id}">View another product: ${esc(p.name)}</option>`).join('');
$('#foot-products').innerHTML = PRODUCTS.map(p => `<li><a href="#${p.url}">${esc(p.name)}</a></li>`).join('');
render();
