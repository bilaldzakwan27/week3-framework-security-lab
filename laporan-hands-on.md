# Hands-On Pertemuan 3 - Framework Security Update Lab

**TI215 Keamanan Aplikasi Web - Institut Teknologi Tangerang Selatan**  
Nama: Muhammad Bilal Dzakwan Razin | NIM: **belum diisi** | Kelas: **belum dikonfirmasi**  
Tanggal praktikum: 14 Oktober 2026 | Tahun akademik: 2026/2027 Ganjil

## Ringkasan temuan

Baseline merender parameter `q` dan `name` tanpa escaping serta tidak menerapkan empat header keamanan yang diperiksa. Versi secure meng-escape kedua parameter dan menambahkan secure headers pada halaman `/` dan `/profile`. Respons 404 secure masih tanpa header keamanan. Lodash 4.17.11 tercantum dalam manifest, tetapi tidak digunakan oleh handler aplikasi. Review kode dan pengujian handler menghasilkan 40 pemeriksaan lolos. Koneksi HTTP, eksekusi browser, dan npm audit belum diuji dari sesi ini karena akses socket dibatasi; evidence handler tidak diklaim sebagai output curl.

## Jawaban template mahasiswa - Lampiran A

| Pertanyaan | Jawaban mahasiswa |
|---|---|
| Perbedaan baseline vs secure headers | Baseline hanya mengatur Content-Type. Secure menambahkan CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: no-referrer, dan Permissions-Policy pada respons halaman 200. |
| Payload rendering dan hasil observasi | Payload `<script>alert(1)</script>` dan `<b>halo</b>` masuk sebagai markup mentah pada baseline. Pada secure, tanda `<` dan `>` menjadi entities sehingga payload menjadi teks HTML yang aman pada konteks body. Perilaku tampilan browser masih perlu diamati langsung. |
| Source dan sink yang ditemukan | Source: `url.searchParams.get('q')` dan `.get('name')`. Sink: interpolasi parameter ke body HTML, kemudian `res.end(page(...))`. Secure menambahkan `escapeHtml()` sebelum interpolasi. |
| Dependency/advisory yang perlu diprioritaskan | Lodash 4.17.11 memiliki advisory high, tetapi belum reachable pada kode lab. Prioritaskan rendering yang langsung menerima input; tangani dependency sebelum digunakan dalam fitur baru. |
| Rekomendasi teknis utama | Terapkan escaping sesuai konteks, secure headers pada seluruh respons, dan hapus atau update dependency yang diperlukan berdasarkan advisory. |
| Cara validasi perbaikan | Ulangi payload pada kedua route, periksa header melalui curl/checker, uji respons 404, dan jalankan audit serta uji regresi setelah update dependency. |
| Refleksi akhir | Framework/middleware membantu konsistensi kontrol, tetapi developer tetap menentukan konteks escaping, konfigurasi, authorization, dan prioritas patch. Starter memakai Node HTTP; Express dan Helmet belum digunakan. |

## Evidence dan checklist SAST

Evidence aktual: `evidence/handler-results.txt`, direproduksi dengan `node tests/handler-check.js`. Transport dimock; source handler tidak diubah. Contoh hasil:

```html
<!-- Baseline -->
<p>Nama: <script>alert(1)</script></p>
<!-- Secure -->
<p>Nama: &lt;script&gt;alert(1)&lt;/script&gt;</p>
```

Header CSP secure dari handler:

```text
default-src 'self'; base-uri 'none'; frame-ancestors 'none';
object-src 'none'; form-action 'self'
```

| File / lokasi | Source | Sink | Kontrol ada / hilang |
|---|---|---|---|
| app-baseline.js, baris 24 dan 29 | q dari query | HTML Search melalui res.end | Content-Type ada; escaping dan secure headers hilang |
| app-baseline.js, baris 34 dan 36 | name dari query | HTML Nama melalui res.end | Content-Type ada; escaping dan secure headers hilang |
| app-secure.js, baris 44-55 | q dan name | HTML setelah escapeHtml | Escaping dan secure headers ada pada kedua route |
| app-secure.js, baris 59-60 | Path tidak dikenal | Respons 404 | Content-Type ada; secure headers belum diterapkan |

Tidak ditemukan SQL, session, eval, atau innerHTML pada kedua aplikasi. Missing header merupakan kelemahan konfigurasi, bukan otomatis bukti eksploit. Escaping saat ini sesuai output HTML body; konteks JavaScript atau URL memerlukan perlindungan berbeda.

## Dependency advisory triage

Sumber awal: `advisory-sample.json` (offline training sample), bukan hasil npm audit atau bukti package terpasang.

| Package / versi | Severity | Impact dan reachability | Fix / prioritas |
|---|---|---|---|
| lodash / 4.17.11 di manifest | High menurut sampel/advisory | Prototype pollution dan command injection pada fungsi tertentu. Kedua handler tidak mengimpor Lodash; eksploit lewat fitur lab belum terbukti. | Hapus jika tidak perlu; jika diperlukan, kandidat update 4.18.1 lalu audit/regression test. Setelah perbaikan rendering; meningkat jika fungsi rentan reachable. |
| example-old-template-engine / 1.0.0 dalam sampel | Medium menurut sampel | Contoh potensi XSS ketika auto-escaping mati; tidak ada di manifest. | Contoh latihan, bukan dependency aktual. Jika dipakai, aktifkan auto-escaping dan update. |

Advisory resmi mendukung risiko pada versi lama [1][2]. Changelog mencatat patch tambahan pada 4.18.0 dan perbaikan bug 4.18.1 [3]. Patch minor tetap perlu diuji; kompatibilitas tidak diasumsikan hanya dari nomor versi.

## Rekomendasi berbasis bukti

| Prioritas | Tindakan dan bukti | Validasi |
|---|---|---|
| 1 | Escape seluruh output user; baseline menghasilkan tag script mentah pada kedua route. | Uji script, bold, dan karakter `& < > " '`; secure harus mengirim entities. |
| 2 | Sentralisasi secure headers; respons 404 secure belum terlindungi secara konsisten. | Periksa `/`, `/profile`, dan path 404 melalui curl/checker. |
| 3 | Hapus/update dependency; manifest mencantumkan Lodash rentan tanpa pemakaian. | Periksa dependency tree, audit, dan ulangi fungsi aplikasi setelah perubahan. |

## Evidence yang perlu dilengkapi sebelum pengumpulan

NIM dan kelas; screenshot startup baseline (Evidence 0); output curl/checker kedua versi (Evidence 1); screenshot atau respons HTML pengujian langsung (Evidence 2). Worksheet SAST dan triage sudah tersedia. Perintah pengambilan bukti ada di `evidence/README.md`. Tidak ada screenshot atau output audit yang dibuat-buat.

## Referensi

Panduan Hands-On Pertemuan 3, format laporan singkat dan Lampiran A; materi Pertemuan 03 ITTS 2026/2027; source starter dosen.

1. CVE-2020-8203: https://github.com/advisories/GHSA-p6mc-m468-83gw
2. CVE-2021-23337: https://github.com/advisories/GHSA-35jh-r3h4-6jhm
3. Changelog Lodash: https://github.com/lodash/lodash/wiki/Changelog

AI: ChatGPT/Codex membantu review, pengujian handler, penelusuran advisory, dan penyusunan dokumen. Hasil perlu ditinjau mahasiswa dan dilengkapi dengan observasi aktual.
