function printTable() {
    // Si currentFilteredList tiene algo (porque filtramos), usamos eso. 
    // Si está vacía (al cargar la página), usamos allPackages.
    const listToPrint = (currentFilteredList && currentFilteredList.length > 0) 
                        ? currentFilteredList 
                        : allPackages;

    if (!listToPrint || listToPrint.length === 0) {
        alert("No hay datos para imprimir.");
        return;
    }

    const total = listToPrint.length;
    const fechaHoy = new Date().toLocaleDateString();
    const win = window.open('', '', 'width=900,height=700');

    // Generamos filas sin ID y con letra pequeña para ahorrar hojas
    const tableRows = listToPrint.map(p => `
        <tr>
            <td style="font-weight: bold;">${p.code}</td>
            <td>${p.type || ''}</td>
            <td>${p.date || ''}</td>
            <td>${p.person || ''}</td>
            <td style="text-align:center;">${p.colecta || ''}</td>
        </tr>
    `).join('');

    win.document.write(`
        <html>
            <head>
                <title>Reporte Mercado Libre</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { background: #eee; border: 1px solid #000; padding: 4px; font-size: 10px; text-transform: uppercase; }
                    td { border: 1px solid #ccc; padding: 3px; font-size: 9px; } /* Letra chica para ahorrar hojas */
                    .footer { margin-top: 10px; text-align: right; font-weight: bold; font-size: 11px; }
                    h2 { font-size: 14px; margin: 0; }
                </style>
            </head>
            <body>
                <h2>LISTADO DE PAQUETES - MERCADO LIBRE</h2>
                <div style="font-size: 10px;">Fecha: ${fechaHoy}</div>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th><th>Tipo</th><th>Fecha</th><th>Responsable</th><th>Col.</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <div class="footer">Total paquetes: ${total}</div>
            </body>
        </html>
    `);

    win.document.close();
    setTimeout(() => {
        win.focus();
        win.print();
        win.close();
    }, 500);
}