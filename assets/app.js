// Basic client-side renderer for JSON content managed by Decap CMS
async function loadJSON(path){
  const res = await fetch(path, {cache: 'no-store'});
  if(!res.ok) throw new Error(`Failed to load ${path}`);
  return await res.json();
}

function setText(id, text){
  const el = document.getElementById(id);
  if(el) el.textContent = text;
}

function setHTML(id, html){
  const el = document.getElementById(id);
  if(el) el.innerHTML = html;
}

function badge(text){ return `<span class="badge">${text}</span>`; }
function chip(text){ return `<span class="chip">${text}</span>`; }

// Home
async function initHome(){
  const site = await loadJSON('/content/site.json');
  const home = await loadJSON('/content/home.json');
  setText('brandName', site.siteName);
  setText('heroTitle', home.hero_title);
  setText('heroSub', home.hero_subtitle);
  const badges = home.highlights.map(badge).join('');
  setHTML('heroBadges', badges);
  // Property summary cards
  const propsIndex = await loadJSON('/content/properties/index.json');
  const cards = [];
  for (const slug of propsIndex.slugs){
    const p = await loadJSON(`/content/properties/${slug}.json`);
    cards.push(`
      <div class="card">
        <h3>${p.name}</h3>
        <p class="muted">${p.short_description}</p>
        <div class="chips" style="margin:10px 0">${p.smart_features.slice(0,5).map(chip).join('')}</div>
        <a class="btn primary" href="/properties.html?slug=${encodeURIComponent(p.slug)}">View details</a>
      </div>
    `);
  }
  setHTML('propertyCards', cards.join(''));
}

// Properties
async function initProperty(){
  const url = new URL(location.href);
  const slug = url.searchParams.get('slug') || 'wollemi-smart-palace';

  // Set brand name on this page too (for consistency)
  try {
    const site = await loadJSON('/content/site.json');
    setText('brandName', site.siteName);
  } catch (e) { /* non-blocking */ }

  const p = await loadJSON(`/content/properties/${slug}.json`);
  setText('propName', p.name);
  setHTML('propMeta', `<div class="chips">
    ${chip(p.location)} ${chip(`${p.capacity} guests`)} ${chip(p.bedrooms)} ${chip(p.bathrooms)} ${chip(p.parking)}
  </div>`);
  setHTML('propDesc', `<p>${p.long_description}</p>`);
  setHTML('propSmart', p.smart_features.map(f => `<li>${f}</li>`).join(''));
  setHTML('propAmenities', p.amenities.map(f => `<li>${f}</li>`).join(''));
  setHTML('propRules', p.house_rules.map(f => `<li>${f}</li>`).join(''));

  // Wi-Fi — always hide real credentials on the public site
  setHTML('wifi', `<div class="card"><strong>Wi-Fi:</strong> Available at the property. <em>Login details are provided after booking.</em></div>`);

  // House Manual button (gated for guests via Netlify Identity)
  const mb = document.getElementById('manualButton');
  if (mb) {
    if (p.manual && p.manual.url) {
      mb.innerHTML = `<button class="btn ghost" id="openManual">House Manual (guests)</button>`;
      const openBtn = mb.querySelector('#openManual');

      // helper: check Netlify Identity current user
      const currentUser = () => {
        return (window.netlifyIdentity &&
                typeof window.netlifyIdentity.currentUser === 'function' &&
                window.netlifyIdentity.currentUser());
      };

      openBtn.addEventListener('click', () => {
        const user = currentUser();
        if (user) {
          // logged in → open manual
          location.href = p.manual.url;
        } else {
          // not logged in → go to guest login then redirect back
          const next = encodeURIComponent(p.manual.url);
          location.href = `/guest.html?next=${next}`;
        }
      });
    } else {
      mb.innerHTML = `<span class="muted small">House manual available to guests after booking.</span>`;
    }
  }

  // Gallery
  const g = document.getElementById('gallery');
  g.innerHTML = p.gallery.map(img => `<img src="${img.src}" alt="${img.alt}" loading="lazy" onclick="openModal('${img.src}')">`).join('');

  // Book buttons
  const bb = document.getElementById('bookButtons');
  const pay = (p.booking && p.booking.stripe_payment_link) ? p.booking.stripe_payment_link : '#';
  bb.innerHTML = `
    <a class="btn primary" href="/booking.html?slug=${encodeURIComponent(p.slug)}">Request to Book</a>
    <a class="btn ghost" ${pay!=='#' ? `href="${pay}"` : ''}>${pay!=='#'?'Instant Checkout':'Instant Checkout (set Stripe Link)'}</a>
  `;
}

// Gallery Page
async function initGallery(){
  const idx = await loadJSON('/content/properties/index.json');
  const tabs = document.getElementById('tabs');
  const gal = document.getElementById('gallery');
  let current = idx.slugs[0];
  async function render(slug){
    const p = await loadJSON(`/content/properties/${slug}.json`);
    gal.innerHTML = p.gallery.map(img => `<img src="${img.src}" alt="${img.alt}" loading="lazy" onclick="openModal('${img.src}')">`).join('');
    for(const b of tabs.querySelectorAll('button')) b.classList.toggle('active', b.dataset.slug===slug);
  }
  tabs.innerHTML = idx.slugs.map(slug=>`<button data-slug="${slug}">${slug.replace(/-/g,' ')}</button>`).join('');
  tabs.addEventListener('click', (e)=>{
    if(e.target.tagName==='BUTTON'){ current = e.target.dataset.slug; render(current); }
  });
  await render(current);
}

// Booking (Netlify Forms)
async function initBooking(){
  const url = new URL(location.href);
  const slug = url.searchParams.get('slug');
  if(slug){
    try{
      const p = await loadJSON(`/content/properties/${slug}.json`);
      const sel = document.querySelector('select[name="property"]');
      if(sel){
        for(const opt of sel.options){ opt.selected = (opt.value===slug); }
      }
      setHTML('bookingHelp', `<div class="alert small">You're booking: <strong>${p.name}</strong>. After you submit, we'll confirm availability and send a Stripe checkout link.</div>`);
    }catch(e){ /* ignore */ }
  }
}

// Contact
async function initContact(){
  const site = await loadJSON('/content/site.json');
  setText('brandName', site.siteName);
  setHTML('contactCards', `
    <div class="card">
      <h3>Call</h3>
      <p>Stuart Schmidt — <a href="tel:+61414366815">0414 366 815</a></p>
      <p>Lina Sun — <a href="tel:+61412188947">0412 188 947</a></p>
    </div>
    <div class="card">
      <h3>Email</h3>
      <p><a href="mailto:bookings@bluemountainssmarthomes.com">bookings@bluemountainssmarthomes.com</a></p>
    </div>
    <div class="card">
      <h3>Location</h3>
      <p>Katoomba, Blue Mountains, NSW</p>
      <p class="small">Exact address provided after booking.</p>
    </div>
  `);
}

// Lightbox
function openModal(src){
  const m = document.getElementById('modal');
  const img = document.getElementById('modalImg');
  img.src = src;
  m.classList.add('open');
}
function closeModal(){ document.getElementById('modal').classList.remove('open'); }
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
