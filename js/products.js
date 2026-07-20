// ==========================================================================
// Temo Mobile Store — Products page: search, filter, sort
// ==========================================================================

let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  try {
    const res = await fetch('data/products.json');
    allProducts = await res.json();
  } catch (err) {
    grid.innerHTML = '<p>تعذّر تحميل المنتجات حاليًا.</p>';
    return;
  }

  applyCategoryFromUrl();
  setupFilterListeners();
  setupMobileFiltersDrawer();
  render();
});

function applyCategoryFromUrl() {
  const category = new URLSearchParams(window.location.search).get('category');
  if (!category) return;
  const checkbox = document.querySelector(`input[data-filter="category"][value="${category}"]`);
  if (checkbox) checkbox.checked = true;
}

function setupFilterListeners() {
  document.querySelectorAll('input[data-filter]').forEach(input => {
    input.addEventListener('change', render);
  });
  document.getElementById('searchInput').addEventListener('input', render);
  document.getElementById('sortSelect').addEventListener('change', render);
  document.getElementById('minPrice').addEventListener('input', render);
  document.getElementById('maxPrice').addEventListener('input', render);

  document.getElementById('resetFilters').addEventListener('click', () => {
    document.querySelectorAll('input[data-filter]').forEach(input => (input.checked = false));
    document.getElementById('searchInput').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'default';
    render();
  });
}

function setupMobileFiltersDrawer() {
  const sidebar = document.getElementById('filtersSidebar');
  const overlay = document.getElementById('filtersOverlay');
  const openBtn = document.getElementById('filtersToggle');
  const closeBtn = document.getElementById('filtersClose');

  const open = () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  };
  const close = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', close);
}

function getCheckedValues(filterName) {
  return Array.from(document.querySelectorAll(`input[data-filter="${filterName}"]:checked`)).map(el => el.value);
}

function render() {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('productsCount');

  const selectedCategories = getCheckedValues('category');
  const selectedBrands = getCheckedValues('brand');
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const minPrice = parseFloat(document.getElementById('minPrice').value);
  const maxPrice = parseFloat(document.getElementById('maxPrice').value);
  const sortBy = document.getElementById('sortSelect').value;

  let filtered = allProducts.filter(p => {
    if (selectedCategories.length && !selectedCategories.includes(p.category)) return false;
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (!isNaN(minPrice) && p.price < minPrice) return false;
    if (!isNaN(maxPrice) && p.price > maxPrice) return false;
    return true;
  });

  if (sortBy === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name, 'ar'));

  countEl.textContent = `${filtered.length} منتج`;
  emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
  grid.innerHTML = filtered.map(buildProductCard).join('');
}
