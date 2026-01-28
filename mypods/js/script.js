/*
███████╗██╗   ██╗██████╗ ██╗      █████╗ ███████╗
██╔════╝██║   ██║██╔══██╗██║     ██╔══██╗██╔════╝
█████╗  ██║   ██║██████╔╝██║     ███████║███████╗
██╔══╝  ██║   ██║██╔══██╗██║     ██╔══██║╚════██║
██║     ╚██████╔╝██║  ██║███████╗██║  ██║███████║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
*/

// ============================================
// EFEITO 3D DO POD AO SCROLLAR
// ============================================

window.addEventListener('scroll', () => {
  const pod3D = document.getElementById('pod3D');
  const heroSection = document.querySelector('.hero-banner');

  if (!pod3D || !heroSection) return;

  const heroRect = heroSection.getBoundingClientRect();
  const heroHeight = heroSection.offsetHeight;

  // Calcular porcentagem de scroll da seção hero
  let scrollPercent = 1 - heroRect.bottom / (window.innerHeight + heroHeight);
  scrollPercent = Math.max(0, Math.min(1, scrollPercent));

  // Rotação baseada no scroll (até 360 graus)
  const rotateY = scrollPercent * 360;
  const rotateX = (scrollPercent - 0.5) * 30; // Leve inclinação
  const scale = 1 + scrollPercent * 0.1; // Cresce conforme desce

  pod3D.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(${scale})`;
});

// ============================================
// DADOS E CONFIGURAÇÕES
// ============================================

// Produtos padrão (fallback caso não haja produtos vindos do painel admin)
const defaultProducts = [
  {
    id: 1,
    title: 'Pod Compacto Pro',
    price: 99.9,
    desc: 'Pod compacto e prático para uso diário',
    img: 'img/pod.jpg',
    brand: 'marcaA'
  },
  {
    id: 2,
    title: 'Pod Power Max',
    price: 149.9,
    desc: 'Pod com maior capacidade de bateria',
    img: 'img/pod.jpg',
    brand: 'marcaA'
  },
  {
    id: 3,
    title: 'Pod Premium Elite',
    price: 199.9,
    desc: 'Pod premium com melhor desempenho',
    img: 'img/pod.jpg',
    brand: 'marcaB'
  },
  {
    id: 4,
    title: 'Pod Advanced X',
    price: 249.9,
    desc: 'Pod avançado com design moderno',
    img: 'img/pod.jpg',
    brand: 'marcaB'
  }
];

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let filteredProducts = [];

// Carregar produtos do painel admin ou usar fallback padrão
function loadProducts() {
  const adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
  if (adminProducts.length > 0) {
    products = [...adminProducts];
  } else {
    products = [...defaultProducts];
  }
  filteredProducts = [...products];
}

// ============================================
// UTILITÁRIOS
// ============================================

function escapeHTML(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

function formatPrice(price) {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
}

function parsePrice(priceStr) {
  return parseFloat(priceStr.replace('R$ ', '').replace(',', '.'));
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function checkAuth() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ============================================
// AUTENTICAÇÃO
// ============================================

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

  if (tab === 'login') {
    document.querySelector('.tab-btn').classList.add('active');
    document.getElementById('loginForm').classList.add('active');
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('registerForm').classList.add('active');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const passwordHash = await hashPassword(password);
  const user = users.find(u => u.email === email && u.password === passwordHash);

  if (user) {
    currentUser = { ...user };
    delete currentUser.password;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showToast('Login realizado com sucesso!', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  } else {
    showToast('E-mail ou senha incorretos!', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const phone = document.getElementById('registerPhone').value;
  const cpf = document.getElementById('registerCPF')?.value || '';

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.find(u => u.email === email)) {
    showToast('Este e-mail já está cadastrado!', 'error');
    return;
  }

  const passwordHash = await hashPassword(password);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: passwordHash,
    phone,
    cpf,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  showToast('Conta criada com sucesso! Faça login.', 'success');
  setTimeout(() => {
    switchTab('login');
    document.getElementById('loginEmail').value = email;
  }, 1000);
}

function logout() {
  localStorage.removeItem('currentUser');
  currentUser = null;
  showToast('Logout realizado!', 'success');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

function goLogin() {
  window.location.href = 'login.html';
}

// ============================================
// PRODUTOS
// ============================================

function renderProducts(productsToRender = filteredProducts) {
  try {
    const list = document.getElementById('productList');
    if (!list) {
      return;
    }

    list.innerHTML = '';

    if (!Array.isArray(productsToRender)) {
      console.error('productsToRender não é um array válido');
      list.innerHTML = '<div class="empty-state"><p>Erro ao carregar produtos</p></div>';
      return;
    }

    if (productsToRender.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>Nenhum produto encontrado</p></div>';
      return;
    }

    productsToRender.forEach(p => {
      if (!p || typeof p !== 'object') {
        console.warn('Produto inválido encontrado:', p);
        return;
      }

      const card = document.createElement('div');
      card.className = 'card';

      const img = document.createElement('img');
      img.src = p.img || 'img/pod.jpg';
      img.alt = p.title || 'Produto sem nome';
      img.onerror = () => img.src = 'img/pod.jpg'; // Fallback para imagem quebrada

      const title = document.createElement('h3');
      title.textContent = p.title || 'Produto sem nome';

      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = formatPrice(p.price || 0);

      const link = document.createElement('a');
      link.href = '#';
      link.style.display = 'block';
      link.style.width = '100%';
      link.style.padding = '14px';
      link.style.background = 'linear-gradient(135deg, #6366f1, #818cf8)';
      link.style.border = 'none';
      link.style.borderRadius = '12px';
      link.style.color = '#fff';
      link.style.fontSize = '15px';
      link.style.fontWeight = '600';
      link.style.cursor = 'pointer';
      link.style.textAlign = 'center';
      link.style.textDecoration = 'none';
      link.textContent = 'Comprar';

      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (p.id) {
          localStorage.setItem('productId', p.id);
          window.location.href = 'produto.html';
        } else {
          showToast('Erro: Produto sem ID válido', 'error');
        }
      });

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(link);
      list.appendChild(card);
    });

    const countEl = document.getElementById('productsCount');
    if (countEl) {
      countEl.textContent = `${productsToRender.length} produto(s) encontrado(s)`;
    }
  } catch (error) {
    console.error('Erro ao renderizar produtos:', error);
    const list = document.getElementById('productList');
    if (list) {
      list.innerHTML = '<div class="empty-state"><p>Erro ao carregar produtos. Tente recarregar a página.</p></div>';
    }
  }
}

function filterProducts() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const brandFilter = document.getElementById('brandFilter')?.value || 'all';
  const priceFilter = document.getElementById('priceFilter')?.value || 'all';
  
  filteredProducts = products.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
    const matchBrand = brandFilter === 'all' || p.brand === brandFilter;
    
    let matchPrice = true;
    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(v => v === '+' ? Infinity : parseFloat(v));
      matchPrice = priceFilter.includes('+') ? p.price >= min : (p.price >= min && p.price <= max);
    }
    
    return matchSearch && matchBrand && matchPrice;
  });
  
  renderProducts();
}

function openProduct(id) {
  if (!id) return false;
  try {
    localStorage.setItem('productId', id);
    window.location.href = 'produto.html';
  } catch (err) {
    console.error('Erro ao abrir produto:', err);
  }
  return false;
}

// Carregar produto na página de detalhes
function loadProduct() {
  try {
    if (!products || products.length === 0) {
      loadProducts();
    }

    const pid = localStorage.getItem('productId');
    if (!pid) {
      showToast('Produto não encontrado!', 'error');
      setTimeout(() => window.location.href = 'index.html', 1000);
      return;
    }

    const productId = parseInt(pid);
    if (isNaN(productId)) {
      showToast('ID do produto inválido!', 'error');
      setTimeout(() => window.location.href = 'index.html', 1000);
      return;
    }

    const p = products.find(x => x.id === productId);
    if (!p) {
      showToast('Produto não encontrado!', 'error');
      setTimeout(() => window.location.href = 'index.html', 1000);
      return;
    }

    const imgEl = document.getElementById('productImage');
    const titleEl = document.getElementById('title');
    const descEl = document.getElementById('desc');
    const priceEl = document.getElementById('price');

    if (imgEl) imgEl.src = p.img || 'img/pod.jpg';
    if (titleEl) titleEl.textContent = p.title || 'Produto sem nome';
    if (descEl) descEl.textContent = p.desc || 'Descrição não disponível';
    if (priceEl) priceEl.textContent = formatPrice(p.price || 0);

    // Adicionar especificações
    const specs = {
      'specBattery': '3000mAh Recarregável',
      'specCharge': 'USB-C Rápida (30min)',
      'specWeight': '42 gramas',
      'specSize': '105 x 45 x 25 mm'
    };

    Object.entries(specs).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });

    // Carregar avaliações
    loadReviews();

    // Inicializar stars
    document.querySelectorAll('.star-btn').forEach((btn, idx) => {
      if (idx < 5) btn.classList.add('active');
    });
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    showToast('Erro ao carregar produto. Tente novamente.', 'error');
    setTimeout(() => window.location.href = 'index.html', 2000);
  }
}

let productQuantity = 1;

function changeQuantity(delta) {
  productQuantity = Math.max(1, Math.min(10, productQuantity + delta));
  const qtyInput = document.getElementById('productQuantity');
  if (qtyInput) qtyInput.value = productQuantity;
}

function addToCart() {
  const pid = localStorage.getItem('productId');
  if (!pid) {
    showToast('Erro ao adicionar ao carrinho', 'error');
    return;
  }
  
  const p = products.find(x => x.id == parseInt(pid));
  if (!p) {
    showToast('Produto não encontrado', 'error');
    return;
  }
  
  const existingItem = cart.find(item => item.id === p.id);
  
  if (existingItem) {
    existingItem.quantity += productQuantity;
  } else {
    cart.push({
      id: p.id,
      title: p.title,
      price: p.price,
      img: p.img,
      quantity: productQuantity
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  showToast(`${p.title} adicionado ao carrinho!`, 'success');
  productQuantity = 1;
  if (document.getElementById('productQuantity')) {
    document.getElementById('productQuantity').value = 1;
  }
}

// ============================================
// AVALIAÇÕES
// ============================================

let userRating = 5;

function setRating(stars) {
  userRating = stars;
  const starButtons = document.querySelectorAll('.star-btn');
  starButtons.forEach((btn, index) => {
    if (index < stars) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  document.getElementById('userRating').value = stars;
}

function loadReviews() {
  const pid = localStorage.getItem('productId');
  if (!pid) return;

  const reviews = JSON.parse(localStorage.getItem(`reviews_${pid}`)) || [];
  const reviewsList = document.getElementById('reviewsList');
  
  if (!reviewsList) return;

  // Atualizar estrelas e contagem
  if (reviews.length > 0) {
    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    const ratingStars = document.getElementById('ratingStars');
    const ratingInfo = document.getElementById('ratingInfo');
    
    if (ratingStars && ratingInfo) {
      const fullStars = Math.round(avgRating);
      ratingStars.textContent = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
      ratingInfo.textContent = `(${avgRating}) - ${reviews.length} avaliação(ões)`;
    }
  }

  // Renderizar avaliações
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p class="empty-reviews">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>';
    return;
  }
  reviewsList.innerHTML = reviews.map(review => `
    <div class="review-card">
      <div class="review-header">
        <div>
          <div class="review-author">${escapeHTML(review.name)}</div>
          <div class="review-date">${new Date(review.date).toLocaleDateString('pt-BR')}</div>
        </div>
        <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
      </div>
      <div class="review-text">${escapeHTML(review.comment)}</div>
    </div>
  `).join('');
}

function submitReview(e) {
  e.preventDefault();

  const pid = localStorage.getItem('productId');
  if (!pid) {
    showToast('Erro ao salvar avaliação', 'error');
    return;
  }

  const name = document.getElementById('reviewName').value.trim();
  const rating = parseInt(document.getElementById('userRating').value);
  const comment = document.getElementById('reviewComment').value.trim();

  if (!name || !comment) {
    showToast('Preencha todos os campos!', 'error');
    return;
  }

  // Carregar avaliações existentes
  const reviews = JSON.parse(localStorage.getItem(`reviews_${pid}`)) || [];

  // Adicionar nova avaliação
  reviews.push({
    name,
    rating,
    comment,
    date: new Date().toISOString()
  });

  // Salvar
  localStorage.setItem(`reviews_${pid}`, JSON.stringify(reviews));

  // Limpar formulário
  document.getElementById('reviewName').value = '';
  document.getElementById('reviewComment').value = '';
  document.getElementById('userRating').value = '5';
  userRating = 5;

  // Resetar estrelas
  document.querySelectorAll('.star-btn').forEach(btn => btn.classList.remove('active'));
  for (let i = 0; i < 5; i++) {
    document.querySelectorAll('.star-btn')[i].classList.add('active');
  }

  // Recarregar lista e mostrar mensagem
  loadReviews();
  showToast('Avaliação enviada com sucesso!', 'success');
  
  // Scroll para a lista de avaliações
  document.getElementById('reviewsList').scrollIntoView({ behavior: 'smooth' });
}

function scrollToReviewForm() {
  document.getElementById('reviewForm').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('reviewName').focus();
}

// ============================================
// CARRINHO
// ============================================

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = count;
}

function openCart() {
  const modal = document.getElementById('cartModal');
  if (!modal) {
    console.error('Erro: Modal cartModal não encontrado!');
    return;
  }
  
  renderCart();
  modal.classList.add('open');
  modal.style.display = 'flex !important';
}

function closeCart() {
  const modal = document.getElementById('cartModal');
  if (modal) modal.classList.remove('open');
}

function renderCart() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  
  if (!cartItems) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart"><p>Seu carrinho está vazio</p></div>';
    if (cartTotal) cartTotal.textContent = 'R$ 0,00';
    return;
  }
  
  cartItems.innerHTML = '';
  let total = 0;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.title)}">
      <div class="cart-item-info">
        <h4>${escapeHTML(item.title)}</h4>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-qty">
          <button onclick="updateCartItem(${index}, -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartItem(${index}, 1)">+</button>
        </div>
      </div>
      <div class="cart-item-actions">
        <div class="cart-item-total">${formatPrice(itemTotal)}</div>
        <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
      </div>
    `;
    cartItems.appendChild(cartItem);
  });
  
  if (cartTotal) cartTotal.textContent = formatPrice(total);
}

