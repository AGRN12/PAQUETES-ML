const API = 'http://localhost:3000/auth/login';

async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    alert('Login incorrecto');
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
