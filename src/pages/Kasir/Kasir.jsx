import { useMemo, useState } from 'react';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import PaymentModal from './PaymentModal';
import HoldOrdersModal from './HoldOrdersModal';
import { formatRupiah } from '../../hooks/format';
import './Kasir.css';

export default function Kasir() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('semua');
  const [payOpen, setPayOpen] = useState(false);
  const [holdListOpen, setHoldListOpen] = useState(false);
  const { push } = useToast();

  const {
    items, addItem, updateQty, removeItem, clearCart,
    orderDiscount, setOrderDiscount, note, setNote,
    subtotal, totalQty, grandTotal, holdOrder, heldOrders,
  } = useCart();

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCat = category === 'semua' || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [search, category]);

  const handleHold = () => {
    holdOrder();
    push('Pesanan ditahan (hold order)', 'info');
  };

  return (
    <div className="pos">
      {/* ---- Panel produk ---- */}
      <div className="pos__products">
        <div className="pos__searchbar">
          <div className="pos__search">
            <i className="bi bi-search" />
            <input
              placeholder="Cari produk atau scan SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <button className="pos__hold-btn" onClick={() => setHoldListOpen(true)}>
            <i className="bi bi-pause-circle" />
            Ditahan
            {heldOrders.length > 0 && <span className="pos__hold-count">{heldOrders.length}</span>}
          </button>
        </div>

        <div className="pos__categories">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`pos__cat-chip ${category === c.id ? 'pos__cat-chip--active' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="bi-search"
            title="Produk tidak ditemukan"
            description="Coba kata kunci lain atau pilih kategori berbeda."
          />
        ) : (
          <div className="pos__grid">
            {filtered.map((p) => {
              const isOut = p.stock === 0;
              return (
                <button
                  key={p.id}
                  className={`product-card ${isOut ? 'product-card--out' : ''}`}
                  onClick={() => !isOut && addItem(p)}
                  disabled={isOut}
                >
                  {p.stock <= p.minStock && !isOut && (
                    <span className="product-card__flag">Tipis</span>
                  )}
                  {isOut && <span className="product-card__flag product-card__flag--out">Habis</span>}
                  <div className="product-card__thumb">
                    <i className="bi bi-cup-hot-fill" />
                  </div>
                  <div className="product-card__name">{p.name}</div>
                  <div className="product-card__price num">{formatRupiah(p.price)}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- Panel keranjang / struk ---- */}
      <aside className="pos__cart">
        <div className="cart-panel">
          <div className="cart-panel__header">
            <div>
              <h3>Transaksi Berjalan</h3>
              <span>{totalQty} item</span>
            </div>
            {items.length > 0 && (
              <button className="cart-panel__clear" onClick={clearCart} title="Kosongkan keranjang">
                <i className="bi bi-trash3" />
              </button>
            )}
          </div>

          <div className="cart-panel__body">
            {items.length === 0 ? (
              <EmptyState
                icon="bi-cart3"
                title="Keranjang kosong"
                description="Ketuk produk di sebelah kiri untuk mulai transaksi."
              />
            ) : (
              <ul className="cart-list">
                {items.map(({ product, qty, discount }) => (
                  <li key={product.id} className="cart-item">
                    <div className="cart-item__info">
                      <strong>{product.name}</strong>
                      <span className="num">{formatRupiah(product.price)} / pcs</span>
                    </div>
                    <div className="cart-item__controls">
                      <button onClick={() => updateQty(product.id, qty - 1)} aria-label="Kurangi">
                        <i className="bi bi-dash" />
                      </button>
                      <span className="num">{qty}</span>
                      <button onClick={() => updateQty(product.id, qty + 1)} aria-label="Tambah">
                        <i className="bi bi-plus" />
                      </button>
                    </div>
                    <div className="cart-item__end">
                      <span className="num">{formatRupiah(product.price * qty - discount)}</span>
                      <button className="cart-item__remove" onClick={() => removeItem(product.id)} aria-label="Hapus">
                        <i className="bi bi-x" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="cart-panel__footer">
              <div className="cart-note">
                <i className="bi bi-pencil" />
                <input
                  placeholder="Catatan transaksi (opsional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="cart-summary">
                <div className="cart-summary__row">
                  <span>Subtotal</span>
                  <span className="num">{formatRupiah(subtotal)}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Diskon transaksi</span>
                  <div className="cart-summary__discount">
                    <span>Rp</span>
                    <input
                      type="number"
                      min="0"
                      value={orderDiscount || ''}
                      placeholder="0"
                      onChange={(e) => setOrderDiscount(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="cart-summary__row cart-summary__row--total">
                  <span>Total Bayar</span>
                  <span className="num">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <Button variant="secondary" icon="bi-pause-circle" onClick={handleHold}>
                  Tahan
                </Button>
                <Button size="lg" onClick={() => setPayOpen(true)} icon="bi-arrow-right-circle-fill">
                  Bayar {formatRupiah(grandTotal)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      <PaymentModal open={payOpen} onClose={() => setPayOpen(false)} />
      <HoldOrdersModal open={holdListOpen} onClose={() => setHoldListOpen(false)} />
    </div>
  );
}