function updateCartItem(index, delta) {
  cart[index].quantity = Math.max(1, cart[index].quantity + delta);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
  showToast('Item removido do carrinho', 'success');
}

function goToCheckout() {
  if (cart.length === 0) {
    showToast('Adicione produtos ao carrinho primeiro!', 'error');
    return;
  }
  if (!checkAuth()) return;
  closeCart();
  window.location.href = 'checkout.html';
}

function goCheckout() {
  const pid = localStorage.getItem('productId');
  if (pid) {
    const p = products.find(x => x.id == parseInt(pid));
    if (p) {
      cart = [{
        id: p.id,
        title: p.title,
        price: p.price,
        img: p.img,
        quantity: productQuantity || 1
      }];
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }
  
  if (cart.length === 0) {
    showToast('Adicione produtos ao carrinho primeiro!', 'error');
    return;
  }
  if (!checkAuth()) return;
  window.location.href = 'checkout.html';
}

// Atualizar visão de checkout/cart após aplicar cupom
function updateCartDisplay() {
  // Recalcular resumo do checkout se estivermos na página de checkout
  if (document.getElementById('checkoutItems')) {
    renderCheckout();
  }
  // Atualizar também o total do carrinho se o modal estiver aberto
  if (document.getElementById('cartItems')) {
    renderCart();
  }
}

// ============================================
// CHECKOUT
// ============================================

function renderCheckout() {
  const checkoutItems = document.getElementById('checkoutItems');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('totalPrice');
  const shippingEl = document.getElementById('shipping');
  const couponAppliedEl = document.getElementById('couponApplied');
  const discountLine = document.getElementById('discountLine');
  
  if (!checkoutItems) return;
  
  if (cart.length === 0) {
    window.location.href = 'index.html';
    return;
  }
  
  checkoutItems.innerHTML = '';
  let subtotal = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    const checkoutItem = document.createElement('div');
    checkoutItem.className = 'checkout-item';
    checkoutItem.innerHTML = `
      <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.title)}">
      <div class="checkout-item-info">
        <h4>${escapeHTML(item.title)}</h4>
        <span>Qtd: ${item.quantity}</span>
      </div>
      <div class="checkout-item-price">${formatPrice(itemTotal)}</div>
    `;
    checkoutItems.appendChild(checkoutItem);
  });

  let shipping = 15.0;
  let discount = 0;

  const storedCoupon = JSON.parse(localStorage.getItem('appliedCoupon')) || null;
  if (storedCoupon) {
    discount = calculateDiscount(subtotal, storedCoupon);
    if (storedCoupon.type === 'shipping') {
      // Desconto aplicado sobre o frete
      shipping = Math.max(0, shipping - discount);
      discount = 0;
    }
    if (couponAppliedEl) {
      couponAppliedEl.style.display = 'block';
      couponAppliedEl.textContent = `Cupom ${storedCoupon.code} aplicado: ${storedCoupon.description}`;
    }
    if (discountLine) {
      discountLine.style.display = discount > 0 ? 'flex' : 'none';
      if (discount > 0) {
        discountLine.querySelector('span:last-child').textContent = `- ${formatPrice(discount)}`;
      }
    }
  } else {
    if (couponAppliedEl) couponAppliedEl.style.display = 'none';
    if (discountLine) discountLine.style.display = 'none';
  }

  const total = subtotal + shipping - discount;

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = formatPrice(shipping);
  if (totalEl) totalEl.textContent = formatPrice(total);
}

