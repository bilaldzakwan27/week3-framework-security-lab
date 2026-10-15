# Hands-On Pertemuan 3 - Framework Security Update Lab

TI215 Keamanan Aplikasi Web, Institut Teknologi Tangerang Selatan.

| Identitas | Keterangan |
|---|---|
| Nama | Muhammad Bilal Dzakwan Razin , Arif Hilman Khalis |
| NIM | 1002250037 , 1002250019 |
| Tanggal | 14 Oktober 2026 |

Source starter berasal dari dosen. Repository memuat perbandingan baseline/secure, checklist SAST manual, dependency advisory triage, rekomendasi, dan evidence pengujian handler.

## Isi repository

- `app-baseline.js`, `app-secure.js`, `tools/header_check.js`, `package.json`, dan `advisory-sample.json`: starter asli, tidak diubah.
- `security-checklist.md`: worksheet yang telah diisi berdasarkan analisis kode dan pengujian handler.
- `laporan-hands-on.md`: laporan mengikuti format laporan singkat dan pertanyaan Lampiran A pada panduan hands-on.
- `tests/handler-check.js`: reproducer evidence tanpa membuka port.
- `evidence/handler-results.txt`: output aktual reproducer; bukan output curl atau screenshot browser.
- `evidence/README.md`: status bukti dan perintah pengambilan evidence HTTP/browser yang masih diperlukan.

## Menjalankan aplikasi

Gunakan Node.js yang mendukung `String.prototype.replaceAll`. Versi yang digunakan untuk uji handler: Node.js v18.19.1. Kedua server memakai port 3000, sehingga jalankan bergantian. Modul aplikasi memakai `http` dan `url` bawaan Node.js; npm install tidak diperlukan untuk menjalankan starter.

```bash
node app-baseline.js
```

Pada terminal kedua:

```bash
curl -i http://localhost:3000/
node tools/header_check.js http://localhost:3000/
curl -sG --data-urlencode 'q=<script>alert(1)</script>' http://localhost:3000/
```

Hentikan baseline dengan Ctrl+C, lalu:

```bash
node app-secure.js
```

Ulangi perintah terminal kedua dan uji `/profile?name=...` serta respons 404.

## Reproduksi pengujian handler

```bash
node tests/handler-check.js
```

Hasil: 40 assertions lolos. Baseline memantulkan markup mentah; secure melakukan escaping pada `q` dan `name` serta menerapkan empat header yang diperiksa pada halaman 200. Respons 404 secure belum mendapat header tersebut.

## Dependency review

```bash
cat advisory-sample.json
```

Analisis menggunakan sampel offline dan advisory resmi. Jika registry tersedia, ambil audit awal sebelum mengubah dependency:

```bash
npm install
npm audit --audit-level=high
npm ls --depth=0
```

## Status evidence

Pengujian handler dan review kode selesai. Server HTTP, screenshot browser, dan npm audit belum diverifikasi dari sesi pengerjaan ini. Jangan menyebut evidence handler sebagai output curl. Lengkapi NIM, kelas, dan bukti HTTP/browser sebelum pengumpulan final.

## Penggunaan AI dan sumber

ChatGPT/Codex membantu membaca panduan, review kode, menguji handler, menelusuri advisory, serta menyusun checklist dan laporan. Mahasiswa perlu meninjau hasil dan menjalankan observasi browser/HTTP. Panduan: Hands-On Pertemuan 3 dan materi Pertemuan 03 ITTS 2026/2027. Link advisory tersedia di laporan.
