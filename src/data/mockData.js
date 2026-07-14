export const CATEGORIES = [
  { id: 'semua', label: 'Semua' },
  { id: 'kopi', label: 'Kopi' },
  { id: 'non-kopi', label: 'Non-Kopi' },
  { id: 'makanan', label: 'Makanan' },
  { id: 'snack', label: 'Snack' },
];

export const PRODUCTS = [
  { id: 'p1', name: 'Kopi Susu Gula Aren', category: 'kopi', price: 18000, stock: 42, minStock: 10, active: true, sku: 'KSG-001' },
  { id: 'p2', name: 'Americano', category: 'kopi', price: 15000, stock: 38, minStock: 10, active: true, sku: 'AMR-002' },
  { id: 'p3', name: 'Cappuccino', category: 'kopi', price: 20000, stock: 25, minStock: 10, active: true, sku: 'CPC-003' },
  { id: 'p4', name: 'Es Teh Manis', category: 'non-kopi', price: 8000, stock: 60, minStock: 15, active: true, sku: 'ETM-004' },
  { id: 'p5', name: 'Matcha Latte', category: 'non-kopi', price: 22000, stock: 6, minStock: 10, active: true, sku: 'MTL-005' },
  { id: 'p6', name: 'Nasi Goreng Spesial', category: 'makanan', price: 25000, stock: 18, minStock: 5, active: true, sku: 'NGS-006' },
  { id: 'p7', name: 'Roti Bakar Coklat Keju', category: 'makanan', price: 17000, stock: 12, minStock: 5, active: true, sku: 'RBK-007' },
  { id: 'p8', name: 'Kentang Goreng', category: 'snack', price: 14000, stock: 30, minStock: 10, active: true, sku: 'KTG-008' },
  { id: 'p9', name: 'Pisang Nugget', category: 'snack', price: 13000, stock: 3, minStock: 8, active: true, sku: 'PSN-009' },
  { id: 'p10', name: 'Croffle Original', category: 'snack', price: 19000, stock: 22, minStock: 8, active: true, sku: 'CRF-010' },
  { id: 'p11', name: 'Es Kopi Hitam', category: 'kopi', price: 12000, stock: 50, minStock: 10, active: true, sku: 'EKH-011' },
  { id: 'p12', name: 'Lemon Tea', category: 'non-kopi', price: 10000, stock: 0, minStock: 10, active: true, sku: 'LMT-012' },
];

export const RECENT_TRANSACTIONS = [
  { id: 'TRX-8821', time: '14:32', customer: 'Umum', items: 3, total: 53000, method: 'QRIS', status: 'lunas' },
  { id: 'TRX-8820', time: '14:18', customer: 'Budi Santoso', items: 2, total: 38000, method: 'Tunai', status: 'lunas' },
  { id: 'TRX-8819', time: '13:57', customer: 'Umum', items: 5, total: 112000, method: 'Debit', status: 'lunas' },
  { id: 'TRX-8818', time: '13:40', customer: 'Umum', items: 1, total: 15000, method: 'QRIS', status: 'batal' },
  { id: 'TRX-8817', time: '13:22', customer: 'Rina Amelia', items: 4, total: 76000, method: 'Tunai', status: 'lunas' },
];

export const TOP_PRODUCTS = [
  { name: 'Kopi Susu Gula Aren', sold: 128, revenue: 2304000 },
  { name: 'Es Teh Manis', sold: 96, revenue: 768000 },
  { name: 'Nasi Goreng Spesial', sold: 54, revenue: 1350000 },
  { name: 'Croffle Original', sold: 47, revenue: 893000 },
];

export const LOW_STOCK = PRODUCTS.filter((p) => p.stock <= p.minStock);

export const SALES_TREND = [
  { day: 'Sen', value: 1120000 },
  { day: 'Sel', value: 980000 },
  { day: 'Rab', value: 1340000 },
  { day: 'Kam', value: 1560000 },
  { day: 'Jum', value: 1890000 },
  { day: 'Sab', value: 2210000 },
  { day: 'Min', value: 1750000 },
];
