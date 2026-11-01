# SMSBower Personal Client V3

## Deploy ke Vercel dari HP
1. Upload ZIP ini ke GitHub sebagai repository **Private** (atau ekstrak lalu push).
2. Di Vercel pilih **Add New → Project**, import repository tersebut.
3. Pada **Environment Variables**, tambahkan:
   - Name: `SMSBOWER_API_KEY`
   - Value: API key SMSBower milik Anda
4. Deploy. Setelah deploy, buka URL Vercel dari Android dan pilih **Add to Home screen** bila ingin seperti aplikasi.

## Jalankan lokal
Node.js 18+ diperlukan:
```bash
npm install
cp .env.example .env.local
# isi SMSBOWER_API_KEY di .env.local
npm run dev
```

## Yang sudah terhubung
- `getBalance`, `getServicesList`, `getCountries`
- `getPricesV3` untuk harga, stok dan provider aktual
- `getNumberV2` untuk pembelian nomor dan metadata aktivasi
- `getStatus` untuk cek SMS
- `setStatus` untuk minta SMS berikutnya, selesaikan, atau batalkan

## Catatan penting
- API key hanya dibaca server-side dari Environment Variables; tidak dikirim ke browser.
- Label Gold/Silver/Bronze tidak dibuat-buat: dokumentasi API publik tidak menjelaskan pemetaan level tersebut. Versi ini menampilkan provider ID, harga, dan stok yang benar-benar dikembalikan API. Provider dapat dipilih atau dibiarkan otomatis.
- Pembelian nomor memakai saldo akun dan dapat dikenai biaya. Gunakan hanya untuk verifikasi yang Anda berhak lakukan serta patuhi aturan layanan tujuan dan SMSBower.
- Jika API key pernah terlihat oleh orang lain, buat/regenerasi key baru di akun SMSBower.
- Endpoint resmi menurut dokumentasi: `https://smsbower.page/stubs/handler_api.php`.
