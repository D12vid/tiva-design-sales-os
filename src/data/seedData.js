export const PRODUCT_CATALOG = [
    { name: 'Adobe', defaultPrice: 6.0, defaultBs: 6000, category: 'Diseño & Creatividad' },
    { name: 'Office', defaultPrice: 15.0, defaultBs: 14600, category: 'Ofimática' },
    { name: 'Canva Pro', defaultPrice: 5.0, defaultBs: 5000, category: 'Diseño & Creatividad' },
    { name: 'CapCut Pro', defaultPrice: 6.0, defaultBs: 6000, category: 'Edición de Video' },
    { name: 'ChatGPT Plus', defaultPrice: 10.0, defaultBs: 10000, category: 'Inteligencia Artificial' }
];

export const PAYMENT_METHODS = ['Pago Móvil', 'Binance', 'Zinli', 'Transferencia'];
export const SALES_CHANNELS = ['Meta Ads', 'Instagram @tivadesign_', 'WhatsApp Directo', 'Web / Marketplace'];

// Calendario oficial de Semanas TIVA DESIGN (Lunes a Domingo)
export const WEEKS_CALENDAR = [
    { id: 1, label: 'Semana 1', rangeText: 'Lun 14 Sep – Dom 20 Sep 2026', start: '2026-09-14', end: '2026-09-20', defaultPaid: true },
    { id: 2, label: 'Semana 2', rangeText: 'Lun 21 Sep – Dom 27 Sep 2026', start: '2026-09-21', end: '2026-09-27', defaultPaid: true },
    { id: 3, label: 'Semana 3', rangeText: 'Lun 28 Sep – Dom 04 Oct 2026', start: '2026-09-28', end: '2026-10-04', defaultPaid: true },
    { id: 4, label: 'Semana 4', rangeText: 'Lun 05 Oct – Dom 11 Oct 2026', start: '2026-10-05', end: '2026-10-11', defaultPaid: true },
    { id: 5, label: 'Semana 5', rangeText: 'Lun 12 Oct – Dom 18 Oct 2026', start: '2026-10-12', end: '2026-10-18', defaultPaid: true },
    { id: 6, label: 'Semana 6', rangeText: 'Lun 19 Oct – Dom 25 Oct 2026', start: '2026-10-19', end: '2026-10-25', defaultPaid: true },
    { id: 7, label: 'Semana 7', rangeText: 'Lun 26 Oct – Dom 01 Nov 2026', start: '2026-10-26', end: '2026-11-01', defaultPaid: true },
    { id: 8, label: 'Semana 8 (Actual)', rangeText: 'Lun 02 Nov – Dom 08 Nov 2026', start: '2026-11-02', end: '2026-11-08', defaultPaid: false },
    { id: 9, label: 'Semana 9', rangeText: 'Lun 09 Nov – Dom 15 Nov 2026', start: '2026-11-09', end: '2026-11-15', defaultPaid: false }
];

export const INITIAL_PAID_WEEKS = WEEKS_CALENDAR.reduce((acc, w) => {
    acc[w.id] = w.defaultPaid;
    return acc;
}, {});

export function getWeekIdFromDate(dateStr) {
    if (!dateStr) return 8;
    const found = WEEKS_CALENDAR.find((w) => dateStr >= w.start && dateStr <= w.end);
    if (found) return found.id;
    if (dateStr < '2026-09-14') return 1;
    return 8;
}

export const INITIAL_EXPENSES = [
    { id: 'exp-1', concept: 'Almacenamiento Google Drive', frequency: 'Trimestral', amount_usd: 2.5, notes: 'Almacenamiento en la nube' },
    { id: 'exp-2', concept: 'Publicidad (Ads)', frequency: 'Semanal', amount_usd: 42.0, notes: 'Presupuesto semanal de anuncios' },
    { id: 'exp-3', concept: 'Pago de Línea Movistar', frequency: 'Mensual', amount_usd: 3.8, notes: 'Línea Movistar' },
    { id: 'exp-4', concept: 'Bono de trabajador', frequency: 'Semanal', amount_usd: 10.0, notes: 'Bono por superar meta de 15 ventas' }
];

