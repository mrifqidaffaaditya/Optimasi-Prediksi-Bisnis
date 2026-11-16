# PRD: Web App Optimasi & Prediksi Bisnis

**Versi:** 1.1 · **Tanggal:** 16 November 2026 · **Status:** Draft untuk review
**Platform:** Web (client-side, tanpa login) · **Bahasa antarmuka:** Indonesia (v1)

---

## 1. Ringkasan
Aplikasi web untuk menentukan kombinasi produksi atau alokasi sumber daya yang paling menguntungkan, plus simulasi “bagaimana jika”. Prinsipnya: langsung pakai tanpa akun, nyaman di ponsel, tanpa notasi matematika, dan semua perhitungan berjalan di perangkat. AI bersifat opsional (bawa kunci sendiri).

## 2. Tujuan dan Metrik
- Rekomendasi pertama kurang dari 3 menit untuk pengguna baru, termasuk di ponsel.
- Pengisian lewat teks, angka, radio, dropdown, saklar, dan geser. Hanya impor yang memakai berkas.
- Hasil diperbarui di bawah 100 milidetik untuk model umum.
- Hasil siap dibawa ke rapat (gambar, CSV, Excel, PDF, PPTX, tautan).
- Data tetap di perangkat kecuali pengguna mengaktifkan AI.

| Metrik | Target |
|---|---|
| Waktu ke rekomendasi pertama (ponsel) | Maksimal 3 menit |
| Alur isi data sampai hasil selesai | Minimal 70% sesi |
| Selesai tanpa pindah ke laptop | Minimal 60% |
| Skor Lighthouse ponsel (kinerja / aksesibilitas) | Minimal 90 / 95 |
| Galat tak tertangani per 1.000 sesi | Di bawah 2 |

**Non-tujuan v1:** akun pengguna, penyimpanan server, aplikasi native, optimasi non-linear, integrasi ERP.

## 3. Persona
- **Pemilik UMKM:** ponsel, bahasa sehari-hari.
- **Staf perencanaan:** laptop, impor, skenario.
- **Mahasiswa/dosen:** grafik dan penjelasan.
- **Manajer:** membuka tautan di ponsel.

## 4. Alur Pengguna
1. Buka halaman, langsung ke beranda kerja: Mulai dari panduan, Pakai contoh kasus, Impor data.
2. Panduan 4 langkah: Tujuan, Produk, Sumber daya dan pemakaiannya, Periksa dan hitung.
3. Baca rekomendasi: kartu ringkasan dulu, grafik di bawahnya.
4. “Bagaimana jika”: geser kapasitas atau tombol cepat.
5. Simpan skenario, bandingkan, unduh, atau bagikan.

## 5. Kebutuhan Fungsional

### 5.1 Mengisi data (P0 kecuali disebut)
- Panduan 4 langkah sebagai tampilan utama, satu fokus per layar.
- Pemakaian ditulis sebagai kalimat: “Setiap [Roti Tawar] memakai [0,3] [kg] [Tepung]”.
- Jenis input:
  - Teks: nama produk dan sumber daya.
  - Angka dengan keypad numerik: untung, kapasitas.
  - Dropdown: satuan.
  - Radio: Maksimalkan untung / Minimalkan biaya; Tidak boleh lebih dari / Paling sedikit / Harus tepat.
  - Saklar: hanya jumlah utuh.
  - Geser: kapasitas.
  - Kartu pilihan: template.
- Validasi berbahasa manusia, muncul setelah kolom selesai diisi.
- Template (Produksi F&B, Anggaran Pemasaran, Distribusi dan Gudang), contoh kasus 1 klik (minimal 3), simpan otomatis, batalkan dan ulangi (P1).

### 5.2 Perhitungan dan “bagaimana jika”
- Rekomendasi otomatis, diperbarui tiap isian berubah. Mesin geometri untuk dua produk, solver di Web Worker untuk model lebih besar. Opsi jumlah utuh (P1).
- Status: Rekomendasi ditemukan, Target tidak bisa dipenuhi, Tanpa batas atas, Perhitungan terlalu lama.
- Jika target tidak bisa dipenuhi: sebut batasan yang bertabrakan dan beri tombol perbaikan (“Tambah 14 jam Mesin 2”).
- Faktor paling berpengaruh: peringkat dan nilai tambah per satu unit kapasitas.
- Uji ketahanan: Ringan (5 persen), Sedang (10), Berat (20) atau kustom (P1).