function searchCep(cep) {
  // Remove caracteres não numéricos
  cep = cep.replace(/\D/g, '');
  
  // Verifica se o CEP tem 8 dígitos
  if (cep.length !== 8) {
    return;
  }
  
  // Mostra loading
  const addressInput = document.getElementById('deliveryAddress');
  const cityInput = document.getElementById('deliveryCity');
  const stateInput = document.getElementById('deliveryState');
  
  if (addressInput) addressInput.value = 'Buscando...';
  if (cityInput) cityInput.value = 'Buscando...';
  if (stateInput) stateInput.value = 'Buscando...';
  
  // Busca o CEP na API ViaCEP
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        showToast('CEP não encontrado!', 'error');
        if (addressInput) addressInput.value = '';
        if (cityInput) cityInput.value = '';
        if (stateInput) stateInput.value = '';
        return;
      }
      
      // Preenche os campos automaticamente
      if (addressInput) addressInput.value = data.logradouro || '';
      if (cityInput) cityInput.value = data.localidade || '';
      if (stateInput) stateInput.value = data.uf || '';
      
      // Foca no campo de número se o endereço foi preenchido
      if (data.logradouro) {
        const numberInput = document.getElementById('deliveryNumber');
        if (numberInput) numberInput.focus();
      }
      
      showToast('Endereço encontrado!', 'success');
    })
    .catch(error => {
      console.error('Erro ao buscar CEP:', error);
      showToast('Erro ao buscar CEP. Tente novamente.', 'error');
      if (addressInput) addressInput.value = '';
      if (cityInput) cityInput.value = '';
      if (stateInput) stateInput.value = '';
    });
}

