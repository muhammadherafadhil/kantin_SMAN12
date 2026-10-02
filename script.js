const menuData = [
  { id: 1, name: "Iced Coffee Gula Aren", category: "Minuman", price: 10000, desc: "Kopi dingin dengan gula aren.", image: "foto/kopi-gula-aren.png", badge: "Terlaris" },
  { id: 2, name: "Iced Americano", category: "Minuman", price: 7000, desc: "Kopi Americano dingin.", image: "foto/americano.png", badge: "" },
  { id: 3, name: "Iced Kopi Susu", category: "Minuman", price: 10000, desc: "Kopi susu dingin.", image: "foto/kopi-susu.png", badge: "" },
  { id: 4, name: "Es Coklat", category: "Minuman", price: 7000, desc: "Coklat dingin segar, ukuran gelas besar.", image: "foto/coklat.png", badge: "" },
  { id: 5, name: "Es Matcha", category: "Minuman", price: 7000, desc: "Es matcha yang menyegarkan.", image: "foto/matcha.png", badge: "Baru" },
  { id: 6, name: "Es Hazelnut", category: "Minuman", price: 7000, desc: "Es hazelnut yang lezat.", image: "foto/hazelnut.png", badge: "" },
  { id: 7, name: "Roti daging ayam", category: "Snack", price: 5000, desc: "Roti dengan isian daging ayam.", image: "foto/roti ayam.png", badge: "" },
  { id: 8, name: "Roti Sosis", category: "Snack", price: 5000, desc: "Roti dengan isian sosis.", image: "foto/roti sosis.png", badge: "Favorit" },
  { id: 9, name: "Roti Coklat Pisang", category: "Snack", price: 3000, desc: "Roti coklat dengan isian pisang.", image: "foto/roti pisang.png", badge: "" },
  { id: 10, name: "Tela-Tela", category: "Makanan", price: 5000, desc: "Tela-tela yang lezat.", image: "foto/tela.png", badge: "" },
  { id: 10, name: "Tahu Gila", category: "Makanan", price: 5000, desc: "Tahu yang lezat.", image: "foto/tahu.png", badge: "" },
  { id: 10, name: "Crepes", category: "Snack", price: 5000, desc: "Crapes yang lezat.", image: "foto/crapes.png", badge: "" },
  { id: 10, name: "Mie level", category: "Makanan", price: 10000, desc: "Mie level yang lezat.", image: "foto/mie lavel.png", badge: "" },
];

let cart = [];
let currentCategory = "Semua";
let searchQuery = "";

const productsGrid = document.getElementById('productsGrid');
const cartList = document.getElementById('cartList');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const modalTotal = document.getElementById('modalTotal');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.cat-btn');
const overlay = document.getElementById('overlay');
const cartSidebar = document.getElementById('cartSidebar');
const modal = document.getElementById('checkoutModal');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const toast = document.getElementById('toast');

