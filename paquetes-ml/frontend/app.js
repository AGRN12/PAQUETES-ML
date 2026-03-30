function printTable() {
  const table = document.querySelector('.box table');
  const rows = table.querySelectorAll('tbody tr');

  const total = rows.length;

  const tableHtml = table.outerHTML;

  const win = window.open('', '', 'width=900,height=700');

  win.document.write(`
    <html>
      <head>
        <title>Paquetes filtrados</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #eee; }

          /* ❌ ocultar columnas no deseadas en impresión */
          th:first-child, td:first-child,
          th:last-child, td:last-child {
            display: none;
          }
        </style>
      </head>
      <body>
        <h2>Listado de paquetes</h2>
        <p><strong>Total de paquetes:</strong> ${total}</p>

        ${tableHtml}
      </body>
    </html>
  `);

  win.document.close();
  win.focus();
  win.print();
  win.close();
}