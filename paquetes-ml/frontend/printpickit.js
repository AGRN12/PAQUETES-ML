function printPickitTable() {
  const originalTable = document.querySelector('table');
  const rows = document.querySelectorAll('#pickitTable tr');
  const total = rows.length;

  // 🔁 Clonar tabla para no modificar la original
  const tableClone = originalTable.cloneNode(true);

  // ❌ quitar columna checkbox (0) y editar (última)
  const removeColumns = [0, tableClone.rows[0].cells.length - 1];

  for (const row of tableClone.rows) {
    removeColumns
      .sort((a, b) => b - a) // importante: borrar de derecha a izquierda
      .forEach(index => {
        if (row.cells[index]) {
          row.deleteCell(index);
        }
      });
  }

  const win = window.open('', '', 'width=900,height=700');

  win.document.write(`
    <html>
      <head>
        <title>Pickit · Paquetes</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #eee; }
          h2 { margin-bottom: 5px; }
          .total { margin-bottom: 15px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Listado Pickit</h2>
        <div class="total">Total de paquetes: ${total}</div>
        ${tableClone.outerHTML}
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
  win.close();
}