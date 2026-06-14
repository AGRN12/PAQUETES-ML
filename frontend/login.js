// ✅ Dinámico: Usa la IP del puente o localhost si no encuentra nada
const BASE_NET_URL = window.API_URL || 'http://localhost:3000';

// 🚀 LA RUTA CORRECTA QUE USABA TU BACKEND:
const API = `${BASE_NET_URL}/auth/login`; 

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    await showConfirmModal('Login incorrecto');
    return;
  }

  const data = await res.json();

  // 🔐 GUARDAR TOKEN
  localStorage.setItem('jwt', data.token);

  // 🔎 DECODIFICAR JWT (FORMA CORRECTA)
  const payloadBase64 = data.token
    .split('.')[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const payload = JSON.parse(atob(payloadBase64));

  localStorage.setItem('role', payload.role);

  // 🔀 REDIRECCIÓN FINAL
  window.location.href = 'passwords.html';
}