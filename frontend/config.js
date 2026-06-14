// frontend/config.js
// 🚀 CONFIGURACIÓN HÍBRIDA PERMANENTE (NUNCA SE BORRA SOLO)

(function() {
  // Cambiamos a localStorage para que sea PERMANENTE en el disco duro
  const modoRed = localStorage.getItem('cyber_modo_red'); 
  const ipServidor = localStorage.getItem('cyber_ip_servidor');

  if (modoRed === 'CLIENTE' && ipServidor) {
    window.API_URL = `http://${ipServidor}:3000`;
    console.log(`📡 [PERMANENTE] MODO CLIENTE - Conectado a: ${window.API_URL}`);
  } else {
    window.API_URL = 'http://localhost:3000';
    console.log(`🖥️ [PERMANENTE] MODO SERVIDOR/LOCAL - Apuntando a: ${window.API_URL}`);
  }
})();

// Función para configurar UNA SOLA VEZ desde la consola (F12)
window.configurarRedCyber = function(modo, ip = '') {
  if (modo === 'CLIENTE') {
    if (!ip) return console.error("❌ Falta la IP. Ejemplo: configurarRedCyber('CLIENTE', '192.168.1.50')");
    localStorage.setItem('cyber_modo_red', 'CLIENTE');
    localStorage.setItem('cyber_ip_servidor', ip.trim());
    console.log("✅ Máquina configurada como CLIENTE permanentemente.");
  } else {
    localStorage.removeItem('cyber_modo_red');
    localStorage.removeItem('cyber_ip_servidor');
    console.log("✅ Máquina configurada como SERVIDOR permanentemente.");
  }
  window.location.reload();
};