// Data-driven starter that populates DOM from /content/site.json

// Mobile nav
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
  document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  }));
}

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Load data
async function loadSite() {
  try {
    const res = await fetch('content/site.json');
    const site = await res.json();

    document.title = site.seo?.title || `${site.name} – Resume`;
    const desc = document.getElementById('seo-description');
    if (desc && site.seo?.description) desc.setAttribute('content', site.seo.description);

    setText('nav-name', site.name);
    setText('hero-name', site.name);
    setText('hero-role', site.role);
    setText('hero-bio', site.bio || '');
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear().toString();
    const copy = document.getElementById('footer-copy');
    if (copy) copy.firstChild && (copy.firstChild.textContent = `© `);

    // Projects
    renderProjects(site.projects || []);
    // Skills
    renderSkills(site.skills || {});
    // Contact
    renderContact(site);
  } catch (err) {
    console.error('Failed to load site.json', err);
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) el.textContent = value;
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';
  projects.forEach(p => {
    const aOpen = p.href ? `<a href="${p.href}" class="project-card-link" target="_blank" rel="noopener">` : `<div class="project-card-link">`;
    const aClose = p.href ? `</a>` : `</div>`;
    const tags = (p.tags || []).map(t => `<span class="tech-tag">${t}</span>`).join('');
    const icon = p.icon || 'fa-cogs';
    grid.insertAdjacentHTML('beforeend', `
      <div class="project-card">
        ${aOpen}
          <div class="project-image">
            <div class="project-placeholder"><i class="fas ${icon}"></i></div>
          </div>
          <div class="project-content">
            <h3>${p.title || 'Untitled Project'}</h3>
            <p>${p.blurb || ''}</p>
            <div class="project-tech">${tags}</div>
          </div>
        ${aClose}
      </div>
    `);
  });
}

function renderSkills(skills) {
  const wrapper = document.getElementById('skills-content');
  if (!wrapper) return;
  wrapper.innerHTML = '';
  Object.entries(skills).forEach(([category, items]) => {
    const grid = (items || []).map(s => `
      <div class="skill-item">
        ${s.icon ? `<i class="${s.icon}"></i>` : `<i class="fas fa-check-circle"></i>`}
        <span>${s.label || s}</span>
      </div>
    `).join('');
    wrapper.insertAdjacentHTML('beforeend', `
      <div class="skills-category">
        <h3>${category}</h3>
        <div class="skills-grid">${grid}</div>
      </div>
    `);
  });
}

function renderContact(site) {
  const list = document.getElementById('contact-items');
  if (!list) return;
  const rows = [];
  if (site.email) {
    rows.push(`<div class="contact-item"><i class="fas fa-envelope"></i><a class="contact-link" href="mailto:${site.email}">${site.email}</a></div>`);
  }
  (site.socials || []).forEach(s => {
    const icon = s.icon || 'fas fa-link';
    rows.push(`<div class="contact-item"><i class="${icon}"></i><a class="contact-link" href="${s.href}" target="_blank" rel="noopener">${s.label}</a></div>`);
  });
  list.innerHTML = rows.join('');
}

// Notifications + basic validation (simple, client-side)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();
    if (!name || !email || !message) return notify('Please fill in all fields.', 'error');
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return notify('Please enter a valid email address.', 'error');
    notify("Thanks — I'll get back to you soon.", 'success');
    contactForm.reset();
  });
}

function notify(msg, type='info') {
  const prev = document.querySelector('.notification');
  if (prev) prev.remove();
  const el = document.createElement('div');
  el.className = 'notification';
  el.style.cssText = `position:fixed;top:20px;right:20px;background:${type==='success'?'#10b981':type==='error'?'#ef4444':'#3b82f6'};color:white;padding:1rem 1.25rem;border-radius:8px;z-index:10000;box-shadow:0 6px 18px rgba(0,0,0,.2);`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 4000);
}

// Active nav highlight on scroll
function updateActive() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop;
    if (scrollY >= top - 200) current = section.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}
window.addEventListener('scroll', updateActive);
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
  updateActive();
  loadSite();
});
