import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/ui/Toast';
import { formatRupiah } from '../../hooks/format';
import './PaymentModal.css';

const METHODS = [
  { id: 'tunai', label: 'Tunai', icon: 'bi-cash-stack' },
  { id: 'qris', label: 'QRIS', icon: 'bi-qr-code' },
  { id: 'debit', label: 'Debit', icon: 'bi-credit-card' },
  { id: 'transfer', label: 'Transfer', icon: 'bi-bank' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'bi-wallet2' },
];

const QUICK_CASH = [0, 5000, 10000, 20000, 50000, 100000];

export default function PaymentModal({ open, onClose }) {
  const { items, grandTotal, note, clearCart } = useCart();
  const { push } = useToast();
  const [method, setMethod] = useState('tunai');
  const [splitMode, setSplitMode] = useState(false);
  const [cashInput, setCashInput] = useState('');
  const [secondMethod, setSecondMethod] = useState('qris');
  const [splitAmount, setSplitAmount] = useState('');
  const [stage, setStage] = useState('pay'); // pay | success

  const cash = Number(cashInput) || 0;
  const change = Math.max(0, cash - grandTotal);
  const remaining = splitMode ? Math.max(0, grandTotal - (Number(splitAmount) || 0)) : 0;

  const canConfirm = method === 'tunai' ? cash >= grandTotal : true;

  const reset = () => {
    setMethod('tunai');
    setSplitMode(false);
    setCashInput('');
    setSplitAmount('');
    setStage('pay');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    setStage('success');
  };

  const handleFinish = () => {
    push('Transaksi berhasil disimpan', 'success');
    clearCart();
    handleClose();
  };

  if (stage === 'success') {
    return (
      <Modal open={open} onClose={handleClose} size="sm" title="Pembayaran Berhasil">
        <div className="receipt-success">
          <div className="receipt-success__icon"><i className="bi bi-check-lg" /></div>
          <h4>Transaksi Selesai</h4>
          <p>Total <strong className="num">{formatRupiah(grandTotal)}</strong> telah diterima via {METHODS.find(m=>m.id===method)?.label}</p>

          {method === 'tunai' && change > 0 && (
            <div className="receipt-success__change">
              <span>Kembalian</span>
              <strong className="num">{formatRupiah(change)}</strong>
            </div>
          )}

          <div className="receipt-mini">
            <div className="receipt-mini__perf" />
            {items.map(({ product, qty }) => (
              <div className="receipt-mini__row" key={product.id}>
                <span>{qty}x {product.name}</span>
                <span className="num">{formatRupiah(product.price * qty)}</span>
              </div>
            ))}
            <div className="receipt-mini__row receipt-mini__row--total">
              <span>Total</span>
              <span className="num">{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          <div className="receipt-success__actions">
            <Button variant="secondary" icon="bi-printer" fullWidth>Cetak Struk</Button>
            <Button fullWidth onClick={handleFinish}>Transaksi Baru</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="md"
      title="Pembayaran"
      subtitle={`${items.length} produk · Total tagihan ${formatRupiah(grandTotal)}`}
    >
      <div className="payment">
        <div className="payment__total">
          <span>Total Tagihan</span>
          <strong className="num">{formatRupiah(grandTotal)}</strong>
        </div>

        <div className="payment__methods">
          {METHODS.map((m) => (
            <button
              key={m.id}
              className={`payment__method ${method === m.id ? 'payment__method--active' : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <i className={`bi ${m.icon}`} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {method === 'tunai' && (
          <div className="payment__cash">
            <label className="payment__cash-label">Uang Diterima</label>
            <div className="payment__cash-input">
              <span>Rp</span>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={cashInput}
                onChange={(e) => setCashInput(e.target.value)}
                autoFocus
              />
            </div>
            <div className="payment__quick">
              {QUICK_CASH.map((v) => (
                <button key={v} onClick={() => setCashInput(String(v === 0 ? grandTotal : cash + v))}>
                  {v === 0 ? 'Uang Pas' : `+${v / 1000}rb`}
                </button>
              ))}
            </div>
            <div className={`payment__change ${change > 0 ? 'payment__change--positive' : ''}`}>
              <span>Kembalian</span>
              <strong className="num">{formatRupiah(change)}</strong>
            </div>
          </div>
        )}

        {method !== 'tunai' && (
          <div className="payment__nontunai">
            <i className="bi bi-info-circle" />
            <span>Pastikan pembayaran {METHODS.find((m) => m.id === method)?.label} sudah dikonfirmasi diterima sebelum lanjut.</span>
          </div>
        )}

        <button className="payment__split-toggle" onClick={() => setSplitMode((s) => !s)}>
          <i className={`bi ${splitMode ? 'bi-check-square-fill' : 'bi-square'}`} />
          Split payment (bagi 2 metode pembayaran)
        </button>

        {splitMode && (
          <div className="payment__split">
            <div className="payment__split-row">
              <Badge tone="neutral">Metode 1: {METHODS.find(m=>m.id===method)?.label}</Badge>
              <div className="payment__cash-input payment__cash-input--sm">
                <span>Rp</span>
                <input
                  type="number"
                  placeholder="0"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="payment__split-row">
              <select value={secondMethod} onChange={(e) => setSecondMethod(e.target.value)}>
                {METHODS.filter((m) => m.id !== method).map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <div className="payment__cash-input payment__cash-input--sm payment__cash-input--readonly">
                <span>Rp</span>
                <input value={remaining.toLocaleString('id-ID')} readOnly />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="modal__footer" style={{ marginTop: 'var(--sp-5)' }}>
        <Button variant="ghost" onClick={handleClose}>Batal</Button>
        <Button disabled={!canConfirm} onClick={handleConfirm} icon="bi-check-circle-fill">
          Konfirmasi Pembayaran
        </Button>
      </div>
    </Modal>
  );
}
