//menu
const menuData = [
  { id: 1, name: "Iced Coffee Gula Aren", category: "Minuman", price: 10000, desc: "Kopi dingin dengan gula aren.", image: "foto/kopi-gula-aren.png", badge: "Terlaris" },
  { id: 2, name: "Iced Americano", category: "Minuman", price: 7000, desc: "Kopi Americano dingin.", image: "foto/americano.png", badge: "" },
  { id: 3, name: "Iced Kopi Susu", category: "Minuman", price: 10000, desc: "Kopi susu dingin.", image: "foto/kopi-susu.png", badge: "" },
  { id: 4, name: "Es Coklat", category: "Minuman", price: 7000, desc: "Coklat dingin segar, ukuran gelas besar.", image: "foto/coklat.png", badge: "" },
  { id: 5, name: "Es Matcha", category: "Minuman", price: 7000, desc: "Es matcha yang menyegarkan.", image: "foto/matcha.png", badge: "" },
  { id: 6, name: "Es Hazelnut", category: "Minuman", price: 7000, desc: "Es hazelnut yang lezat.", image: "foto/hazelnut.png", badge: "" },
  { id: 7, name: "Roti daging ayam", category: "Snack", price: 5000, desc: "Roti dengan isian daging ayam.", image: "foto/roti ayam.png", badge: "" },
  { id: 8, name: "Roti Sosis", category: "Snack", price: 5000, desc: "Roti dengan isian sosis.", image: "foto/roti sosis.png", badge: "Favorit" },
  { id: 9, name: "Roti Coklat Pisang", category: "Snack", price: 3000, desc: "Roti coklat dengan isian pisang.", image: "foto/roti pisang.png", badge: "Favorit" },
  { id: 10, name: "Roti Coklat", category: "Snack", price: 3000, desc: "Roti dengan isian coklat.", image: "foto/coklat.jpeg", badge: "Favorit" },
  { id: 11, name: "Tela-Tela", category: "Makanan", price: 5000, desc: "Tela-tela yang lezat.", image: "foto/tela.png", badge: "" },
  { id: 12, name: "Tahu Gila", category: "Makanan", price: 5000, desc: "Tahu yang lezat.", image: "foto/tahu.png", badge: "" },
  { id: 13, name: "Crepes", category: "Snack", price: 5000, desc: "Crepes yang lezat.", image: "foto/crapes.png", badge: "" },
  { id: 14, name: "Mie Level", category: "Makanan", price: 10000, desc: "Mie level yang lezat.", image: "foto/mie lavel.png", badge: "" },
];
//jam operasional
const OPERATIONAL_CONFIG = {
  openHour: 7,       // Buka jam 07.00
  closeHour: 15,     // Tutup jam 15.00 (kantin)
  orderCloseHour: 16, // Pesanan online ditutup jam 16.00
  openDays: [1, 2, 3, 4, 5, 6], // Senin - Sabtu (0=Min, 6=Sab)
  timezone: 'WITA'
};
//simpan keranjang,kategori menu, dan pencarian
let cart = [];
let currentCategory = "Semua";
let searchQuery = "";
let orderOpen = true;
//elemen html (diisi setelah dom siap)
let productsGrid, cartList, cartCount, cartTotal, modalTotal;
let searchInput, categoryBtns, overlay, cartSidebar, modal;
let lightbox, lightboxImg, toast, statusBanner, statusText;
let topbarJam, heroStatus, statMenu, closedModal;
//fungsi inisialisasi referensi elemen html
function initElementRefs() {
  productsGrid = document.getElementById('productsGrid');
  cartList = document.getElementById('cartList');
  cartCount = document.getElementById('cartCount');
  cartTotal = document.getElementById('cartTotal');
  modalTotal = document.getElementById('modalTotal');
  searchInput = document.getElementById('searchInput');
  categoryBtns = document.querySelectorAll('.cat-btn');
  overlay = document.getElementById('overlay');
  cartSidebar = document.getElementById('cartSidebar');
  modal = document.getElementById('checkoutModal');
  lightbox = document.getElementById('lightbox');
  lightboxImg = document.getElementById('lightboxImg');
  toast = document.getElementById('toast');
  statusBanner = document.getElementById('statusBanner');
  statusText = document.getElementById('statusText');
  topbarJam = document.getElementById('topbarJam');
  heroStatus = document.getElementById('heroStatus');
  statMenu = document.getElementById('statMenu');
  closedModal = document.getElementById('closedModal');
}
//format angka ke rupiah
function formatRupiah(angka) {
  return 'Rp' + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
//ambil waktu sekarang
function getNow() {
  return new Date();
}
//cek jam operasional
function checkOperationalStatus() {
  const now = getNow();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;

  const isOpenDay = OPERATIONAL_CONFIG.openDays.includes(day);
  const isOpenHour = currentTime >= OPERATIONAL_CONFIG.openHour && currentTime < OPERATIONAL_CONFIG.orderCloseHour;

  return {
    isOpen: isOpenDay && isOpenHour,
    day: day,
    hour: hour,
    minute: minute,
    isOpenDay: isOpenDay
  };
}
//update tampilan ui statussesuai operasional
function updateOperationalUI() {
  const status = checkOperationalStatus();
  orderOpen = status.isOpen;

  const jamSekarang = `${String(status.hour).padStart(2, '0')}.${String(status.minute).padStart(2, '0')}`;

  if (status.isOpen) {
    //KANTIN BUKA
    statusBanner.classList.add('hidden');
    statusBanner.classList.remove('open', 'closed');
    statusText.textContent = `Kantin BUKA — pesanan diterima (${jamSekarang} WITA)`;
    topbarJam.innerHTML = `<i class="far fa-clock"></i> Buka 07.00–15.00 • Sekarang ${jamSekarang}`;
    heroStatus.textContent = 'BUKA';
    heroStatus.style.color = '#22c55e';
    enableOrderButtons(true);
  } else {
    //KANTIN TUTUP
    statusBanner.classList.remove('hidden');
    statusBanner.classList.add('closed');
    let alasan = '';
    if (!status.isOpenDay) {
      alasan = 'Hari ini kantin libur (buka Senin–Sabtu)';
    } else if (status.hour >= OPERATIONAL_CONFIG.orderCloseHour) {
      alasan = `Pemesanan online ditutup (lewat ${String(OPERATIONAL_CONFIG.orderCloseHour).padStart(2, '0')}.00 WITA)`;
    } else {
      alasan = 'Kantin belum buka (buka 07.00 WITA)';
    }
    statusText.textContent = `KANTIN TUTUP — ${alasan}`;
    topbarJam.innerHTML = `<i class="far fa-clock"></i> Tutup • Buka 07.00–15.00`;
    heroStatus.textContent = 'TUTUP';
    heroStatus.style.color = '#ef4444';
    enableOrderButtons(false);
  }
}

function enableOrderButtons(enabled) {
  // aktifkan atau nonaktifkan tombol pemesanan
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.disabled = !enabled;
    btn.style.opacity = enabled ? '1' : '0.4';
    btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  });

  // Update tombol checkout
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.disabled = !enabled;
    checkoutBtn.style.opacity = enabled ? '1' : '0.5';
    checkoutBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }
}
//tampilkan kantin tutup
function showClosedModal() {
  closedModal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
//tutup kantin tutup
function closeClosedModal() {
  closedModal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
//render daftar produk ke halaman
function renderProducts() {
  if (!productsGrid) return; //jika grid belum ada, hentikan
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
        <img src="${item.image}" alt="${item.name}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/300x200/0ea5e9/ffffff?text=${encodeURIComponent(item.name)}'">
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
  // Update statistik jumlah menu
  if (statMenu) statMenu.textContent = menuData.length;
  //terapkan ulang status tombol
  enableOrderButtons(orderOpen);
}
//render isi keranjang belanja
function renderCart() {
  if (!cartList) return; //jika elemen belum ada, hentikan
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
        <img src="${item.image}" alt="${item.name}"
             onerror="this.src='https://via.placeholder.com/60/0ea5e9/ffffff?text=?'">
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
//tambah item ke keranjang
function addToCart(id) {
  //Cek jam operasional
  if (!orderOpen) {
    showClosedModal();
    showToast('Kantin sudah tutup, tidak bisa memesan.');
    return;
  }
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
//update jumlah item di keranjang
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
//hapus item keranjang
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
}
//sidebar buka keranjang
function openCart() {
  cartSidebar.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
//sidebar tutup keranjang
function closeCart() {
  cartSidebar.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
//buka modal checkout
function openModal() {
  if (cart.length === 0) {
    showToast('Keranjang masih kosong!');
    return;
  }
  // Cek jam operasional
  if (!orderOpen) {
    showClosedModal();
    showToast('Kantin sudah tutup, tidak bisa checkout.');
    return;
  }
  closeCart();
  modal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
//tutup modal checkout
function closeModal() {
  modal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}
//buka lightboxgambar
function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.add('active');
}
//tutup lightbox
function closeLightbox() {
  lightbox.classList.remove('active');
}
//notifikasi
function showToast(msg) {
  const toastMsg = document.getElementById('toastMsg');
  if (toastMsg) toastMsg.textContent = msg;
  toast.classList.add('active');
  setTimeout(() => toast.classList.remove('active'), 3000);
}
//pasang semua event listener
function bindEvents() {
  //event listener untuk klik sebuah overlay
  const openCartBtn = document.getElementById('openCart');
  if (openCartBtn) openCartBtn.addEventListener('click', openCart);

  const closeCartBtn = document.getElementById('closeCart');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);

  if (overlay) {
    overlay.addEventListener('click', () => {
      closeCart();
      closeModal();
      closeClosedModal();
    });
  }
  //menu mobile
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu && mobileMenu.classList.remove('active'));
  });
  //event listenertombol kategori dan pencarian
  if (categoryBtns) {
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.cat;
        renderProducts();
      });
    });
  }
  // listener untuk mencari
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }
  //lisner keyboard shortcut untuk tutup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeLightbox();
      closeCart();
      closeClosedModal();
    }
  });
  //tombol rekomendasi menu acak
  const heroRandomBtn = document.getElementById('heroRandomBtn');
  if (heroRandomBtn) {
    heroRandomBtn.addEventListener('click', () => {
      if (menuData.length === 0) return;
      const randomItem = menuData[Math.floor(Math.random() * menuData.length)];

      // Cari elemen produk
      const cards = document.querySelectorAll('.product-card');
      let targetCard = null;

      cards.forEach(card => {
        const nameEl = card.querySelector('.product-name');
        if (nameEl && nameEl.textContent === randomItem.name) {
          targetCard = card;
        }
      });

      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.style.transition = 'all 0.3s';
        targetCard.style.boxShadow = '0 0 0 4px var(--primary), var(--shadow-lg)';
        targetCard.style.transform = 'scale(1.03)';
        setTimeout(() => {
          targetCard.style.boxShadow = '';
          targetCard.style.transform = '';
        }, 2000);
      }

      showToast(`Rekomendasi: ${randomItem.name} — ${formatRupiah(randomItem.price)}`);
    });
  }
}
//kirim pesanan ke wa
function submitOrder(e) {
  e.preventDefault();
  //Cek jam operasional
  if (!orderOpen) {
    showClosedModal();
    return;
  }
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
//inisialisasi web
function init() {
  //inisialisasi referensi elemen html terlebih dahulu
  initElementRefs();
  //pasang semua event listener
  bindEvents();
  //update status operasional dulu sebelum render
  updateOperationalUI();
  //baru render produk dan keranjang
  renderProducts();
  renderCart();
  // Cek status kantin setiap 30 detik
  setInterval(updateOperationalUI, 30000);
  // Peringatan sebelum tutup (jika jam 15.30–16.00)
  const now = getNow();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  if (currentHour === 15 && currentMinute >= 30) {
    showToast('⚠️ Pemesanan online akan ditutup pukul 16.00 WITA');
  }
}
//opening web
(function openingAnimation() {
  const loader = document.createElement('div');
  loader.id = 'openingLoader';
  loader.innerHTML = `
    <div class="opening-logo">
      <i class="fas fa-mug-hot"></i>
      <h1>Kantin Barokah</h1>
      <div class="opening-bar"><span></span></div>
    </div>
  `;
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
  //fungsi untuk menutup loader
  function hideLoader() {
    if (!loader.parentNode) return; //sudah dihapus, lewati
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    document.body.classList.remove('opening-lock');
    setTimeout(() => loader.remove(), 800);
  }
  //tutup loader setelah 2 detik tanpa menunggu window.load
  setTimeout(hideLoader, 2000);
})();
//jalankan inisialisasi setelah dom siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  //dom sudah siap, langsung jalankan
  init();
}