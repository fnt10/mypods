/*
███████╗██╗   ██╗██████╗ ██╗      █████╗ ███████╗
██╔════╝██║   ██║██╔══██╗██║     ██╔══██╗██╔════╝
█████╗  ██║   ██║██████╔╝██║     ███████║███████╗
██╔══╝  ██║   ██║██╔══██╗██║     ██╔══██║╚════██║
██║     ╚██████╔╝██║  ██║███████╗██║  ██║███████║
╚═╝      ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝
*/

// ============================================
// PAINEL ADMINISTRATIVO
// ============================================

let adminUser = null;
let editingProductId = null;
let dashboardChartInstance = null;

// ============================================
// LOGIN E AUTENTICAÇÃO
// ============================================

function handleAdminLogin(e) {
  e.preventDefault();

  const user = document.getElementById('adminUser').value;
  const password = document.getElementById('adminPassword').value;

  // Demo credentials for development - In production, use proper authentication
  if (user === 'admin' && password === 'mypods2024') {
    adminUser = { name: 'Admin', username: user };
    localStorage.setItem('adminUser', JSON.stringify(adminUser));
    
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    
    loadAdminData();
    showToast('Login realizado com sucesso!', 'success');
  } else {
    showToast('Usuário ou senha incorretos', 'error');
  }
}

function logoutAdmin() {
  adminUser = null;
  localStorage.removeItem('adminUser');
  document.getElementById('adminLoginScreen').style.display = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
  document.getElementById('adminUser').value = '';
  document.getElementById('adminPassword').value = '';
}

// Verificar se admin já está logado
function checkAdminLogin() {
  const stored = localStorage.getItem('adminUser');
  if (stored) {
    adminUser = JSON.parse(stored);
    document.getElementById('adminLoginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadAdminData();
  }
}

// ============================================
// NAVEGAÇÃO ENTRE ABAS
// ============================================

function switchAdminTab(tabName, event) {
  // Esconder todas as abas
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // Remover active de todos os botões
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Mostrar aba selecionada
  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Ativar botão
  if (event && event.target) {
    event.target.classList.add('active');
  }

  // Carregar dados específicos
  if (tabName === 'dashboard') {
    loadDashboardData();
  } else if (tabName === 'products') {
    loadProductsData();
  } else if (tabName === 'sales') {
    loadSalesData();
  } else if (tabName === 'reviews') {
    loadReviewsData();
  }
}

// ============================================
// CARREGAR DADOS DO DASHBOARD
// ============================================

function loadAdminData() {
  loadDashboardData();
  loadProductsData();
}

function loadDashboardData() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  let totalRevenue = 0;
  let totalSales = 0;

  orders.forEach(order => {
    if (order.total) {
      const totalStr = String(order.total).replace('R$ ', '').replace(',', '.');
      totalRevenue += parseFloat(totalStr) || 0;
      totalSales += order.items.length;
    }
  });

  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];

  let totalReviews = 0;
  products.forEach(product => {
    const reviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`)) || [];
    totalReviews += reviews.length;
  });

  document.getElementById('totalRevenue').textContent =
    `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
  document.getElementById('totalSales').textContent = totalSales;
  document.getElementById('totalProducts').textContent = products.length;
  document.getElementById('totalReviews').textContent = totalReviews;

  // Últimas vendas
  const recentSales = document.getElementById('recentSales');
  if (orders.length === 0) {
    recentSales.innerHTML = '<p class="empty-message">Nenhuma venda ainda</p>';
  } else {
    recentSales.innerHTML = orders.slice(-5).reverse().map(order => `
      <div class="sale-item">
        <div class="sale-header">
          <span class="sale-title">Pedido #${order.id}</span>
          <strong>${order.total}</strong>
        </div>
        <div class="sale-details">
          <span>${order.name}</span>
          <span>${new Date(order.date).toLocaleDateString('pt-BR')}</span>
          <span>${order.items.length} item(ns)</span>
        </div>
      </div>
    `).join('');
  }

  // ===== GRÁFICO =====
  const ctx = document.getElementById('dashboardChart');
  if (!ctx) return;

  if (dashboardChartInstance) {
    dashboardChartInstance.destroy();
  }

  dashboardChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Vendas', 'Produtos', 'Avaliações'],
      datasets: [{
        data: [totalSales, products.length, totalReviews],
        backgroundColor: ['#22c55e', '#3b82f6', '#facc15'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#fff',
            padding: 15
          }
        }
      }
    }
  });
}

// ============================================
// GERENCIAMENTO DE PRODUTOS
// ============================================

