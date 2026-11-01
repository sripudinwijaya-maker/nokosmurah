# SMSBower Personal Client — Static Vercel layout

Struktur root:
- `api/smsbower.js` — Vercel serverless API proxy
- `app/style.css` dan `app/script.js` — aset frontend
- `index.html` — halaman utama root
- `vercel.json` — konfigurasi fungsi API

## Deploy GitHub → Vercel
1. Upload seluruh isi folder ini ke root repository GitHub (jangan upload folder induknya sebagai subfolder).
2. Import repository di Vercel. Framework preset pilih **Other**.
3. Build Command: kosongkan / Override off. Output Directory: `.` atau default. Jangan isi Root Directory dengan `app`.
4. Project Settings → Environment Variables:
   - `SMSBOWER_API_KEY` = API key SMSBower
5. Deploy ulang.

Buka domain Vercel. `index.html` harus tampil di root dan endpoint proxy berada di `/api/smsbower`.

API key tidak pernah ditaruh di HTML atau JavaScript frontend. Jika key pernah terekspos, regenerasi key dari akun SMSBower.
