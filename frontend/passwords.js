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
  const token = getToken();
 
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
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

async function exportBackup() {
  try {
    // 1. Cambiamos la URL de 'user/export-db' a 'backup/export'
    const res = await fetch('http://localhost:3000/backup/export', {
      headers: authHeaders(), // Asegúrate que esta función devuelva el Bearer Token
    });

    if (!res.ok) {
      await showConfirmModal('No autorizado para exportar respaldo');
      return;
    }

    // 2. Recibimos el JSON del servidor
    const data = await res.json();
    
    // 3. Convertimos el objeto a un archivo de texto descargable
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 4. Cambiamos la extensión de .sqlite a .json
    const fecha = new Date().toISOString().split('T')[0];
    a.download = `respaldo_cyber_${fecha}.json`; 
    
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    await showConfirmModal('Error al exportar respaldo');
  }
}
function logout(msg = 'Sesión expirada') {
  localStorage.clear();
  

  const currentPage = window.location.pathname;

  // 👇 SI YA ESTÁS EN LOGIN, NO HAGAS NADA
  if (currentPage.includes('login.html')) {
    return;
  }

  // 👇 SI NO, MANDA A LOGIN
  window.location.href = 'login.html';
}

/*********************************
 * VALIDACIÓN INICIAL
 *********************************/
const user = getUserFromToken();

if (!user) {
  logout();
}
async function importBackup() {
    const fileInput = document.getElementById('dbFile');
    if (!fileInput.files.length) return;

    // Mostrar contenedor de la barra
    document.getElementById('importContainer').style.display = 'block';

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // 1. Enviar el archivo al nuevo endpoint 'backup/import'
    fetch('http://localhost:3000/backup/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
    });

    // 2. Iniciar el contador del 1 al 100
    const interval = setInterval(async () => {
        const res = await fetch('http://localhost:3000/backup/import-progress', {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        
        if (res.ok) {
            const data = await res.json();
            const bar = document.getElementById('progressBar');
            bar.style.width = data.progress + '%';
            bar.innerText = data.progress + '%';

            if (data.progress >= 100) {
                clearInterval(interval);
                // 3. Mostrar el modal de reinicio
                const ok = await showConfirmModal('¡Importación completa! ¿Reiniciar para ver los cambios?');
                if (ok) triggerRestart();
            }
        }
    }, 1000);
}

function triggerRestart() {
    // Si tienes configurado el bridge de Electron:
    if (window.electronAPI) {
        window.electronAPI.send('restart-app');
    } else {
        // Si estás probando con npm run start:electron y no tienes bridge:
        window.location.reload(); 
    }
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
          <input class="pass" type="password" value="${p.password}" disabled id="pwd-${p.id}">
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
  const ok = await showConfirmModal('¿Eliminar contraseña?');
  if (!ok) return;

  const res = await fetch(`${API}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    await showConfirmModal('No autorizado');
    return;
  }

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
    await showConfirmModal('No autorizado para ver usuarios');
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
          <select class="selecta" onchange="changeRole(${u.id}, this.value)">
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
  const res = await fetch('http://localhost:3000/users',{
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      username: newUser.value,
      password: newPass.value,
      role: newRole.value,
    }),
  });

  if (!res.ok) return await showConfirmModal('Error al crear usuario');

  await showConfirmModal('Usuario creado');
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
  const password = await showPromptModal('Nueva contraseña');
  if (!password) return;

  await fetch(`http://localhost:3000/users/${id}/password`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ password }),
  });

  await showConfirmModal('Contraseña actualizada');
}

async function deleteUser(id) {
  const ok = await showConfirmModal('¿Eliminar usuario?');
  if (!ok) return;

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

if (user.role === 'ADMIN') {
  const panel = document.getElementById('adminPanel');
  if (panel) panel.style.display = 'block';
  loadUsers();
}

//create password
async function createPassword() {
  const res = await fetch('http://localhost:3000/passwords', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      platform: platform.value,
      username: username.value,
      password: password.value,
      notes: notes.value,
    }),
  });

  if (!res.ok) {
    await showConfirmModal('Error al guardar contraseña');
    return;
  }

  await showConfirmModal('Guardado');
  platform.value = '';
  username.value = '';
  password.value = '';
  notes.value = '';

  loadPasswords();
}

async function btnCerrarSesion() {
  const ok = await showConfirmModal('¿Cerrar sesión?');
  if (ok) logout();
}


