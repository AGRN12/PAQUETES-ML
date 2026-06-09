const { app, BrowserWindow, Menu, MenuItem, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const log = require('electron-log');

// --- 1. DESACTIVAR ACELERACIÓN  ---
app.disableHardwareAcceleration();

log.info('Aplicación iniciando...');
let backendProcess;

function startBackend() {
  const isPackaged = app.isPackaged;
  const backendDir = isPackaged 
    ? path.join(process.resourcesPath, 'backend')
    : path.join(__dirname, 'dist');
    
  const backendPath = path.join(backendDir, 'main.js');

  backendProcess = spawn(process.execPath, [backendPath], {
    shell: true,
    windowsHide: true,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
      NODE_PATH: isPackaged ? path.join(backendDir, 'node_modules') : undefined,
      // ELIMINAMOS DB_PATH DE AQUÍ PARA QUE NO USE app.getPath
    }
  });

  backendProcess.stderr.on('data', (data) => {
    log.error(`Backend Error: ${data}`);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // --- 2. CARGA INTELIGENTE (En lugar de un setTimeout fijo) ---
  // En las de 4GB, 12 segundos puede ser poco o mucho. 
  // Es mejor intentar cargar y si falla, reintentar.
  const frontendPath = path.join(__dirname, 'frontend', 'index.html');
  
  win.loadFile(frontendPath);

  win.once('ready-to-show', () => {
    win.show();
  });

  
}
// ========================================================
// --- NUEVO: CONFIGURACIÓN GLOBAL DEL CLIC DERECHO ---
// ========================================================
app.on('web-contents-created', (event, contents) => {
  contents.on('context-menu', (e, props) => {
    // Si el usuario hace clic derecho sobre cualquier campo de texto o contraseña...
    if (props.isEditable) {
      const menu = new Menu();

      // Opción: Copiar (Se activa solo si seleccionaste texto)
      menu.append(new MenuItem({
        label: 'Copiar',
        role: 'copy',
        enabled: props.editFlags.canCopy
      }));

      // Opción: Pegar
      menu.append(new MenuItem({
        label: 'Pegar',
        role: 'paste',
        enabled: props.editFlags.canPaste
      }));

      // Despliega el menú nativo chiquito de Windows en la posición del mouse
      menu.popup({
        window: BrowserWindow.fromWebContents(contents)
      });
    }
  });
});
// ========================================================

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

// --- 3. LIMPIEZA DE PROCESOS ---
app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
});