// Configurações
const API_URL       = 'https://zulg3idve7.execute-api.us-east-1.amazonaws.com/depoimentos';
const ADMIN_PASSWORD= 'supletivo2024';
const HEADERS       = { 'Content-Type':'application/json' };

let depoimentos = [];
let adminTimeout;

// Utilitários de Autenticação
function isAdminAuthenticated() {
  return sessionStorage.getItem('adminAuth') === 'true';
}
function adminLogout() {
  sessionStorage.removeItem('adminAuth');
  document.body.classList.remove('admin-authenticated');
  clearTimeout(adminTimeout);
  toggleAdminElements(false);
  carregarDepoimentos();
}

// Funções de Modal/Form
function toggleAdminModal() {
  const m = document.getElementById('adminModal');
  m.classList.toggle('active');
}
function toggleForm() {
  document.getElementById('depoimentoContainer').classList.toggle('active');
}

// Login Admin
function fazerLoginAdmin(e) {
  e.preventDefault();
  const senha = document.getElementById('adminSenha').value;
  if (senha===ADMIN_PASSWORD) {
    sessionStorage.setItem('adminAuth','true');
    document.body.classList.add('admin-authenticated');
    toggleAdminElements(true);
    toggleAdminModal();
    adminTimeout = setTimeout(adminLogout, 3600000);
    alert('✅ Modo administrativo ativado!');
    carregarDepoimentos();
  } else {
    alert('❌ Senha incorreta!');
    document.getElementById('adminSenha').value='';
  }
}

// Controle de Botões Admin
function toggleAdminElements(isAdmin) {
  document.getElementById('btnAbrirAdmin').style.display = isAdmin ? 'none' : 'block';
  document.getElementById('btnLogoutAdmin').style.display = isAdmin ? 'block': 'none';
}

// CRUD de Depoimentos
async function carregarDepoimentos() {
  try {
    const res = await fetch(API_URL, { headers: HEADERS });
    if (!res.ok) throw new Error(res.status);
    depoimentos = await res.json();
  } catch (err) {
    console.error(err);
    alert('Erro ao carregar depoimentos.');
  }
  renderizar();
}
async function enviarDepoimento(e) {
  e.preventDefault();
  const nome  = document.getElementById('depoimentoNome').value.trim();
  const texto = document.getElementById('depoimentoTexto').value.trim();
  if (!texto) return alert('Escreva seu depoimento.');
  try {
    const res = await fetch(API_URL, {
      method:'POST',
      headers:HEADERS,
      body:JSON.stringify({ nome, texto, data: new Date().toISOString() })
    });
    if (!res.ok) throw new Error(res.status);
    document.getElementById('depoimentoForm').reset();
    toggleForm();
    await carregarDepoimentos();
    alert('Depoimento enviado! 🎉');
  } catch (err) {
    console.error(err);
    alert('Falha ao enviar depoimento.');
  }
}
async function excluirDepoimento(id) {
  if (!isAdminAuthenticated()) return adminLogout();
  if (!confirm('Confirmar exclusão?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method:'DELETE', headers:HEADERS });
    if (!res.ok) throw new Error(res.status);
    await carregarDepoimentos();
    alert('Depoimento excluído.');
  } catch (err) {
    console.error(err);
    alert('Erro ao excluir.');
  }
}

// Renderização
function renderizar() {
  const lista = document.getElementById('listaDepoimentos');
  lista.innerHTML = '';
  depoimentos.forEach(d => {
    const card = document.createElement('div');
    card.className = 'depoimento-card';
    if (isAdminAuthenticated()) {
      const btn = document.createElement('button');
      btn.className = 'btn-excluir';
      btn.innerHTML = '<i class="fas fa-times"></i>';
      btn.onclick = () => excluirDepoimento(d.id);
      card.appendChild(btn);
    }
    card.innerHTML += `
      <p>${d.texto}</p>
      ${d.nome?`<small>- ${d.nome}</small>`:''}
      <div class="depoimento-data">${new Date(d.data).toLocaleDateString('pt-BR')}</div>
    `;
    lista.appendChild(card);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnAbrirAdmin').onclick     = toggleAdminModal;
  document.getElementById('btnAcessarAdmin').onclick   = fazerLoginAdmin;
  document.getElementById('btnLogoutAdmin').onclick    = adminLogout;
  document.getElementById('btnToggleForm').onclick     = toggleForm;
  document.getElementById('depoimentoForm').onsubmit   = enviarDepoimento;

  // Restaura sessão
  if (isAdminAuthenticated()) {
    document.body.classList.add('admin-authenticated');
    toggleAdminElements(true);
    adminTimeout = setTimeout(adminLogout, 3600000);
  }
  carregarDepoimentos();
});
