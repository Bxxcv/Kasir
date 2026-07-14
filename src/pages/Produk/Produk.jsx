import { useMemo, useState } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES } from '../../data/mockData';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import ProductFormModal from './ProductFormModal';
import { useToast } from '../../components/ui/Toast';
import { formatRupiah } from '../../hooks/format';
import './Produk.css';

export default function Produk() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { push } = useToast();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat = category === 'semua' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'semua' || (statusFilter === 'aktif' ? p.active : !p.active);
      return matchCat && matchSearch && matchStatus;
    });
  }, [products, search, category, statusFilter]);

  const openAdd = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p) => { setEditing(p); setFormOpen(true); };

  const handleSave = (data) => {
    if (editing) {
      setProducts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
      push('Produk berhasil diperbarui', 'success');
    } else {
      setProducts((prev) => [{ ...data, id: `p${Date.now()}` }, ...prev]);
      push('Produk baru berhasil ditambahkan', 'success');
    }
    setFormOpen(false);
  };

  const toggleActive = (id) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  return (
    <div className="produk">
      <div className="produk__toolbar">
        <div className="produk__filters">
          <Input
            icon="bi-search"
            placeholder="Cari nama produk atau SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="produk__select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <select className="produk__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>
        <Button icon="bi-plus-lg" onClick={openAdd}>Tambah Produk</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="Belum ada produk"
          description="Tambahkan produk pertama untuk mulai berjualan."
          action={<Button icon="bi-plus-lg" onClick={openAdd}>Tambah Produk</Button>}
        />
      ) : (
        <div className="produk-table">
          <div className="produk-table__head">
            <span>Produk</span><span>Kategori</span><span>Harga Jual</span><span>Stok</span><span>Status</span><span></span>
          </div>
          {filtered.map((p) => (
            <div className="produk-table__row" key={p.id}>
              <div className="produk-table__product">
                <div className="produk-table__thumb"><i className="bi bi-box-seam-fill" /></div>
                <div>
                  <strong>{p.name}</strong>
                  <span className="num">{p.sku}</span>
                </div>
              </div>
              <span className="produk-table__cat">{CATEGORIES.find((c) => c.id === p.category)?.label}</span>
              <span className="num">{formatRupiah(p.price)}</span>
              <span>
                {p.stock === 0 ? (
                  <Badge tone="danger" stamp>Habis</Badge>
                ) : p.stock <= p.minStock ? (
                  <Badge tone="warning">{p.stock} pcs</Badge>
                ) : (
                  <span className="num">{p.stock} pcs</span>
                )}
              </span>
              <button className={`produk-toggle ${p.active ? 'produk-toggle--on' : ''}`} onClick={() => toggleActive(p.id)}>
                <span className="produk-toggle__dot" />
              </button>
              <button className="produk-table__edit" onClick={() => openEdit(p)}>
                <i className="bi bi-pencil" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initial={editing}
      />
    </div>
  );
}
