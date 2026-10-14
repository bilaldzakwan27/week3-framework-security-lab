# Week 3 Framework Security Checklist

Nama: Muhammad Bilal Dzakwan Razin. NIM: belum diisi. Kelas: belum dikonfirmasi. Tanggal: 14 Oktober 2026.

## Header evidence

- Baseline command: `node app-baseline.js`; pada terminal lain, `curl -i http://localhost:3000/` dan `node tools/header_check.js http://localhost:3000/`.
- Baseline missing headers: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- Secure command: hentikan baseline, `node app-secure.js`; ulangi curl dan checker.
- Secure headers present pada handler route 200: CSP `default-src 'self'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'; form-action 'self'`; X-Frame-Options DENY; X-Content-Type-Options nosniff; Referrer-Policy no-referrer. Permissions-Policy juga tersedia.
- Evidence aktual: `evidence/handler-results.txt` menggunakan transport yang dimock. Output HTTP langsung belum diambil. Respons 404 secure tidak menerapkan header di atas.

## Rendering / escaping evidence

- Payload used: `<script>alert(1)</script>`, `<b>halo</b>`, serta karakter `& < > " '`.
- Baseline result: payload tetap menjadi markup mentah pada HTML Search dan Nama; berpotensi reflected XSS/HTML injection.
- Secure result: output menjadi entities, misalnya `&lt;script&gt;alert(1)&lt;/script&gt;`; perlindungan berlaku pada q dan name.
- Hasil membuktikan konstruksi HTML dari handler. Popup alert, tampilan bold, dan enforcement CSP di browser belum diamati.

## SAST manual review

| File | Source | Sink | Control found | Control missing | Recommendation |
|---|---|---|---|---|---|
| app-baseline.js / | query q, baris 24 | interpolasi HTML lalu res.end, baris 29 | Content-Type dan charset | output escaping, secure headers | Escape q sesuai konteks atau gunakan template auto-escaping; terapkan header |
| app-baseline.js /profile | query name, baris 34 | interpolasi HTML lalu res.end, baris 36 | Content-Type dan charset | output escaping, secure headers | Escape name dan uji route profile |
| app-secure.js / dan /profile | q/name, baris 44 dan 53 | escapeHtml lalu res.end, baris 48 dan 55 | escaping, CSP, frame protection, nosniff, referrer policy | tidak ada kontrol yang hilang pada pola output HTML yang diuji; batasan konteks tetap perlu diperhatikan | Pertahankan kontrol; jangan masukkan body mentah baru tanpa escaping |
| app-secure.js 404 | pathname yang tidak dikenal | res.end('not found'), baris 60 | Content-Type text/plain | secure headers pada respons ini | Terapkan kebijakan header secara konsisten tanpa mengubah Content-Type error |

Tidak ditemukan query SQL, session, eval, Function, innerHTML, atau route admin pada kedua aplikasi. Tidak menyimpulkan SQL injection/session hijacking/broken access control dari fitur yang tidak ada.

## Dependency advisory triage

| Package | Installed version | Severity | Impact | Fix | Priority | Evidence/source |
|---|---|---|---|---|---|---|
| lodash | 4.17.11 menurut sampel dan manifest; instalasi belum diverifikasi | high | Prototype pollution/command injection pada fungsi tertentu; Lodash tidak diimpor kedua handler | Hapus jika tidak digunakan; jika diperlukan pertimbangkan 4.18.1 lalu audit/regression test | Setelah celah rendering; meningkat jika fungsi rentan menerima input user | advisory-sample.json; package.json; CVE-2020-8203; CVE-2021-23337; changelog resmi |
| example-old-template-engine | 1.0.0 dalam sampel; tidak ada pada manifest | medium (sampel) | Potensi XSS bila auto-escaping dimatikan | Aktifkan auto-escaping/update jika benar-benar digunakan | Contoh latihan, bukan dependency aktual aplikasi | advisory-sample.json |

Express ^4.18.2 dan Helmet ^7.0.0 juga tercantum tetapi tidak digunakan. Tanpa lockfile/install/audit, tidak mengklaim versi resolved atau status keamanan seluruh dependency tree. Nomor versi deklarasi bukan bukti versi terpasang.

Referensi resmi:

- https://github.com/advisories/GHSA-p6mc-m468-83gw
- https://github.com/advisories/GHSA-35jh-r3h4-6jhm
- https://github.com/lodash/lodash/wiki/Changelog

## Reflection

1. What did the framework/middleware help automate? Framework/template dapat membantu auto-escaping; middleware dapat menerapkan secure headers pada banyak route secara konsisten. Pada starter ini kontrol dibuat manual, bukan melalui Express/Helmet.
2. What still needs developer judgment? Menentukan konteks output, kebutuhan authorization, konfigurasi CSP, reachability dependency, prioritas remediation, dan validasi setelah patch.
3. Which control would you implement first in a real production app, and why? Untuk alur yang ditunjukkan lab, perbaiki rendering input terlebih dahulu karena source-to-sink langsung menerima input tidak tepercaya. Prioritas aplikasi produksi tetap mempertimbangkan data, exposure, dan fitur autentikasi yang sebenarnya.

## Kuis singkat

- SAST: analisis source code tanpa menjalankan aplikasi. DAST: pengujian respons/perilaku aplikasi yang sedang berjalan. SCA: analisis dependency dan advisory terkait.
- Dua kontrol framework modern: auto-escaping dan proteksi CSRF.
- Advisory dibaca sebelum upgrade untuk mengetahui versi terdampak, kondisi eksploitasi, patch, serta perubahan yang perlu diuji.
- Bukti minimal header aktif: respons HTTP aktual melalui curl atau DevTools Network menampilkan header beserta nilainya; checker hanya memastikan kehadiran, bukan kelengkapan keamanan kebijakan.
- Framework aman tidak menjamin aplikasi aman karena konfigurasi, business logic, authorization, API berbahaya, dan pembaruan dependency masih menjadi tanggung jawab developer.

## Exit ticket - perlu diisi berdasarkan refleksi mahasiswa

- Hal yang sudah dipahami: belum diisi mahasiswa.
- Hal yang masih membingungkan: belum diisi mahasiswa.
- Kontrol yang ingin diperdalam: belum diisi mahasiswa.
