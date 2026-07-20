// ==========================================================================
// Temo Mobile Store — Shared front-end logic (nav, footer, featured products)
// ==========================================================================

const CATEGORY_ICONS = {
  iphone: '📱',
  samsung: '📱',
  xiaomi: '📱',
  oppo: '📱',
  realme: '📱',
  accessories: '🎧',
  other: '🔌'
};

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupFooterYear();
  setupPageTransitions();
  loadFeaturedProducts();
  observeReveal(document);
});

// ---------- Scroll reveal (fade-in + slide-up) ----------
let _revealObserver = null;

function getRevealObserver() {
  if (_revealObserver || !('IntersectionObserver' in window)) return _revealObserver;
  _revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        _revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  return _revealObserver;
}

function observeReveal(root) {
  const items = (root || document).querySelectorAll('.reveal:not(.is-visible)');
  const observer = getRevealObserver();
  if (!observer) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  items.forEach(el => observer.observe(el));
}

// ---------- Lightweight page transition ----------
function setupPageTransitions() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', (e) => {
    if (reduceMotion) return;

    const link = e.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    e.preventDefault();
    document.body.classList.add('page-fade-out');
    setTimeout(() => { window.location.href = href; }, 200);
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-fade-out');
  });
}

function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => links.classList.remove('open'));
  });
}

function setupFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;

  try {
    const res = await fetch('data/products.json');
    const products = await res.json();
    const featured = products.filter(p => p.featured);
    const toShow = featured.length > 0 ? featured : products.slice(0, 8);
    grid.innerHTML = toShow.map(buildProductCard).join('');
    observeReveal(grid);
  } catch (err) {
    grid.innerHTML = '<p>تعذّر تحميل المنتجات حاليًا.</p>';
  }
}

function buildProductCard(product) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const icon = CATEGORY_ICONS[product.category] || '📱';

  const discountBadge = hasDiscount
    ? `<span class="product-badge badge-discount">-${Math.round((1 - product.price / product.originalPrice) * 100)}%</span>`
    : '';
  const newBadge = !hasDiscount && product.isNew
    ? `<span class="product-badge badge-new">جديد</span>`
    : '';
  const originalPriceHtml = hasDiscount
    ? `<span class="price-original">${formatPrice(product.originalPrice)}</span>`
    : '';

  const thumbContent = product.image
    ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">`
    : icon;

  return `
    <div class="product-card reveal">
      ${discountBadge}${newBadge}
      <div class="product-thumb">${thumbContent}</div>
      <div class="product-body">
        <div class="product-brand">${escapeHtml(product.brand)}</div>
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="price-row">
          <span class="price">${formatPrice(product.price)}</span>
          ${originalPriceHtml}
        </div>
        <a href="product-details.html?id=${encodeURIComponent(product.id)}" class="product-cta">عرض التفاصيل</a>
      </div>
    </div>
  `;
}

function formatPrice(value) {
  return value.toLocaleString('en-US') + ' ج.م';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