function loadProductsData() {
  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
  const list = document.getElementById('productsList');

  if (products.length === 0) {
    list.innerHTML = '<p class="empty-message">Nenhum produto cadastrado</p>';
  } else {
    list.innerHTML = products.map(product => `
      <div class="product-item">
        <div class="product-header">
          <span class="product-title">${product.title}</span>
          <strong>R$ ${product.price.toFixed(2).replace('.', ',')}</strong>
        </div>
        <div class="product-details">
          <span>ID: ${product.id}</span>
          <span>Marca: ${product.brand}</span>
          <span>Descrição: ${product.desc.substring(0, 40)}...</span>
        </div>
        <div class="product-actions">
          <button class="btn-edit" onclick="editProduct(${product.id})">Editar</button>
          <button class="btn-delete" onclick="deleteProduct(${product.id})">Deletar</button>
        </div>
      </div>
    `).join('');
  }
}

function openAddProductForm() {
  editingProductId = null;
  document.getElementById('productFormSection').style.display = 'block';
  document.getElementById('productName').focus();
  
  // Limpar form
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productDesc').value = '';
  document.getElementById('productBrand').value = '';
  document.getElementById('productImg').value = 'img/pod.jpg';
  
  // Resetar botão para "Adicionar"
  const form = document.getElementById('productForm');
  if (form) {
    const btn = form.querySelector('[type="submit"]');
    if (btn) btn.textContent = 'Adicionar Produto';
  }
}

function closeProductForm() {
  editingProductId = null;
  document.getElementById('productFormSection').style.display = 'none';
}

function saveProduct(e) {
  e.preventDefault();

  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const desc = document.getElementById('productDesc').value.trim();
  const brand = document.getElementById('productBrand').value.trim();
  const img = document.getElementById('productImg').value.trim();

  if (!name || !price || !desc || !brand || !img) {
    showToast('Preencha todos os campos!', 'error');
    return;
  }

  let products = JSON.parse(localStorage.getItem('adminProducts')) || [];

  if (editingProductId !== null) {
    // Atualizar produto existente
    const index = products.findIndex(p => p.id === editingProductId);
    if (index !== -1) {
      products[index] = {
        id: editingProductId,
        title: name,
        price,
        desc,
        brand,
        img
      };
      showToast('Produto atualizado com sucesso!', 'success');
    }
  } else {
    // Criar novo produto
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({
      id: newId,
      title: name,
      price,
      desc,
      brand,
      img
    });
    showToast('Produto adicionado com sucesso!', 'success');
  }

  localStorage.setItem('adminProducts', JSON.stringify(products));
  updateGlobalProducts();

  closeProductForm();
  loadProductsData();
}

function editProduct(id) {
  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
  const product = products.find(p => p.id === id);

  if (product) {
    editingProductId = id;
    document.getElementById('productName').value = product.title;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDesc').value = product.desc;
    document.getElementById('productBrand').value = product.brand;
    document.getElementById('productImg').value = product.img;
    
    // Mostrar form
    document.getElementById('productFormSection').style.display = 'block';
    
    // Mudar botão para "Atualizar Produto"
    const form = document.getElementById('productForm');
    if (form) {
      const btn = form.querySelector('[type="submit"]');
      if (btn) btn.textContent = 'Atualizar Produto';
    }
    
    document.getElementById('productName').focus();
  }
}

function deleteProduct(id) {
  showDeleteConfirmation('Produto', () => {
    let products = JSON.parse(localStorage.getItem('adminProducts')) || [];
    products = products.filter(p => p.id !== id);
    localStorage.setItem('adminProducts', JSON.stringify(products));

    updateGlobalProducts();
    loadProductsData();
    showToast('Produto deletado com sucesso!', 'success');
  });
}

function updateGlobalProducts() {
  // Sincronizar com a lista global de produtos
  let adminProducts = JSON.parse(localStorage.getItem('adminProducts')) || [];
  // Aqui você pode atualizar a lista global se necessário
}

// ============================================
// VISUALIZAR VENDAS
// ============================================

