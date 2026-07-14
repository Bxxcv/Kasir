export function formatRupiah(value) {
  return 'Rp' + Math.round(value).toLocaleString('id-ID');
}
