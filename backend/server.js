const path = require('path');
const fs = require('fs');

// Usamos la ruta que nos pasa Electron, o la carpeta actual en desarrollo
const basePath = process.env.DB_PATH || __dirname;
const dbPath = path.join(basePath, 'paquetes.db');

// Asegurar que la carpeta existe (en AppData/Roaming/paquetes)
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

console.log('Base de datos ubicada en:', dbPath);
// Configura tu TypeORM / Sequelize para usar esta dbPath