const RAW_SALES_COMPACT = [
    // Semana 1 (Lun 14 Sep a Dom 20 Sep 2026) - 31 ventas ($204 USD)
    [1, '2026-09-14', 'Santiago Pietri Hidalgo', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-14', 'Johanna Betancour', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-14', 'Edgar David Colmenares', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [1, '2026-09-14', 'Kenner Salom', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-14', 'Alfredo Enrique', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-14', 'Laura Alonzo', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [1, '2026-09-15', 'Nahomy', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-15', 'Jose Márquez', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-15', 'Vanessa Barrios', 'Adobe', 6, 5800, 'Binance', 'Instagram @tivadesign_', false],
    [1, '2026-09-15', 'Marcial Ferreira', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-16', 'Angel Guevara', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-16', 'Francia Sánchez', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-16', 'Eulenys Flores', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [1, '2026-09-16', 'Ana Karina', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-16', 'Eduardo Rosales', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-17', 'Liz Silva', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [1, '2026-09-17', 'Eneidy Carmona', 'Office', 15, 14600, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-17', 'Castillo', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-17', 'Creacionesces', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [1, '2026-09-19', 'Fran Vargas', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-19', 'Fabiana', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-19', 'Genesis Faublack', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-19', 'Miguel Montilla', 'Adobe', 6, 5800, 'Binance', 'Web / Marketplace', false],
    [1, '2026-09-20', 'Cliente Sin Nombre', 'Office', 15, 14600, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-20', 'Abelo', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-20', 'Courtix Creative', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [1, '2026-09-20', 'Humberto', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-20', 'Cliente Sin Nombre', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-20', 'Gustavo', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [1, '2026-09-20', 'Yonehiker Rivera', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [1, '2026-09-20', 'Cristian Mendes', 'Adobe', 6, 5800, 'Binance', 'Meta Ads', false],

    // Semana 2 (Lun 21 Sep a Dom 27 Sep 2026) - 21 ventas ($135 USD)
    [2, '2026-09-21', 'Fandy Paiva', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-21', 'Freddy García', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-21', 'Cliente Sin Nombre', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [2, '2026-09-21', 'Osmar Contreras', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-21', 'Cris Delgado', 'Office', 15, 14600, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [2, '2026-09-21', 'Cris Delgado', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [2, '2026-09-22', 'David Perez', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-22', 'Alvanis Morales', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-23', 'Angeles Slava', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-23', 'Jesus Riveros', 'Adobe', 6, 5800, 'Binance', 'Web / Marketplace', false],
    [2, '2026-09-23', 'Bemore', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [2, '2026-09-24', 'Victor Lozada', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-24', 'Flower desing', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [2, '2026-09-25', 'CL sin nombre', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-25', 'Carlos Ramos', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-25', 'Saul Parra', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [2, '2026-09-26', 'Barboza', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-26', 'Mari', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-26', 'CL sin nombre', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [2, '2026-09-27', 'Katy trujillo', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [2, '2026-09-27', 'moka', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],

    // Semana 3 (Lun 28 Sep a Dom 04 Oct 2026) - 24 reales + 4 plantilla
    [3, '2026-09-28', 'Patiño González', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-09-29', 'Gabriela José', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-09-29', 'Isabella Valentina', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [3, '2026-09-29', 'Gastón sifontes', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-09-29', 'niumi', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-09-30', 'Jesús', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [3, '2026-09-30', 'Ronny Romero', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-09-30', 'Hernán', 'Adobe', 6, 5800, 'Binance', 'Web / Marketplace', false],
    [3, '2026-09-30', 'Danylena Anche', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-01', 'Nocamb', 'Adobe', 6, 5800, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [3, '2026-10-01', 'Franky CL', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-01', 'Barby CL', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-01', 'Cl sin nombre', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-01', 'Noly', 'Adobe', 6, 5800, 'Pago Móvil', 'WhatsApp Directo', false],
    [3, '2026-10-01', 'Ana Pau', 'Adobe', 6, 5800, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-01', 'Barbara Calderón', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-02', 'Alexander del pino', 'Adobe', 6, 5850, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [3, '2026-10-02', 'Nahiyelith Gallardo', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-03', 'Deinys Colli', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-03', 'Henry Román', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-03', 'mariana castro', 'Adobe', 6, 5850, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [3, '2026-10-03', 'Verónica', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-03', 'marco antonio', 'Adobe', 6, 5850, 'Pago Móvil', 'WhatsApp Directo', false],
    [3, '2026-10-04', 'cinthia lópez', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [3, '2026-10-04', '[Fila Plantilla Sheet #109]', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', true],
    [3, '2026-10-04', '[Fila Plantilla Sheet #110]', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', true],
    [3, '2026-10-04', '[Fila Plantilla Sheet #111]', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', true],
    [3, '2026-10-04', '[Fila Plantilla Sheet #112]', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', true],

    // Semana 4 (Lun 05 Oct a Dom 11 Oct 2026) - 17 reales + 1 plantilla
    [4, '2026-10-05', 'Estudio Visual', 'Adobe', 6, 5850, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [4, '2026-10-05', 'Valeria Morillor', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-05', 'Nathalia Sarcos', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-06', 'Mauro Mata', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-06', 'Airón', 'Adobe', 6, 5850, 'Pago Móvil', 'WhatsApp Directo', false],
    [4, '2026-10-06', 'CL sin nombre', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-06', 'Luis Guillermo', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-07', 'Edison Cruz', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-08', 'Nakary', 'Adobe', 6, 5850, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [4, '2026-10-08', 'Junto paguay', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-09', 'César Rivas', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-10', 'Israel Osuna', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-10', 'Edison Suárez', 'Adobe', 6, 5850, 'Pago Móvil', 'WhatsApp Directo', false],
    [4, '2026-10-10', 'Luibeth núñez', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-10', 'Ronald Zea', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-10', 'Milanger', 'Adobe', 6, 5850, 'Binance', 'Web / Marketplace', false],
    [4, '2026-10-11', 'Nolberto Rubio', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', false],
    [4, '2026-10-11', '[Fila Plantilla Sheet #50]', 'Adobe', 6, 5850, 'Pago Móvil', 'Meta Ads', true],

    // Semana 5 (Lun 12 Oct a Dom 18 Oct 2026) - 13 ventas
    [5, '2026-10-12', 'Yennifer Milano', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-12', 'Paola González', 'Adobe', 6, 6000, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [5, '2026-10-12', 'Lithografica', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-12', 'José Pinto', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-13', 'Yerly', 'Adobe', 6, 6000, 'Binance', 'Web / Marketplace', false],
    [5, '2026-10-13', 'Laura', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-13', 'Mauro meza', 'Adobe', 6, 6000, 'Pago Móvil', 'WhatsApp Directo', false],
    [5, '2026-10-13', 'Karla Marrero', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-15', 'Diana Querales', 'Adobe', 6, 6000, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [5, '2026-10-16', 'CL SIN NOMBRE', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-17', 'Barro', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-17', 'Paola valentina', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [5, '2026-10-18', 'Alexia Valentina', 'Adobe', 6, 6000, 'Pago Móvil', 'Instagram @tivadesign_', false],

    // Semana 6 (Lun 19 Oct a Dom 25 Oct 2026) - 10 ventas (Fechas corregidas a Octubre)
    [6, '2026-10-19', 'Anders Morales', 'Adobe', 6, 6000, 'Zinli', 'Web / Marketplace', false],
    [6, '2026-10-19', 'Jscreativo', 'Adobe', 6, 6000, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [6, '2026-10-20', 'Jesús Barillas', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [6, '2026-10-20', 'Luis Bosque', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [6, '2026-10-20', 'Cliente Sin Nombre', 'Adobe', 6, 6000, 'Pago Móvil', 'WhatsApp Directo', false],
    [6, '2026-10-20', 'Jesús Barillas', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [6, '2026-10-21', 'Alex marker', 'Adobe', 6, 6000, 'Pago Móvil', 'Instagram @tivadesign_', false],
    [6, '2026-10-22', 'Agustin', 'Adobe', 6, 6000, 'Binance', 'Meta Ads', false],
    [6, '2026-10-24', 'Sebastián Alejandro', 'Adobe', 6, 6000, 'Pago Móvil', 'Meta Ads', false],
    [6, '2026-10-24', 'Lea Domínguez', 'Adobe', 6, 6000, 'Binance', 'Instagram @tivadesign_', false]
];

export const INITIAL_SALES = RAW_SALES_COMPACT.map((row, index) => ({
    id: `sale-${index + 1}`,
    week_id: row[0],
    sale_date: row[1],
    client_name: row[2],
    product: row[3],
    price_usd: Number(row[4]),
    amount_bs: Number(row[5]),
    payment_method: row[6],
    channel: row[7],
    commission_usd: Number((row[4] * 0.15).toFixed(2)),
    is_template_row: row[8]
}));