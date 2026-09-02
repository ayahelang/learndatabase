# Silverhawk LearnDatabase

Website pembelajaran **database gratisan** modern (Firebase, Supabase, MongoDB Atlas, Neon, PlanetScale, Turso, Appwrite, PocketBase, dll).

Bagian dari **[silverhawk.web.id](https://silverhawk.web.id)**.

---

## Fitur

- 🔒 **Sistem Voucher** — akses materi hanya dengan kode voucher
- 💳 Info pembayaran DANA & GoPay untuk beli voucher
- 📚 Materi lengkap: Perkenalan → Registrasi → Implementasi → Deploy
- 🧪 **Simulasi interaktif**: CRUD (localStorage), Query Builder, Schema Designer
- 💻 Code Playground dengan snippet siap salin
- 🛡️ Panel Admin (generate voucher, atur kadaluarsa, aktif/nonaktif, export JSON)
- 📱 Responsive, dark theme modern
- ⚡ Pure static — siap deploy ke **GitHub Pages** tanpa backend

---

## Struktur Folder

```
silverhawk-learndatabase/
├── index.html          # Halaman utama
├── css/
│   └── style.css
├── js/
│   ├── data.js         # Data materi database + snippet
│   └── app.js          # Logika aplikasi, voucher, admin, simulasi
├── assets/
│   └── logo.svg
├── data/               # (opsional) untuk ekspansi
└── README.md
```

---

## Cara Deploy ke GitHub Pages

1. Buat repository baru di GitHub (misal: `learndatabase` atau `silverhawk-learndatabase`).
2. Upload semua file di folder ini ke root repository (atau ke folder `/docs`).
3. Masuk **Settings → Pages**.
4. Source: **Deploy from a branch** → pilih branch `main` (atau `master`) → folder `/ (root)` atau `/docs`.
5. Simpan. Tunggu 1–2 menit, situs akan live di:
   `https://USERNAME.github.io/NAMA-REPO/`

Jika ingin subdomain / path di bawah silverhawk.web.id, atur custom domain atau reverse proxy sesuai setup utama kamu.

---

## Voucher & Admin

### Voucher Default (Demo)
Kode demo yang selalu valid (rahasia bersama):

```
D3m0
```

### Login Admin
- Buka bagian **Admin** di navigasi (setelah unlock voucher).
- Password default: `adminSH2026`

### Fitur Admin
- Generate voucher baru (bisa set prefix, masa kadaluarsa dalam hari, catatan)
- Aktifkan / nonaktifkan voucher
- Hapus voucher (kecuali demo)
- Export semua voucher ke file JSON

Data voucher disimpan di **localStorage browser**.  
Artinya setiap browser / device punya data voucher sendiri.  
Untuk produksi multi-device, lihat bagian “Database Opsional” di bawah.

---

## Pembayaran Voucher (ditampilkan di situs)

| Metode | Nomor |
|--------|-------|
| **DANA** | +62 851-5992-2358 |
| **GoPay** | +62 851-5882-2803 |

Alur yang disarankan:
1. Pengunjung transfer sesuai harga voucher yang kamu tentukan.
2. Pengunjung kirim bukti transfer ke WhatsApp admin.
3. Admin login → Generate voucher baru → kirim kodenya ke pembeli.

---

## Database Opsional (untuk produksi)

Situs ini **tidak wajib** database karena pakai localStorage.  
Jika kamu ingin voucher tersimpan terpusat (bisa diakses dari banyak device), pilih salah satu opsi berikut.

### Opsi A — Google Sheets + Apps Script (paling mudah & gratis)

1. Buat Google Spreadsheet baru, beri nama misalnya `Silverhawk Vouchers`.
2. Sheet1 berisi header di baris 1:
   ```
   code | created | expiry | note | active
   ```
3. Buka **Extensions → Apps Script**, tempel kode berikut:

```javascript
const SHEET_NAME = "Sheet1";

function doGet(e) {
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = r[i]);
    return obj;
  });

  if (action === "list") {
    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);
  }
  if (action === "check") {
    const code = (e.parameter.code || "").toUpperCase();
    const found = rows.find(r => String(r.code).toUpperCase() === code);
    return ContentService.createTextOutput(JSON.stringify(found || null))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(JSON.stringify({ error: "unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const body = JSON.parse(e.postData.contents);
  // body: { code, created, expiry, note, active }
  sheet.appendRow([
    body.code,
    body.created || new Date().toISOString(),
    body.expiry || "",
    body.note || "",
    body.active !== false
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy → **New deployment** → Type: **Web app**  
   - Execute as: Me  
   - Who has access: Anyone  
5. Salin URL Web App.  
6. Di `js/app.js`, kamu bisa ganti fungsi `loadVouchers` / `isVoucherValid` agar fetch ke URL tersebut (contoh sederhana bisa diminta lagi).

### Opsi B — Supabase (lebih profesional)

1. Buat project di [supabase.com](https://supabase.com).
2. Buat tabel `vouchers`:

```sql
create table vouchers (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  created timestamptz default now(),
  expiry timestamptz,
  note text,
  active boolean default true
);

-- Enable RLS, buat policy sesuai kebutuhan
alter table vouchers enable row level security;
```

3. Ambil Project URL + `anon` key.
4. Di frontend, pakai `@supabase/supabase-js` untuk query voucher (hanya select yang aktif).  
   Untuk generate voucher dari admin, sebaiknya pakai Edge Function atau service role di server (jangan expose service_role di frontend).

---

## Kustomisasi Cepat

| Yang ingin diubah | File / lokasi |
|-------------------|---------------|
| Password admin | `js/app.js` → konstanta `ADMIN_PASS` |
| Kode demo voucher | `js/data.js` → `DEMO_VOUCHER` |
| Nomor DANA / GoPay | `index.html` (bagian payment-cards) |
| Materi database baru | `js/data.js` → array `DATABASES` |
| Warna / tema | `css/style.css` → `:root` variables |

---

## Keamanan Catatan

- Password admin dan voucher disimpan di client (localStorage). Ini cukup untuk demo / skala kecil.
- Jangan taruh secret key database (service account, service_role, dll) di kode frontend yang di-host di GitHub Pages.
- Untuk production serius, pindahkan validasi voucher ke backend/API.

---

## Lisensi & Kredit

Dibuat untuk pembelajaran.  
© 2026 Silverhawk — [silverhawk.web.id](https://silverhawk.web.id)

---

**Selamat belajar database gratisan!**  
Gunakan kode `D3m0` untuk mencoba situs ini.
