// ==========================================================================
// Temo Mobile Store — Product details page
// ==========================================================================

const CATEGORY_LABELS = {
  iphone: 'iPhone',
  samsung: 'Samsung',
  xiaomi: 'Xiaomi',
  oppo: 'Oppo',
  realme: 'Realme',
  accessories: 'إكسسوارات',
  other: 'أخرى'
};

const WHATSAPP_NUMBER = '201000000000';

document.addEventListener('DOMContentLoaded', async () => {
  const layout = document.getElementById('productDetailsLayout');
  if (!layout) return;

  const id = new URLSearchParams(window.location.search).get('id');

  let products = [];
  try {
    const res = await fetch('data/products.json');
    products = await res.json();
  } catch (err) {
    layout.innerHTML = '<p>تعذّر تحميل بيانات المنتج حاليًا.</p>';
    return;
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    layout.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        😕 المنتج غير موجود أو تم حذفه.
        <br><br>
        <a href="products.html" class="btn btn-primary">تصفح كل المنتجات</a>
      </div>
    `;
    return;
  }

  renderProduct(product);
  renderRelated(product, products);
});

function renderProduct(product) {
  document.getElementById('pageTitle').textContent = `${product.name} | Temo Mobile Store`;
  document.getElementById('breadcrumbCurrent').textContent = product.name;

  const icon = CATEGORY_ICONS[product.category] || '📱';
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const inStock = product.quantity > 0;
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  const whatsappMessage = encodeURIComponent(
    `مرحبًا، أنا مهتم بمنتج: ${product.name} (${formatPrice(product.price)}). هل ما زال متوفر؟`
  );

  const galleryContent = product.image
    ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:cover;">`
    : icon;
  const descriptionText = product.description
    ? escapeHtml(product.description)
    : 'الوصف التفصيلي لهذا المنتج هيتضاف قريبًا.';

  document.getElementById('productDetailsLayout').innerHTML = `
    <div>
      <div class="gallery-main">${galleryContent}</div>
      ${product.image ? '' : '<p class="gallery-note">صور المنتج الحقيقية هتتضاف قريبًا</p>'}
    </div>
    <div>
      <div class="details-brand">${escapeHtml(product.brand)}</div>
      <h1 class="details-title">${escapeHtml(product.name)}</h1>

      <div class="details-price-row">
        <span class="details-price">${formatPrice(product.price)}</span>
        ${hasDiscount ? `<span class="details-price-original">${formatPrice(product.originalPrice)}</span>` : ''}
      </div>

      <span class="details-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
        ${inStock ? '✅ متوفر' : '❌ غير متوفر حاليًا'}
      </span>

      <div class="details-meta">
        <div class="details-meta-item"><strong>القسم</strong>${categoryLabel}</div>
        <div class="details-meta-item"><strong>الشركة</strong>${escapeHtml(product.brand)}</div>
      </div>

      <p class="details-description">${descriptionText}</p>

      <div class="details-actions">
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}" target="_blank" rel="noopener" class="btn btn-whatsapp">💬 اطلب عبر واتساب</a>
        <a href="products.html" class="btn btn-outline" style="color: var(--color-primary); border-color: var(--color-border);">الرجوع للمنتجات</a>
      </div>
    </div>
  `;
}

function renderRelated(product, allProducts) {
  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  if (related.length === 0) return;

  document.getElementById('relatedSection').style.display = 'block';
  const relatedGrid = document.getElementById('relatedGrid');
  relatedGrid.innerHTML = related.map(buildProductCard).join('');
  observeReveal(relatedGrid);
}