function handleCheckout(e) {
  e.preventDefault();
  
  if (!checkAuth()) return;
  
  const formData = {
    name: document.getElementById('deliveryName').value,
    phone: document.getElementById('deliveryPhone').value,
    email: currentUser.email,
    cep: document.getElementById('deliveryCep').value,
    address: document.getElementById('deliveryAddress').value,
    number: document.getElementById('deliveryNumber').value,
    complement: document.getElementById('deliveryComplement').value,
    city: document.getElementById('deliveryCity').value,
    state: document.getElementById('deliveryState').value,
    payment: document.querySelector('input[name="payment"]:checked').value
  };
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 15.00;
  const total = subtotal + shipping;
  
  const order = {
    id: Date.now(),
    userId: currentUser.id,
    items: [...cart],
    delivery: formData,
    subtotal: subtotal,
    shipping: shipping,
    total: total,
    status: 'pendente',
    date: new Date().toISOString()
  };
  
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Salvar também no formato para o admin ver
  const adminOrder = {
    id: order.id,
    name: formData.name,
    email: formData.email,
    address: formData.address,
    items: order.items,
    total: `R$ ${total.toFixed(2).replace('.', ',')}`,
    status: 'pendente',
    date: new Date().toISOString()
  };
  
  const adminOrders = JSON.parse(localStorage.getItem('adminOrders')) || [];
  adminOrders.push(adminOrder);
  localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
  
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  showToast('Pedido realizado com sucesso!', 'success');
  setTimeout(() => {
    window.location.href = 'orders.html';
  }, 1500);
}

