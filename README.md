# Kasir Digital — Toko Berkah Jaya

Aplikasi kasir/POS untuk toko, café, resto, dan UMKM modern. Dibangun dengan React + Vite,
siap dikembangkan di Acode dan di-deploy ke Vercel/Netlify tanpa rombak arsitektur.

## Status build ini (MVP tahap 1)

Halaman yang **sudah jadi & fungsional**:
- **Login** — form PIN kasir, layout split-screen
- **Dashboard** — KPI hari ini, tren penjualan 7 hari, stok menipis, produk terlaris, transaksi terbaru
- **Kasir / POS** — search produk, kategori, keranjang, edit qty, diskon item/total, catatan,
  hold/resume order, split payment, hitung kembalian otomatis, struk sukses
- **Produk** — daftar, filter/cari, tambah/edit produk, toggle status aktif

Halaman **Stok, Pelanggan, Laporan, Karyawan, Pengaturan** sudah ada di routing & navigasi
(sidebar + bottom nav) sebagai placeholder — struktur, layout, dan pola desainnya sudah
konsisten, tinggal diisi mengikuti pola yang sama seperti halaman Produk/Dashboard.

## Sistem Desain — "Ledger & Ink"

Dipilih agar tidak terasa generik/template AI: terinspirasi dari **buku kas fisik** yang
biasa dipakai UMKM (sampul gelap, kertas nota) dan **laci kasir logam lama** (aksen kuningan).

- **Warna**: `--ink-900 #10241f` (gelap, sidebar/header), `--paper-0 #fbfaf6` (kertas nota),
  `--brass-500 #b1812f` (aksen kuningan/CTA). Semua token ada di `src/styles/tokens.css`.
- **Tipografi**: Space Grotesk (heading/display) + Inter (body) + JetBrains Mono (harga & angka,
  supaya rapi berjajar/tabular — kelas util `.num`).
- **Elemen signature**: tepi "robek" ala kertas struk di panel keranjang, badge bergaya
  "cap tinta" (`Badge stamp`) untuk status Lunas/Batal, panel keranjang selalu menampilkan
  info seperti nota fisik.
- Semua warna/spacing/radius pakai CSS custom properties — gampang diganti brand lain
  cukup dari `tokens.css`, tidak perlu sentuh komponen.

## Struktur folder

```
kasir-pos/
├── index.html                  # entry HTML, load font & Bootstrap Icons via CDN
├── src/
│   ├── main.jsx                 # entry point React
│   ├── App.jsx                  # routing (react-router-dom)
│   ├── styles/
│   │   ├── tokens.css           # design tokens (warna, tipografi, spacing, shadow)
│   │   └── global.css           # reset & base style
│   ├── components/
│   │   ├── layout/               # Sidebar, BottomNav, Topbar, AppLayout
│   │   └── ui/                   # Button, Input, Modal, Badge, Toast, EmptyState, Skeleton
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Kasir/                # Kasir.jsx, PaymentModal.jsx, HoldOrdersModal.jsx
│   │   └── Produk/                # Produk.jsx, ProductFormModal.jsx
│   ├── context/
│   │   ├── AppContext.jsx        # user/role, sidebar collapse
│   │   └── CartContext.jsx       # state keranjang transaksi kasir
│   ├── data/
│   │   ├── mockData.js           # data contoh (ganti dengan API/DB asli)
│   │   └── navConfig.js          # daftar menu navigasi + role akses
│   └── hooks/
│       └── format.js             # formatRupiah()
└── package.json
```

**Pola tiap halaman**: 1 folder di `src/pages/`, berisi `NamaHalaman.jsx` + `NamaHalaman.css`
(scoped per file, bukan 1 file CSS raksasa). Modal terkait sebuah halaman ditaruh di folder
yang sama (contoh: `PaymentModal.jsx` ada di dalam `pages/Kasir/`).

## Menjalankan di Acode / lokal

```bash
npm install
npm run dev       # dev server, buka di browser HP/laptop
npm run build     # build produksi ke folder dist/
```

Tidak ada dependency native/berat — hanya `react`, `react-dom`, `react-router-dom`.
Icon pakai Bootstrap Icons via CDN (bukan npm package) supaya bundle tetap ringan dan
gampang dibuka di editor mobile seperti Acode.

## Deploy

Project ini adalah Vite app standar — tinggal:
- **Vercel**: import repo, framework preset "Vite" otomatis terdeteksi
- **Netlify**: build command `npm run build`, publish directory `dist`

Tidak perlu konfigurasi tambahan.

## Melanjutkan ke fitur berikutnya

Prioritas MVP selanjutnya yang disarankan (lihat pola di `Produk.jsx` & `Dashboard.jsx`
sebagai referensi struktur):
1. **Stok** — mutasi stok masuk/keluar, histori, penyesuaian (bisa reuse pola tabel di Produk)
2. **Riwayat & Detail Transaksi** — reuse `RECENT_TRANSACTIONS` di `mockData.js`, buat halaman
   detail per transaksi + tombol cetak ulang struk (reuse styling `receipt-mini` dari PaymentModal)
3. **Laporan** — filter tanggal + reuse pola `trend-chart` dari Dashboard untuk grafik
4. **Pelanggan & Karyawan** — pola tabel sama seperti Produk, tinggal ganti kolom
5. **Pengaturan** — form-form sederhana, reuse komponen `Input`/`pf-select`

Saat semua data masih mock (`src/data/mockData.js`) — tinggal ganti dengan pemanggilan API/
Supabase/Firebase saat backend siap; struktur komponen tidak perlu berubah.
