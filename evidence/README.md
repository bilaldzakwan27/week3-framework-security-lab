# Status evidence

`handler-results.txt` merupakan output aktual pengujian pada 14 Oktober 2026. HTTP transport dimock; fungsi handler berasal langsung dari source starter. Hasil ini memverifikasi konstruksi respons, bukan koneksi HTTP, eksekusi JavaScript browser, atau enforcement CSP.

## Evidence yang masih harus diambil

1. Screenshot terminal baseline berjalan di localhost:3000 (Evidence 0).
2. Output curl dan header checker untuk baseline (Evidence 1).
3. Screenshot browser atau response HTML dari pengujian payload kedua versi (Evidence 2).
4. Output curl dan header checker untuk secure; worksheet SAST ada di `security-checklist.md` (Evidence 3).
5. Dependency triage tersedia dalam worksheet (Evidence 4); npm audit bersifat opsional sesuai panduan.

Saat baseline berjalan, jalankan dari root repository:

```bash
curl -i http://localhost:3000/ > evidence/baseline-http.txt
node tools/header_check.js http://localhost:3000/ > evidence/baseline-headers.txt
curl -sG --data-urlencode 'q=<script>alert(1)</script>' http://localhost:3000/ > evidence/baseline-payload.html
curl -sG --data-urlencode 'name=<b>halo</b>' http://localhost:3000/profile > evidence/baseline-profile.html
```

Hentikan baseline dan jalankan secure sebelum mengambil:

```bash
curl -i http://localhost:3000/ > evidence/secure-http.txt
node tools/header_check.js http://localhost:3000/ > evidence/secure-headers.txt
curl -sG --data-urlencode 'q=<script>alert(1)</script>' http://localhost:3000/ > evidence/secure-payload.html
curl -sG --data-urlencode 'name=<b>halo</b>' http://localhost:3000/profile > evidence/secure-profile.html
curl -i http://localhost:3000/tidak-ada > evidence/secure-404.txt
```

Untuk browser, gunakan URL lokal berikut pada masing-masing versi dan simpan hasil screenshot aktual:

```text
http://localhost:3000/?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E
http://localhost:3000/?q=%3Cb%3Ehalo%3C%2Fb%3E
```