// ============================================
// PERFIL
// ============================================

function loadProfile() {
  if (!checkAuth()) return;

  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  const phoneEl = document.getElementById('profilePhone');
  const cpfEl = document.getElementById('profileCPF');

  if (nameEl) nameEl.value = currentUser.name;
  if (emailEl) emailEl.value = currentUser.email;
  if (phoneEl) phoneEl.value = currentUser.phone;
  if (cpfEl) cpfEl.value = currentUser.cpf || '';

  loadAddresses();
}

function loadAddresses() {
  const addressList = document.getElementById('addressList');
  if (!addressList) return;
  
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser.id}`)) || [];
  
  if (addresses.length === 0) {
    addressList.innerHTML = '<p class="empty-text">Nenhum endereço cadastrado</p>';
    return;
  }
  
  addressList.innerHTML = addresses.map((addr, index) => `
    <div class="address-item">
      <p><strong>${escapeHTML(addr.name)}</strong></p>
      <p>${escapeHTML(addr.address)}, ${escapeHTML(addr.number)}${addr.complement ? ' - ' + escapeHTML(addr.complement) : ''}</p>
      <p>${escapeHTML(addr.city)} - ${escapeHTML(addr.state)}, CEP: ${escapeHTML(addr.cep)}</p>
      <button class="btn-small" onclick="removeAddress(${index})">Remover</button>
    </div>
  `).join('');
}

function addAddress() {
  const name = prompt('Nome do endereço (ex: Casa, Trabalho):');
  if (!name) return;
  
  const cep = prompt('CEP:');
  const address = prompt('Endereço:');
  const number = prompt('Número:');
  const complement = prompt('Complemento (opcional):') || '';
  const city = prompt('Cidade:');
  const state = prompt('Estado (UF):');
  
  if (!cep || !address || !number || !city || !state) {
    showToast('Preencha todos os campos obrigatórios!', 'error');
    return;
  }
  
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser.id}`)) || [];
  addresses.push({ name, cep, address, number, complement, city, state });
  localStorage.setItem(`addresses_${currentUser.id}`, JSON.stringify(addresses));
  
  loadAddresses();
  showToast('Endereço adicionado!', 'success');
}

