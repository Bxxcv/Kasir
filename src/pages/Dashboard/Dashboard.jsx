import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import {
  RECENT_TRANSACTIONS,
  TOP_PRODUCTS,
  LOW_STOCK,
  SALES_TREND,
} from '../../data/mockData';
import { formatRupiah } from '../../hooks/format';
import './Dashboard.css';

const KPI = [
  { label: 'Pendapatan Hari Ini', value: 3612000, icon: 'bi-wallet2', tone: 'brass', delta: '+12.4%' },
  { label: 'Transaksi Masuk', value: 47, icon: 'bi-receipt', tone: 'info', delta: '+5', isCount: true },
  { label: 'Laba Kotor', value: 1284000, icon: 'bi-graph-up-arrow', tone: 'success', delta: '+8.1%' },
  { label: 'Rata-rata / Transaksi', value: 76851, icon: 'bi-calculator', tone: 'ink', delta: '-2.3%', down: true },
];

const maxTrend = Math.max(...SALES_TREND.map((d) => d.value));

export default function Dashboard() {
  return (
    <div className="dash">
      {/* KPI row */}
      <div className="dash__kpis">
        {KPI.map((k) => (
          <div className={`kpi kpi--${k.tone}`} key={k.label}>
            <div className="kpi__top">
              <span className="kpi__icon"><i className={`bi ${k.icon}`} /></span>
              <span className={`kpi__delta ${k.down ? 'kpi__delta--down' : ''}`}>
                <i className={`bi ${k.down ? 'bi-arrow-down-right' : 'bi-arrow-up-right'}`} />
                {k.delta}
              </span>
            </div>
            <div className="kpi__value num">{k.isCount ? k.value : formatRupiah(k.value)}</div>
            <div className="kpi__label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="dash__grid">
        {/* Tren penjualan */}
        <section className="panel dash__trend">
          <div className="panel__head">
            <div>
              <h3>Tren Penjualan 7 Hari</h3>
              <p>Jam tersibuk: <strong>12.00 – 13.30</strong> &amp; <strong>18.00 – 19.30</strong></p>
            </div>
            <Badge tone="info">Minggu ini</Badge>
          </div>
          <div className="trend-chart">
            {SALES_TREND.map((d) => (
              <div className="trend-chart__col" key={d.day}>
                <span className="trend-chart__value num">{(d.value / 1000).toFixed(0)}rb</span>
                <div className="trend-chart__bar-track">
                  <div
                    className={`trend-chart__bar ${d.value === maxTrend ? 'trend-chart__bar--peak' : ''}`}
                    style={{ height: `${(d.value / maxTrend) * 100}%` }}
                  />
                </div>
                <span className="trend-chart__day">{d.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stok menipis */}
        <section className="panel dash__lowstock">
          <div className="panel__head">
            <h3>Stok Menipis</h3>
            <Badge tone="danger">{LOW_STOCK.length} item</Badge>
          </div>
          {LOW_STOCK.length === 0 ? (
            <EmptyState icon="bi-check2-circle" title="Stok aman" description="Tidak ada produk di bawah batas minimum." />
          ) : (
            <ul className="lowstock-list">
              {LOW_STOCK.map((p) => (
                <li key={p.id} className="lowstock-item">
                  <div>
                    <strong>{p.name}</strong>
                    <span>Min. stok {p.minStock}</span>
                  </div>
                  <Badge tone={p.stock === 0 ? 'danger' : 'warning'} stamp>
                    {p.stock === 0 ? 'Habis' : `Sisa ${p.stock}`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Produk terlaris */}
        <section className="panel dash__top-products">
          <div className="panel__head">
            <h3>Produk Terlaris</h3>
            <span className="panel__link">Lihat semua</span>
          </div>
          <ul className="top-list">
            {TOP_PRODUCTS.map((p, idx) => (
              <li key={p.name} className="top-item">
                <span className="top-item__rank">{idx + 1}</span>
                <div className="top-item__body">
                  <strong>{p.name}</strong>
                  <span>{p.sold} terjual</span>
                </div>
                <span className="top-item__revenue num">{formatRupiah(p.revenue)}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Transaksi terbaru */}
        <section className="panel dash__recent">
          <div className="panel__head">
            <h3>Transaksi Terbaru</h3>
            <span className="panel__link">Riwayat lengkap</span>
          </div>
          <div className="recent-table">
            <div className="recent-table__head">
              <span>ID</span><span>Pelanggan</span><span>Item</span><span>Metode</span><span>Total</span><span>Status</span>
            </div>
            {RECENT_TRANSACTIONS.map((t) => (
              <div className="recent-table__row" key={t.id}>
                <span className="num">{t.id}</span>
                <span>{t.customer}</span>
                <span>{t.items}x</span>
                <span>{t.method}</span>
                <span className="num">{formatRupiah(t.total)}</span>
                <span>
                  <Badge tone={t.status === 'lunas' ? 'success' : 'danger'} stamp>
                    {t.status === 'lunas' ? 'Lunas' : 'Batal'}
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