### 5.3 Dashboard
- Kartu ringkasan teratas dan satu kalimat kesimpulan.
- Grafik area yang memungkinkan (dua produk), pemakaian sumber daya (terpakai penuh ditandai “Penuh”), kontribusi untung dan faktor berpengaruh (lebih dari dua produk).
- Judul grafik berupa temuan, tombol “Apa artinya?”, tabel data alternatif.

### 5.4 Skenario, ekspor, berbagi
- Skenario bernama dan perbandingan berdampingan (kartu geser di ponsel).
- Ekspor CSV dan Excel, gambar PNG/SVG, tautan berbagi tanpa server (lihat-saja, tombol “Salin ke ruang kerja saya”).
- **PDF dan PPTX bermerek (masuk v1, P1):** nama usaha, logo, warna aksen, pilihan bagian yang dimasukkan, dibuat di perangkat.

### 5.5 Tampilan tabel (wajib di v1)
- Tiga tabel bertab (Produk, Sumber Daya, Pemakaian), judul dan kolom nama menempel.
- Angka rata kanan dan sejajar, satuan di judul, format Indonesia, dua kepadatan (Nyaman 40 piksel, Ringkas 32 piksel), huruf minimal 14 piksel.
- Edit langsung di sel, Tab dan panah, salin-tempel dari Excel, dropdown untuk sel pilihan.
- Status sel dengan ikon dan teks, baris total, bilah mini porsi pemakaian, sorotan sumber daya terpakai penuh.
- Ponsel: digeser ke samping dengan kolom nama terkunci, ketuk baris membuka lembar rincian, tombol ke tampilan kartu.
- Tabel hasil dengan standar sama, virtualisasi baris, papan ketik penuh, ekspor ke CSV, Excel, PDF.

### 5.6 Batas ukuran model

| Tingkat | Ukuran | Perilaku |
|---|---|---|
| Nyaman | Sampai 20 produk dan 20 batasan | Seketika di semua ponsel kelas menengah |
| Didukung | Sampai 50 dan 50 | Di bawah 2 detik dengan indikator |
| Lanjutan | Sampai 200 dan 200 | Laptop dan tablet, ada kemajuan dan tombol Batal |
| Di atas 200 | Tidak dijamin | Peringatan dan saran membagi model |

### 5.7 Kamus bahasa antarmuka

| Istilah teknis (internal) | Tampil di antarmuka |
|---|---|
| Variabel keputusan | Produk atau pilihan |
| Kendala | Batasan |
| Slack | Sisa kapasitas |
| Binding | Terpakai penuh (penghambat) |
| Feasible region | Area yang memungkinkan |
| Infeasible | Target tidak bisa dipenuhi |
| Unbounded | Tanpa batas atas |
| Shadow price | Nilai tambah per satu unit kapasitas |
| Tornado Chart | Faktor paling berpengaruh |
| Monte Carlo | Uji ketahanan |
| What-if | Bagaimana jika |

## 6. Excel dan CSV (template, impor, ekspor, tutorial)

### Template Excel (lima lembar)
1. **Mulai di Sini:** 3 langkah, legenda warna, contoh.
2. **Produk**
3. **Sumber Daya**
4. **Pemakaian**
5. **Cek Isian:** “Siap diunggah” atau daftar perbaikan.

Ada versi **Contoh Terisi**. Sel kuning diisi, sel abu terkunci, judul kolom berwarna aksen tua, dropdown dan validasi angka, format Indonesia, 50 baris siap isi, siap cetak A4. Versi CSV: satu berkas dengan petunjuk dan contoh di baris pertama.

### Impor
Unduh template, isi sel kuning, unggah (seret berkas di layar lebar, pemilih berkas di ponsel), pratinjau berupa kartu, perbaiki masalah, konfirmasi “Pakai data ini”.

Pesan masalah selalu menyebut baris, kolom, dan cara memperbaiki, misalnya: “Baris 7, Untung per Unit: ‘3.5000’ bukan angka yang dikenali. Maksud Anda 3.500?” Ada pemetaan kolom untuk berkas yang tidak sesuai template, dan baris bermasalah tidak menggagalkan seluruh impor.

### Ekspor Excel (enam lembar)
Ringkasan, Rencana Produksi, Pemakaian Sumber Daya, Faktor Berpengaruh, Perbandingan Skenario, Data Input (dapat diunggah kembali tanpa diubah). Format Rp dan persen, judul menempel, grafik di lembar Ringkasan, nama berkas otomatis, CSV memakai UTF-8 dengan BOM.