function formatRupiah(angka) {
  return 'Rp' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function renderProducts() {
  const filtered = menuData.filter(item => {
    const matchCat = currentCategory === "Semua" || item.category === currentCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    productsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
      <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
      <p>Menu tidak ditemukan.</p>
    </div>`;
    return;
  }

  productsGrid.innerHTML = filtered.map(item => `
    <div class="product-card">
      <div class="product-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        ${item.badge ? `<span class="product-badge">${item.badge}</span>` : ''}
      </div>
      <div class="product-info">
        <div class="product-cat">${item.category}</div>
        <h3 class="product-name">${item.name}</h3>
        <p class="product-desc">${item.desc}</p>
        <div class="product-footer">
          <span class="product-price">${formatRupiah(item.price)}</span>
          <button class="add-btn" onclick="addToCart(${item.id})" aria-label="Tambah ke keranjang">
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCart() {
  if (cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 2rem 0;">
        <i class="fas fa-shopping-basket" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.3;"></i>
        <p>Keranjang masih kosong</p>
      </div>`;
    cartCount.textContent = '0';
    cartTotal.textContent = 'Rp0';
    modalTotal.textContent = 'Rp0';
    return;
  }

  let total = 0;
  let count = 0;

  cartList.innerHTML = cart.map(item => {
    total += item.price * item.qty;
    count += item.qty;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatRupiah(item.price)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
            <span class="cart-item-qty">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
            <button class="qty-btn" style="margin-left: auto; color: #ef4444;" onclick="removeFromCart(${item.id})">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  cartCount.textContent = count;
  cartTotal.textContent = formatRupiah(total);
  modalTotal.textContent = formatRupiah(total);
}

function addToCart(id) {
  const item = menuData.find(p => p.id === id);
  if (!item) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  renderCart();
  showToast(`${item.name} ditambahkan ke keranjang`);

  if (cart.length === 1 && existing === undefined) {
    openCart();
  }
}

function updateQty(id, change) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    renderCart();
  }
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
}

function openCart() {
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function openModal() {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }
  closeCart();
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('active');
}

function closeLightbox() {
  lightbox.classList.remove('active');
}

function showToast(msg) {
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 3000);
}

document.getElementById('openCart').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
overlay.addEventListener('click', () => {
  closeCart();
  closeModal();
});

const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('active'));
});

categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.cat;
    renderProducts();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderProducts();
});

function submitOrder(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const nama = formData.get('nama');
  const kelas = formData.get('kelas');
  const telepon = formData.get('telepon');
  const waktu = formData.get('waktu');
  const catatan = formData.get('catatan') || '-';

  let total = 0;
  let itemList = cart.map(item => {
    total += item.price * item.qty;
    return `- ${item.name} (${item.qty}x) = ${formatRupiah(item.price * item.qty)}`;
  }).join('%0A');

  const message = `*PESANAN KANTIN BAROKAH*%0A%0A` +
    `*Data Pemesan:*%0A` +
    `Nama: ${nama}%0A` +
    `Kelas: ${kelas}%0A` +
    `No. WA: ${telepon}%0A` +
    `Waktu Ambil: ${waktu}%0A%0A` +
    `*Detail Pesanan:*%0A${itemList}%0A%0A` +
    `*Total: ${formatRupiah(total)}*%0A` +
    `Catatan: ${catatan}%0A%0A` +
    `Mohon konfirmasi ketersediaan pesanan ini. Terima kasih!`;

  const phone = '6285298340407';
  const waUrl = `https://wa.me/${phone}?text=${message}`;

  window.open(waUrl, '_blank');

  cart = [];
  renderCart();
  closeModal();
  e.target.reset();
  showToast('Pesanan dikirim ke WhatsApp!');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeLightbox();
    closeCart();
  }
});

renderProducts();
renderCart();

/* ============================================================
   ANIMASI OPENING WEBSITE
   ============================================================ */
(function openingAnimation() {
  // Buat elemen loading screen
  const loader = document.createElement('div');
  loader.id = 'openingLoader';
  loader.innerHTML = `
    <div class="opening-logo">
      <i class="fas fa-mug-hot"></i>
      <h1>Kantin Barokah</h1>
      <div class="opening-bar"><span></span></div>
    </div>
  `;

  // Style inline agar tidak perlu ubah CSS eksternal
  loader.style.position = 'fixed';
  loader.style.inset = '0';
  loader.style.zIndex = '99999';
  loader.style.display = 'flex';
  loader.style.alignItems = 'center';
  loader.style.justifyContent = 'center';
  loader.style.background = 'linear-gradient(135deg, #1f1c2c, #928dab)';
  loader.style.color = '#fff';
  loader.style.transition = 'opacity 0.8s ease, visibility 0.8s ease';

  const style = document.createElement('style');
  style.textContent = `
    #openingLoader .opening-logo {
      text-align: center;
      animation: openingFadeUp 1s ease forwards;
    }
    #openingLoader .opening-logo i {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
      animation: openingPulse 1.5s ease-in-out infinite;
    }
    #openingLoader .opening-logo h1 {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
    }
    #openingLoader .opening-bar {
      width: 180px;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      overflow: hidden;
      margin: 0 auto;
    }
    #openingLoader .opening-bar span {
      display: block;
      height: 100%;
      width: 0%;
      background: #fff;
      border-radius: 4px;
      animation: openingLoad 1.8s ease forwards;
    }
    @keyframes openingFadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes openingPulse {
      0%, 100% { transform: scale(1); }
      50%      { transform: scale(1.15); }
    }
    @keyframes openingLoad {
      0%   { width: 0%; }
      100% { width: 100%; }
    }
    body.opening-lock {
      overflow: hidden;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(loader);
  document.body.classList.add('opening-lock');

  // Hilangkan loader setelah animasi selesai
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      document.body.classList.remove('opening-lock');

      setTimeout(() => {
        loader.remove();
      }, 800);
    }, 2000);
  });

  // Fallback jika load event sudah terjadi
  if (document.readyState === 'complete') {
    setTimeout(() => {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      document.body.classList.remove('opening-lock');
      setTimeout(() => loader.remove(), 800);
    }, 2000);
  }
})();