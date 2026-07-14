import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../hooks/format';
import './HoldOrdersModal.css';

export default function HoldOrdersModal({ open, onClose }) {
  const { heldOrders, resumeOrder } = useCart();

  const handleResume = (id) => {
    resumeOrder(id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" title="Pesanan Ditahan" subtitle="Lanjutkan transaksi yang sempat ditahan">
      {heldOrders.length === 0 ? (
        <EmptyState icon="bi-pause-circle" title="Belum ada pesanan ditahan" description="Pesanan yang ditahan akan muncul di sini." />
      ) : (
        <ul className="hold-list">
          {heldOrders.map((h) => {
            const total = h.items.reduce((s, i) => s + i.product.price * i.qty, 0) - h.orderDiscount;
            return (
              <li key={h.id} className="hold-item">
                <div className="hold-item__info">
                  <strong>{h.id}</strong>
                  <span>{h.items.length} produk · {new Date(h.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="hold-item__end">
                  <span className="num">{formatRupiah(total)}</span>
                  <Button size="sm" variant="secondary" onClick={() => handleResume(h.id)}>Lanjutkan</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