function removeAddress(index) {
  const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser.id}`)) || [];
  addresses.splice(index, 1);
  localStorage.setItem(`addresses_${currentUser.id}`, JSON.stringify(addresses));
  loadAddresses();
  showToast('Endereço removido!', 'success');
}

function toggleEditMode() {
  const inputs = ['profileName', 'profilePhone', 'profileCPF'];
  const editBtn = document.getElementById('editBtn');
  const editActions = document.getElementById('editActions');

  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.readOnly = !input.readOnly;
      input.style.background = input.readOnly ? 'var(--bg-secondary)' : 'var(--bg-card)';
      input.style.opacity = input.readOnly ? '0.7' : '1';
    }
  });

  if (editBtn) editBtn.style.display = 'none';
  if (editActions) editActions.style.display = 'flex';
}

function saveProfile() {
  const name = document.getElementById('profileName').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const cpf = document.getElementById('profileCPF').value.trim();

  if (!name || !phone) {
    showToast('Nome e telefone são obrigatórios!', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);

  if (userIndex !== -1) {
    users[userIndex].name = name;
    users[userIndex].phone = phone;
    users[userIndex].cpf = cpf;
    localStorage.setItem('users', JSON.stringify(users));

    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.cpf = cpf;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    cancelEdit(); // Reset to view mode
    showToast('Perfil atualizado!', 'success');
  }
}

function cancelEdit() {
  loadProfile(); // Reload to reset values
  const inputs = ['profileName', 'profilePhone', 'profileCPF'];
  const editBtn = document.getElementById('editBtn');
  const editActions = document.getElementById('editActions');

  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      input.readOnly = true;
      input.style.background = 'var(--bg-secondary)';
      input.style.opacity = '0.7';
    }
  });

  if (editBtn) editBtn.style.display = 'block';
  if (editActions) editActions.style.display = 'none';
}

// ============================================
// LOYALTY / PROGRAMA DE FIDELIDADE
// ============================================

function updateLoyaltyDisplay() {
  if (!currentUser) return;

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const points = Math.floor(totalSpent); // 1 ponto por real gasto

  let tier = 'bronze';
  let discount = 0;
  if (points >= 1000) {
    tier = 'gold';
    discount = 10;
  } else if (points >= 500) {
    tier = 'silver';
    discount = 5;
  }

  const badgeEl = document.getElementById('loyaltyBadge');
  const pointsEl = document.getElementById('userPoints');
  const totalSpentEl = document.getElementById('totalSpent');
  const discEl = document.getElementById('currentDiscount');

  if (badgeEl) {
    badgeEl.className = `loyalty-badge ${tier}`;
    const label = tier === 'gold' ? 'Ouro' : tier === 'silver' ? 'Prata' : 'Bronze';
    badgeEl.textContent = `Nível ${label}`;
  }
  if (pointsEl) pointsEl.textContent = points;
  if (totalSpentEl) totalSpentEl.textContent = formatPrice(totalSpent);
  if (discEl) discEl.textContent = `${discount}%`;
}

// ============================================
// PEDIDOS
// ============================================

function loadOrders() {
  if (!checkAuth()) return;
  
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;
  
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const userOrders = orders.filter(o => o.userId === currentUser.id).reverse();
  
  if (userOrders.length === 0) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <p>📦 Você ainda não fez nenhum pedido</p>
        <button class="btn-primary" onclick="window.location.href='index.html'">Ver produtos</button>
      </div>
    `;
    return;
  }
  
  ordersList.innerHTML = userOrders.map(order => {
    const statusColors = {
      'pendente': '#ffa500',
      'processando': '#2f6bff',
      'enviado': '#00c853',
      'entregue': '#4caf50',
      'cancelado': '#f44336'
    };

    return `
      <div class="order-card">
        <div class="order-header">
          <div>
            <h3>Pedido #${order.id}</h3>
            <p class="order-date">${new Date(order.date).toLocaleDateString('pt-BR')}</p>
          </div>
          <span class="order-status" style="background: ${statusColors[order.status] || '#666'}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div class="order-items">
          ${order.items.map(item => `
            <div class="order-item">
              <img src="${item.img}" alt="${item.title}">
              <div>
                <h4>${item.title}</h4>
                <span>Qtd: ${item.quantity}</span>
              </div>
              <div class="order-item-price">${formatPrice(item.price * item.quantity)}</div>
            </div>
          `).join('')}
        </div>
        <div class="order-footer">
          <div class="order-total">
            <strong>Total: ${formatPrice(order.total)}</strong>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================
// INICIALIZAÇÃO
// ============================================

function init() {
  // Carregar produtos do admin
  loadProducts();
  
  // Atualizar interface baseado no login
  if (currentUser) {
    const loginBtn = document.getElementById('loginBtn');
    const profileBtn = document.getElementById('profileBtn');
    const ordersBtn = document.getElementById('ordersBtn');
    const userGreeting = document.getElementById('userGreeting');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (profileBtn) profileBtn.style.display = 'inline-block';
    if (ordersBtn) ordersBtn.style.display = 'inline-block';
    if (userGreeting) {
      userGreeting.textContent = `Olá, ${currentUser.name.split(' ')[0]}!`;
      userGreeting.style.display = 'inline-block';
    }
  }
  
  // Renderizar produtos na página inicial
  if (document.getElementById('productList')) {
    renderProducts();
  }
  
  // Carregar produto na página de detalhes
  if (document.getElementById('productImage')) {
    loadProduct();
  }
  
  // Carregar checkout
  if (document.getElementById('checkoutItems')) {
    if (!checkAuth()) return;
    renderCheckout();
  }
  
  // Carregar perfil
  if (document.getElementById('profileName')) {
    loadProfile();
  }
  
  // Carregar pedidos
  if (document.getElementById('ordersList')) {
    loadOrders();
  }
  
  // Atualizar contador do carrinho
  updateCartCount();
  
  // Fechar modal ao clicar fora
  const modal = document.getElementById('cartModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeCart();
    });
  }
  
  // Máscara de CEP
  const cepInput = document.getElementById('deliveryCep');
  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5, 8);
      }
      e.target.value = value;

      // Busca automaticamente quando o CEP estiver completo (8 dígitos)
      if (value.replace(/\D/g, '').length === 8) {
        setTimeout(() => searchCep(value), 500);
      }
    });
  }

  // Busca avançada
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        showSearchSuggestions(query);
      } else {
        hideSearchSuggestions();
      }
    });

    searchInput.addEventListener('blur', () => {
      // Delay para permitir clique nas sugestões
      setTimeout(hideSearchSuggestions, 150);
    });

    searchInput.addEventListener('focus', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        showSearchSuggestions(query);
      }
    });
  }

  // Aplicar tema salvo
  applyTheme();

  // Atualizar loyalty se estiver na página de perfil
  if (document.getElementById('loyaltyBadge')) {
    updateLoyaltyDisplay();
  }
  
  // Máscara de telefone
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      e.target.value = value;
    });
  });

  // Máscara de CPF
  const cpfInputs = document.querySelectorAll('input[id="profileCPF"], input[id="registerCPF"]');
  cpfInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length <= 11) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      e.target.value = value;
    });
  });
}

// ============================================
// SISTEMA DE CUPONS E DESCONTOS
// ============================================

let coupons = JSON.parse(localStorage.getItem('coupons')) || [
  { code: 'BEMVINDO10', type: 'percent', value: 10, minValue: 50, active: true, description: '10% de desconto na primeira compra' },
  { code: 'FRETEGRATIS', type: 'shipping', value: 15, minValue: 100, active: true, description: 'Frete grátis acima de R$ 100' },
  { code: 'DESCONTO20', type: 'percent', value: 20, minValue: 200, active: true, description: '20% de desconto acima de R$ 200' }
];

// Aplicar cupom
function applyCoupon(code) {
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
  if (!coupon) {
    showToast('Cupom inválido ou expirado!', 'error');
    return false;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (subtotal < coupon.minValue) {
    showToast(`Cupom requer mínimo de ${formatPrice(coupon.minValue)}`, 'error');
    return false;
  }

  appliedCoupon = coupon;
  localStorage.setItem('appliedCoupon', JSON.stringify(coupon));
  showToast(`Cupom aplicado: ${coupon.description}`, 'success');
  updateCartDisplay();
  return true;
}

// Calcular desconto
function calculateDiscount(subtotal, coupon) {
  if (!coupon) return 0;

  switch (coupon.type) {
    case 'percent':
      return (subtotal * coupon.value) / 100;
    case 'fixed':
      return Math.min(coupon.value, subtotal);
    case 'shipping':
      return coupon.value; // Valor do frete
    default:
      return 0;
  }
}

// ============================================
// DARK/LIGHT MODE
// ============================================

let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Toggle dark mode
function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('darkMode', isDarkMode);
  applyTheme();
  showToast(isDarkMode ? 'Modo escuro ativado' : 'Modo claro ativado', 'success');
}

// Aplicar tema
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');

  // Atualizar ícone do botão
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.innerHTML = isDarkMode ? '☀️' : '🌙';
    themeBtn.title = isDarkMode ? 'Modo Claro' : 'Modo Escuro';
  }
}

// ============================================
// SISTEMA DE NOTIFICAÇÕES AVANÇADO
// ============================================

// Simulação de notificações por email
function sendEmailNotification(userEmail, subject, message) {
  // Em produção, isso seria integrado com um serviço de email
  // Email simulado em desenvolvimento

  // Salvar no histórico de notificações
  const notifications = JSON.parse(localStorage.getItem('emailNotifications')) || [];
  notifications.push({
    id: Date.now(),
    email: userEmail,
    subject,
    message,
    date: new Date().toISOString(),
    sent: true
  });
  localStorage.setItem('emailNotifications', JSON.stringify(notifications));
}

// Notificar mudança de status do pedido
function notifyOrderStatusChange(order, oldStatus, newStatus) {
  if (!order.delivery?.email) return;

  const statusText = getStatusText(newStatus);
  const subject = `Pedido #${order.id} - Status Atualizado`;
  const message = `
    Olá ${order.delivery.name}!

    Seu pedido #${order.id} teve o status atualizado.

    📦 Status anterior: ${getStatusText(oldStatus)}
    ✅ Novo status: ${statusText}

    ${getStatusMessage(newStatus)}

    Acesse seu painel para acompanhar: ${window.location.origin}/orders.html

    Atenciosamente,
    Equipe MyPods
  `;

  sendEmailNotification(order.delivery.email, subject, message);
}

// Mensagens personalizadas por status
function getStatusMessage(status) {
  const messages = {
    'processando': 'Estamos preparando seu pedido com todo cuidado!',
    'enviado': 'Seu pedido foi enviado e está a caminho!',
    'entregue': 'Pedido entregue com sucesso! Obrigado pela preferência.',
    'cancelado': 'Infelizmente seu pedido foi cancelado. Entre em contato conosco.'
  };
  return messages[status] || 'Status atualizado.';
}

// ============================================
// SINCRONIZAÇÃO E NOTIFICAÇÕES
// ============================================

let appliedCoupon = JSON.parse(localStorage.getItem('appliedCoupon')) || null;

// Escutar mudanças no localStorage de outras abas/janelas
window.addEventListener('storage', (e) => {
  if (e.key === 'orders' && document.getElementById('ordersList')) {
    // Recarregar pedidos quando o status for alterado pelo admin
    loadOrders();
    // Mostrar notificação se houver mudança de status
    checkOrderStatusChanges();
  }
});

// ============================================
// BUSCA AVANÇADA (SUGESTÕES)
// ============================================

function highlightMatch(text, query) {
  const safeText = escapeHTML(text);
  if (!query) return safeText;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'gi');
  return safeText.replace(regex, match => `<mark>${match}</mark>`);
}

