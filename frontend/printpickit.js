function printPickitTable() {
  // Usamos la lista que está filtrada actualmente en pantalla
  const total = currentFilteredList.length;
  const fechaHoy = new Date().toLocaleDateString();

  // Crear la ventana de impresión
  const win = window.open('', '', 'width=900,height=700');

  // Generar las filas de la tabla basadas en los datos filtrados
  // No necesitamos clonar el HTML, es mejor construirlo desde los datos
  const tableRows = currentFilteredList.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.code}</td>
      <td>${p.ingresoDate}</td>
      <td>${p.recibio ?? ''}</td>
      <td>${p.estado}</td>
      <td>${p.salidaDate ? new Date(p.salidaDate).toLocaleString() : 'EN AGENCIA'}</td>
    </tr>
  `).join('');

  win.document.write(`
    <html>
      <head>
        <title>Pickit · Reporte</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #333; }
          .header { border-bottom: 2px solid #007bff; margin-bottom: 20px; padding-bottom: 10px; }
          h2 { color: #007bff; margin: 0; }
          .info { margin-top: 5px; font-size: 14px; color: #666; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th { 
            background-color: #007bff; 
            color: white; 
            text-align: left; 
            padding: 10px; 
            border: 1px solid #0056b3;
            text-transform: uppercase;
          }
          td { border: 1px solid #dee2e6; padding: 8px; }
          tr:nth-child(even) { background-color: #f8f9fa; }
          
          .footer { margin-top: 20px; text-align: right; font-size: 12px; font-weight: bold; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>REPORTE DE PAQUETES PICKIT</h2>
          <div class="info">Fecha de impresión: ${fechaHoy}</div>
        </div>
        
        <div class="info">Este reporte contiene los paquetes seleccionados mediante los filtros aplicados.</div>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>CÓDIGO</th>
              <th>INGRESO</th>
              <th>RECIBIÓ</th>
              <th>ESTADO</th>
              <th>SALIDA</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          Total de paquetes en este reporte: ${total}
        </div>
      </body>
    </html>
  `);

  win.document.close();
  
  // Pequeña pausa para asegurar que los estilos carguen antes de imprimir
  setTimeout(() => {
    win.focus();
    win.print();
    win.close();
  }, 500);
}