function loadSalesData() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const list = document.getElementById('salesList');

  if (orders.length === 0) {
    list.innerHTML = '<p class="empty-message">Nenhuma venda registrada</p>';
  } else {
    list.innerHTML = orders.map((order, idx) => {
      const statusColors = {
        'pendente': '#ffa500',
        'processando': '#2f6bff',
        'enviado': '#00c853',
        'entregue': '#4caf50',
        'cancelado': '#f44336'
      };

      return `
        <div class="sale-item">
          <div class="sale-header">
            <span class="sale-title">Pedido #${order.id} - ${order.name}</span>
            <strong>${order.total}</strong>
          </div>
          <div class="sale-details">
            <span>Email: ${order.email}</span>
            <span>Endereço: ${order.address}</span>
            <span>Data: ${new Date(order.date).toLocaleDateString('pt-BR')}</span>
            <span>Items: ${order.items.length}</span>
            <span>Status: <span style="color: ${statusColors[order.status] || '#666'}">${getStatusText(order.status)}</span></span>
          </div>
          <div class="sale-actions" style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
            <select onchange="updateOrderStatus(${order.id}, this.value)" style="padding: 6px 12px; background: var(--admin-bg-secondary); border: 1px solid var(--admin-border); border-radius: 6px; color: var(--admin-text-primary);">
              <option value="pendente" ${order.status === 'pendente' ? 'selected' : ''}>Pendente</option>
              <option value="processando" ${order.status === 'processando' ? 'selected' : ''}>Processando</option>
              <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
              <option value="entregue" ${order.status === 'entregue' ? 'selected' : ''}>Entregue</option>
              <option value="cancelado" ${order.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
            <button class="btn-delete" onclick="deleteOrder(${order.id})" style="padding: 6px 12px; font-size: 12px;">Deletar Pedido</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ============================================
// VISUALIZAR AVALIAÇÕES
// ============================================

function loadReviewsData() {
  const products = JSON.parse(localStorage.getItem('adminProducts')) || [];
  const list = document.getElementById('reviewsList');
  let allReviews = [];

  // Coletar todas as avaliações
  products.forEach(product => {
    const reviews = JSON.parse(localStorage.getItem(`reviews_${product.id}`)) || [];
    reviews.forEach(review => {
      allReviews.push({
        ...review,
        productName: product.title,
        productId: product.id
      });
    });
  });

  if (allReviews.length === 0) {
    list.innerHTML = '<p class="empty-message">Nenhuma avaliação registrada</p>';
  } else {
    list.innerHTML = allReviews.reverse().map(review => `
      <div class="review-item">
        <div class="review-header">
          <div>
            <div class="review-product">📦 ${review.productName}</div>
            <div class="review-author">👤 ${review.name}</div>
          </div>
          <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        </div>
        <div class="review-text">${review.comment}</div>
        <small style="color: var(--text-muted);">${new Date(review.date).toLocaleDateString('pt-BR')}</small>
      </div>
    `).join('');
  }
}

// ============================================
// MODAL DE CONFIRMAÇÃO
// ============================================

function showDeleteConfirmation(itemType, onConfirm) {
  // Remover qualquer modal existente primeiro
  const existingModal = document.querySelector('.confirmation-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'modal confirmation-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'modal-title');

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h2 id="modal-title">Confirmar Exclusão</h2>
        <button class="close-btn" aria-label="Fechar">&times;</button>
      </div>
      <div class="modal-body" style="padding: 24px; text-align: center;">
        <p style="margin-bottom: 24px; color: var(--admin-text-primary);">
          Tem certeza que deseja deletar este ${itemType.toLowerCase()}?
        </p>
        <p style="color: var(--admin-text-secondary); font-size: 14px; margin-bottom: 24px;">
          Esta ação não pode ser desfeita.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn-secondary cancel-btn" type="button">Cancelar</button>
          <button class="btn-delete confirm-btn" type="button">Deletar</button>
        </div>
      </div>
    </div>
  `;

  // Função para fechar o modal
  const closeModal = () => {
    if (modal && modal.parentNode) {
      modal.remove();
    }
  };

  // Adicionar event listeners
  const modalContent = modal.querySelector('.modal-content');
  const cancelBtn = modal.querySelector('.cancel-btn');
  const confirmBtn = modal.querySelector('.confirm-btn');
  const closeBtn = modal.querySelector('.close-btn');

  // Prevenir propagação de cliques no conteúdo do modal
  if (modalContent) {
    modalContent.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Botão cancelar
  cancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  // Botão confirmar
  confirmBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
    onConfirm();
  });

  // Botão fechar (X)
  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeModal();
  });

  // Adicionar o modal ao body
  document.body.appendChild(modal);

  // Tornar o modal interativo e visível com os estilos globais
  modal.classList.add('open');

  // Fechar ao clicar no fundo/overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Focar no botão cancelar para melhor acessibilidade
  setTimeout(() => {
    cancelBtn.focus();
  }, 100);
}

// ============================================
// GERENCIAMENTO DE PEDIDOS
// ============================================

function updateOrderStatus(orderId, newStatus) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(orders));

    // Atualizar também no adminOrders
    const adminOrders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    const adminOrderIndex = adminOrders.findIndex(o => o.id === orderId);
    if (adminOrderIndex !== -1) {
      adminOrders[adminOrderIndex].status = newStatus;
      localStorage.setItem('adminOrders', JSON.stringify(adminOrders));
    }

    loadSalesData();
    showToast(`Pedido marcado como ${getStatusText(newStatus)}!`, 'success');
  }
}

function deleteOrder(orderId) {
  showDeleteConfirmation('Pedido', () => {
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Remover também do adminOrders
    let adminOrders = JSON.parse(localStorage.getItem('adminOrders')) || [];
    adminOrders = adminOrders.filter(o => o.id !== orderId);
    localStorage.setItem('adminOrders', JSON.stringify(adminOrders));

    loadSalesData();
    showToast('Pedido deletado com sucesso!', 'success');
  });
}

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

// ============================================
// INICIALIZAÇÃO
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAdminLogin);
} else {
  checkAdminLogin();
}
