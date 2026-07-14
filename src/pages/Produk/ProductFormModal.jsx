import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CATEGORIES } from '../../data/mockData';

const EMPTY = {
  name: '', category: 'kopi', sku: '', price: '', costPrice: '',
  stock: '', minStock: '', active: true,
};

export default function ProductFormModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(initial ? { ...initial } : EMPTY);
  }, [initial, open]);

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price) || 0,
      costPrice: Number(form.costPrice) || 0,
      stock: Number(form.stock) || 0,
      minStock: Number(form.minStock) || 0,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? 'Edit Produk' : 'Tambah Produk Baru'}
      subtitle={initial ? `Mengubah data ${initial.name}` : 'Lengkapi detail produk di bawah ini'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Batal</Button>
          <Button icon="bi-check-lg" onClick={handleSubmit}>Simpan Produk</Button>
        </>
      }
    >
      <form className="product-form" onSubmit={handleSubmit}>
        <div className="product-form__photo">
          <div className="product-form__photo-box">
            <i className="bi bi-camera-fill" />
            <span>Tambah Foto</span>
          </div>
          <p>JPG/PNG, maks 2MB. Foto membantu kasir mengenali produk lebih cepat.</p>
        </div>

        <div className="product-form__grid">
          <Input label="Nama Produk" placeholder="Contoh: Kopi Susu Gula Aren" value={form.name} onChange={set('name')} required />
          <Input label="SKU / Kode Produk" placeholder="KSG-001" value={form.sku} onChange={set('sku')} />

          <label className="pf-select">
            <span>Kategori</span>
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.filter((c) => c.id !== 'semua').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>
          <Input label="Varian (opsional)" placeholder="Contoh: Panas / Dingin" />

          <Input label="Harga Beli" type="number" placeholder="0" suffix="IDR" value={form.costPrice} onChange={set('costPrice')} />
          <Input label="Harga Jual" type="number" placeholder="0" suffix="IDR" value={form.price} onChange={set('price')} required />

          <Input label="Stok Awal" type="number" placeholder="0" value={form.stock} onChange={set('stock')} />
          <Input label="Stok Minimum" type="number" placeholder="0" hint="Notifikasi muncul saat stok mencapai batas ini" value={form.minStock} onChange={set('minStock')} />
        </div>

        <label className="product-form__active">
          <input type="checkbox" checked={form.active} onChange={set('active')} />
          <div>
            <strong>Produk Aktif</strong>
            <span>Produk nonaktif tidak akan tampil di halaman kasir</span>
          </div>
        </label>
      </form>
    </Modal>
  );
}