function showSearchSuggestions(query) {
  const box = document.querySelector('.search-box');
  if (!box) return;
  let container = document.getElementById('searchSuggestions');
  if (!container) {
    container = document.createElement('div');
    container.id = 'searchSuggestions';
    container.className = 'search-suggestions';
    box.appendChild(container);
  }

  const q = query.toLowerCase().trim();
  if (!q) {
    hideSearchSuggestions();
    return;
  }

  const matches = products
    .filter(p => (p.title && p.title.toLowerCase().includes(q)) || (p.desc && p.desc.toLowerCase().includes(q)))
    .slice(0, 5);

  if (matches.length === 0) {
    container.innerHTML = '<div class="no-suggestions">Nenhum produto encontrado</div>';
    container.style.display = 'block';
    return;
  }

  container.innerHTML = matches.map(p => `
    <div class="suggestion-item" data-id="${p.id}">
      <img src="${escapeHTML(p.img)}" alt="${escapeHTML(p.title)}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-right:10px;">
      <div>
        <div>${highlightMatch(p.title, query)}</div>
        <small>${formatPrice(p.price)}</small>
      </div>
    </div>
  `).join('');

  container.style.display = 'block';

  container.querySelectorAll('.suggestion-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-id');
      if (id) {
        localStorage.setItem('productId', id);
        window.location.href = 'produto.html';
      }
    });
  });
}