### Tutorial
Halaman Cara Pakai Template (3 langkah bergambar), lembar Mulai di Sini di dalam Excel, tur 30 detik, video di bawah 90 detik, PDF satu halaman, Tanya Jawab (tanpa Excel, Google Sheets, desimal koma atau titik, salah isi, privasi, dari ponsel).

**Uji penerimaan:** lima orang baru, tanpa penjelasan, berhasil dari unduh template sampai membaca hasil pada percobaan pertama, termasuk minimal dua dari ponsel.

## 7. Fitur AI (opsional, kompatibel OpenAI)
- **Kunci kosong:** status “Mode Lokal”, tidak ada permintaan jaringan ke layanan AI. Insight memakai mesin aturan lokal, tren memakai regresi dan rata-rata bergerak di JavaScript.
- **Kunci terisi:** Text-to-Model (selalu berupa draf yang harus dikonfirmasi), perkiraan permintaan dan biaya, narasi rekomendasi bisnis.
- **Kunci salah atau server mati:** galat hanya di panel AI dengan tombol Coba Lagi.
- **Pengaturan:** pilih penyedia (OpenAI, OpenRouter, Groq, DeepSeek, Ollama lokal) yang mengisi Base URL otomatis, tempel kunci, pilih model, tombol Uji koneksi. Kunci hanya di perangkat dan tidak masuk tautan atau ekspor.

## 8. Non-Fungsional
- **Ponsel:** mulai layar 360 piksel, satu kolom, area sentuh minimal 44 piksel, huruf isian minimal 16 piksel, bilah aksi menempel di bawah, dapat dipasang ke layar utama dan jalan tanpa internet.
- **Kinerja:** muat awal di bawah 2 detik di 4G, bundel awal di bawah 250 KB terkompresi, perhitungan berat di Web Worker.
- **Privasi:** data di perangkat, tanpa pelacak pihak ketiga.
- **Aksesibilitas:** WCAG 2.2 AA.
- **Kompatibilitas:** dua versi terbaru Chrome, Edge, Firefox, Safari (termasuk iOS).
- **Penyimpanan:** IndexedDB, cadangan JSON.

## 9. Tech Stack
- Next.js (App Router) dan TypeScript
- Gauss-Jordan kustom dan highs-js (WASM) di Web Worker
- **Apache ECharts impor modular** (anggaran 250 KB, SVG kustom untuk area yang memungkinkan bila perlu; Plotly tidak dipilih karena berat, Recharts dihapus)
- PapaParse dan SheetJS
- pdf-lib atau jsPDF dan pptxgenjs untuk ekspor
- Vercel AI SDK
- Zustand dengan persist, lz-string
- Radix UI atau React Aria, React Hook Form, Zod
- Vitest dan Playwright

## 10. Desain

**Prinsip:** ponsel dulu, bahasa bisnis, satu fokus per layar, data lebih dulu, satu aksen penuh makna, konsisten.

### Warna

| Token | Nilai | Pemakaian |
|---|---|---|
| bg | #F7F6F3 | Latar halaman |
| surface | #FFFFFF | Panel, tabel, kartu |
| ink | #16202A | Teks utama |
| ink-muted | #5B6672 | Teks sekunder |
| border | #E3E1DB | Garis pemisah |
| accent | #1F4E5F | Aksi utama, pilihan aktif |
| status-optimal | #2F7D57 | Rekomendasi ditemukan |
| status-warn | #B7791F | Mendekati batas |
| status-infeasible | #B3382C | Target tidak bisa dipenuhi |

**Palet data:** #1F4E5F, #C2793A, #6B7A3A, #8A3B4A, #5E6C84, #8F8A7E, dengan pola atau penanda bentuk agar terbaca saat dicetak hitam-putih.

### Tipografi
IBM Plex Sans, angka sejajar, skala 14, 16, 18, 22, 28 piksel, format Rp 1.250.000 dan 12,5%.

### Tata letak
Ponsel satu kolom dengan tab bawah (Isi Data, Hasil, Skenario); tablet dua kolom; layar lebar tiga zona.

### Grafik
Label langsung, kisi tipis, tanpa 3D, gradien, atau bayangan; animasi paling lama 200 milidetik.

### Pola yang dihindari
Agar tidak terkesan template generik: gradien ungu-biru, efek kaca berlebihan, deretan kartu identik berisi ikon, emoji sebagai ikon, hero pemasaran, slogan umum, animasi masuk di semua elemen, data contoh generik.

### Gaya tulisan
Spesifik dan berbasis angka (“Mesin 2 terpakai penuh. Menambah 14 jam menaikkan untung sekitar Rp 2.100.000”), pesan galat selalu disertai cara memperbaiki.

