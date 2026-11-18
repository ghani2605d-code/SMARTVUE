/* SMARTVUE interactive front-end */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let toastTimer, cart = 0, selected = null;
  // Send GA4-ready events through the site's existing Google Tag Manager container.
  window.dataLayer = window.dataLayer || [];
  const track = (event, parameters = {}) => window.dataLayer.push({ event, ...parameters });
  const gaItem = (product) => ({
    item_id: product.model || product.name,
    item_name: product.name,
    item_brand: 'SMARTVUE',
    item_category: 'Smartwatch',
    price: product.price,
    quantity: 1,
    currency: 'USD'
  });
  window.notify = (message) => { const t = $('#toast'); t.textContent = message; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2700) };
  const modal = $('#productModal'), closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true') };
  $$('.outline-btn[data-product]').forEach(b => b.addEventListener('click', () => {
    selected = { name: b.dataset.product, price: Number(b.dataset.price), model: b.dataset.model };
    $('#modalTitle').textContent = selected.name; $('#modalMeta').textContent = `Model: ${selected.model} • SMARTVUE featured timepiece`;
    $('#modalPrice').innerHTML = `${selected.price}$ <span>/ product price</span>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); $('#addToCart').focus();
    track('view_item', { currency: 'USD', value: selected.price, items: [gaItem(selected)] });
  }));
  $('#modalClose').addEventListener('click', closeModal); $('#continueShopping').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal() });
  $('#addToCart').addEventListener('click', () => {
    if (!selected) return;
    cart++;
    $('#cartCount').textContent = cart;
    track('add_to_cart', { currency: 'USD', value: selected.price, items: [gaItem(selected)] });
    closeModal();
    notify(`${selected.name} added to your demo cart`);
  });
  $('#cartOpen').addEventListener('click', () => {
    track('view_cart', { currency: 'USD', item_count: cart });
    notify(cart ? `Your demo cart has ${cart} item${cart === 1 ? '' : 's'}.` : 'Your cart is currently empty.');
  });
  const searchPanel = $('#searchPanel'), searchInput = $('#productSearch');
  $('#searchOpen').addEventListener('click', () => { searchPanel.classList.add('open'); searchInput.value = ''; searchInput.focus() });
  const closeSearch = () => searchPanel.classList.remove('open');
  searchPanel.addEventListener('click', e => { if (e.target === searchPanel) closeSearch() });
  searchInput.addEventListener('input', () => { const q = searchInput.value.trim().toLowerCase(); $$('.product').forEach(card => card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none') });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const term = searchInput.value.trim();
      if (term) track('search', { search_term: term });
      closeSearch();
      $('#collection').scrollIntoView({ behavior: 'smooth' });
    }
  });
  const menuToggle = $('#menuToggle');
  const closeMenu = () => { $('#mainNav').classList.remove('mobile-open'); menuToggle.setAttribute('aria-expanded', 'false'); };
  menuToggle.addEventListener('click', () => {
    const open = $('#mainNav').classList.toggle('mobile-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    track('navigation_menu_toggle', { menu_state: open ? 'open' : 'closed' });
  });
  $('#mainNav a').forEach(link => link.addEventListener('click', () => {
    $('#mainNav a').forEach(a => a.classList.remove('active'));
    link.classList.add('active');
    track('select_content', { content_type: 'navigation', item_id: link.getAttribute('href') });
    closeMenu();
  }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeSearch(); closeMenu(); } });
  const reveal = $$('.trust-item,.section-head,.product,.feature-band,.cta'); reveal.forEach(el => el.classList.add('reveal'));
  if ('IntersectionObserver' in window) { const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target) } }), { threshold: .12 }); reveal.forEach(el => obs.observe(el)) }
  else reveal.forEach(el => el.classList.add('is-visible'));
  const sections = ['home', 'features', 'collection', 'footer'].map(id => document.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) { const navObs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) $$('#mainNav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)) }), { rootMargin: '-35% 0px -55% 0px' }); sections.forEach(s => navObs.observe(s)) }

  // Reading progress indicator
  const progress = $('#scrollProgress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Track meaningful scroll milestones once per page view.
  const scrollMilestones = new Set();
  const trackScrollDepth = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const percent = Math.round((window.scrollY / max) * 100);
    [25, 50, 75, 90].forEach(mark => {
      if (percent >= mark && !scrollMilestones.has(mark)) {
        scrollMilestones.add(mark);
        track('scroll_depth', { percent_scrolled: mark });
      }
    });
  };
  window.addEventListener('scroll', trackScrollDepth, { passive: true });

})();