function hideSearchSuggestions() {
  const container = document.getElementById('searchSuggestions');
  if (container) {
    container.style.display = 'none';
    container.innerHTML = '';
  }
}

// Verificar mudanças de status e notificar usuário
function checkOrderStatusChanges() {
  if (!currentUser || !document.getElementById('ordersList')) return;

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const userOrders = orders.filter(o => o.userId === currentUser.id);

  userOrders.forEach(order => {
    const lastStatus = localStorage.getItem(`order_status_${order.id}`);
    if (lastStatus && lastStatus !== order.status) {
      // Status mudou! Mostrar notificação
      const statusText = getStatusText(order.status);
      showToast(`Pedido #${order.id} agora está: ${statusText}`, 'success');

      // Notificar por email
      notifyOrderStatusChange(order, lastStatus, order.status);

      // Salvar novo status
      localStorage.setItem(`order_status_${order.id}`, order.status);
    } else if (!lastStatus) {
      // Primeiro acesso, salvar status atual
      localStorage.setItem(`order_status_${order.id}`, order.status);
    }
  });
}

// Função auxiliar para texto do status
function getStatusText(status) {
  const statusMap = {
    'pendente': 'Pendente',
    'processando': 'Processando',
    'enviado': 'Enviado',
    'entregue': 'Entregue',
    'cancelado': 'Cancelado'
  };
  return statusMap[status] || status;
}

// Executar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
