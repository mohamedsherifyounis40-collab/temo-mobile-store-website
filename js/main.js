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
  loadFeaturedProducts();
});

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
    <div class="product-card">
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
