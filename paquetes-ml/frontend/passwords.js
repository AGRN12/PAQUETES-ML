/*********************************
 * CONFIGURACIÓN
 *********************************/
const API = 'http://localhost:3000/passwords';
let passwordList = [];

/*********************************
 * JWT / AUTH
 *********************************/
function getToken() {
  return localStorage.getItem('jwt');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function getUserFromToken() {
  const token = getToken();
  if (!token) return null;

  try {
    return JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
  } catch {
    return null;
  }
}

function logout(msg = 'Sesión expirada') {
  localStorage.clear();
  alert(msg);
  window.location.href = 'login.html';
}

/*********************************
 * VALIDACIÓN INICIAL
 *********************************/
const user = getUserFromToken();
if (!user) logout('Sesión inválida');

/*********************************
 * ROLES
 *********************************/
if (user.role === 'ADMIN') {
  document.getElementById('adminPanel').style.display = 'block';
}

/*********************************
 * PASSWORDS
 *********************************/
async function loadPasswords() {
  const res = await fetch(API, { headers: authHeaders() });
  if (!res.ok) return logout();

  passwordList = await res.json();
  renderPasswords();
}

function renderPasswords() {
  const tbody = document.getElementById('passwordTable');
  tbody.innerHTML = '';

  passwordList.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.platform}</td>
        <td>${p.username}</td>
        <td>
          <input type="password" value="${p.password}" disabled id="pwd-${p.id}">
          <button onclick="togglePwd(${p.id})">👁</button>
        </td>
        <td>${p.notes ?? ''}</td>
        <td>
          <button onclick="deletePassword(${p.id})">🗑</button>
        </td>
      </tr>
    `;
  });
}

function togglePwd(id) {
  const i = document.getElementById(`pwd-${id}`);
  i.type = i.type === 'password' ? 'text' : 'password';
}

async function deletePassword(id) {
  if (!confirm('¿Eliminar contraseña?')) return;

  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) return alert('No autorizado');
  loadPasswords();
}

/*********************************
 * USUARIOS (ADMIN)
 *********************************/
async function loadUsers() {
  const res = await fetch('http://localhost:3000/users', {
    headers: authHeaders(),
  });

  if (!res.ok) {
    alert('No autorizado para ver usuarios');
    return;
  }

  const users = await res.json();
  const tbody = document.getElementById('usersTable');
  tbody.innerHTML = '';

  users.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td>${u.username}</td>
        <td>
          <select onchange="changeRole(${u.id}, this.value)">
            <option value="USER" ${u.role === 'USER' ? 'selected' : ''}>USER</option>
            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          </select>
        </td>
        <td>
          <button onclick="changePassword(${u.id})">🔑</button>
          <button onclick="deleteUser(${u.id})">🗑</button>
        </td>
      </tr>
    `;
  });
}

async function createUser() {
  const res = await fetch('http://localhost:3000/users', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      username: newUser.value,
      password: newPass.value,
      role: newRole.value,
    }),
  });

  if (!res.ok) return alert('Error al crear usuario');

  alert('Usuario creado');
  newUser.value = '';
  newPass.value = '';
  loadUsers();
}

async function changeRole(id, role) {
  await fetch(`http://localhost:3000/users/${id}/role`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  });
}

async function changePassword(id) {
  const password = prompt('Nueva contraseña');
  if (!password) return;

  await fetch(`http://localhost:3000/users/${id}/password`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ password }),
  });

  alert('Contraseña actualizada');
}

async function deleteUser(id) {
  if (!confirm('¿Eliminar usuario?')) return;

  await fetch(`http://localhost:3000/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  loadUsers();
}

/*********************************
 * INIT
 *********************************/
loadPasswords();
if (user.role === 'ADMIN') loadUsers();