## 11. Kondisi Tepi
- Isian belum lengkap: tombol hasil nonaktif dengan daftar yang kurang.
- Target tidak bisa dipenuhi: tombol perbaikan.
- Tanpa batas atas.
- Beberapa rekomendasi sama baik.
- Angka sangat besar: tawarkan ganti satuan.
- Berkas impor rusak.
- Penyimpanan penuh.
- Tautan rusak.
- Mesin hitung gagal dimuat.
- Koneksi AI putus.
- Layar diputar atau pindah aplikasi: isian tetap terjaga.

## 12. Keamanan dan Privasi
Tidak ada data model yang dikirim ke server. Kunci API tidak masuk URL, ekspor, log, atau analitik. CSP ketat, berkas impor diperlakukan sebagai data tak tepercaya, sel CSV yang diawali karakter rumus di-escape.

**Analitik:** Plausible atau Umami (dihosting sendiri), tanpa cookie, tanpa isi model, dapat ditolak, hanya kejadian umum (langkah selesai, unduh template, impor berhasil atau gagal, jenis ekspor, kode galat).

## 13. Rencana Rilis

| Fase | Cakupan | Keluaran |
|---|---|---|
| 0 (2 minggu) | Evaluasi grafik dan komponen formulir, prototipe solver, sistem desain, uji kinerja ponsel, uji kegunaan awal | Keputusan stack |
| 1 (4 minggu) | Panduan, tampilan tabel, perhitungan, dashboard dasar, template | MVP internal |
| 2 (3 minggu) | Bagaimana jika, faktor berpengaruh, skenario, impor dan ekspor Excel/CSV/gambar, pemasangan ke layar utama | Beta tertutup |
| 3 (3 minggu) | AI, tautan berbagi, ekspor PDF dan PPTX bermerek | Beta publik |
| 4 (2 minggu) | Uji ketahanan, aksesibilitas, kinerja ponsel, dokumentasi, uji kegunaan dengan pelaku usaha | Rilis v1.0 |

## 14. Kriteria Penerimaan
1. Tanpa kunci AI, tidak ada permintaan jaringan ke layanan AI dan tidak ada galat konsol.
2. Pengguna baru di layar 360 piksel melihat rekomendasi dalam 3 menit tanpa rumus atau simbol matematika.
3. Semua pengisian lewat teks, angka, radio, dropdown, saklar, geser; hanya impor memakai berkas.
4. Geser kapasitas memperbarui hasil di bawah 100 milidetik (model umum).
5. Target tidak bisa dipenuhi menampilkan status, batasan bertabrakan, dan tombol perbaikan.
6. Impor berkas dengan titik koma dan desimal koma terbaca benar setelah konfirmasi pemetaan.
7. Skenario tersimpan setelah muat ulang; isian aman saat layar diputar.
8. Ekspor PNG, SVG, CSV, Excel, PDF, PPTX terbuka benar; tautan berbagi memulihkan model identik.
9. Uji patokan solver lulus, audit aksesibilitas tanpa temuan kritis, seluruh kontrol punya area sentuh minimal 44 piksel.
10. Tampilan tabel lulus uji kejelasan: lima pengguna baru dapat mengedit sel, membaca status galat, dan memahami tabel hasil tanpa bantuan.

## 15. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Bundel membengkak | Pemuatan malas, ECharts modular, anggaran ukuran di CI |
| Ketidakstabilan numerik | Penskalaan satuan otomatis, uji patokan |
| Pengguna awam bingung istilah | Kamus bahasa antarmuka, “Apa artinya?”, contoh kasus |
| Isi data banyak di layar kecil | Template, impor, kartu ringkas, simpan otomatis |
| CORS menghalangi sebagian penyedia AI | Proxy opsional, panduan Ollama lokal |
| Data hilang saat peramban dibersihkan | Cadangan JSON, pengingat berkala |
| Keluaran AI dipercaya begitu saja | Draf harus dikonfirmasi, validasi skema, penanda jelas |

## 16. Keputusan Produk

| Pertanyaan | Keputusan |
|---|---|
| Batas ukuran model | Tiga tingkat (bagian 5.6), angka final diuji di Fase 0 |
| Analitik | Ya, minimal dan ramah privasi (bagian 12) |
| Bahasa | Indonesia dulu, teks disimpan di berkas terjemahan agar Inggris mudah ditambah |
| Pustaka grafik | ECharts modular |
| Ekspor PDF dan PPTX bermerek | Masuk v1 |
| Tampilan tabel | Wajib, dengan standar jelas, detail, menarik, mudah dibaca |
