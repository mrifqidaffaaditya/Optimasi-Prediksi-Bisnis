# Sistem Optimasi Perencanaan Produksi (Terverifikasi Bebas Error)
**Kelompok 9 - Matematika Dasar (Universitas Negeri Semarang)**  
**Terintegrasi dengan Web Dashboard:** [https://opb.keidev.my.id](https://opb.keidev.my.id)

---

## 📌 Ringkasan Proyek

Aplikasi ini merupakan implementasi terpadu dari sistem optimasi alokasi sumber daya dan perencanaan kombinasi produksi optimal untuk UMKM maupun industri manufaktur. Proyek ini menggabungkan:
1. **Source Code Inti C++ (`cpp/main.cpp`)**: Program konsol berkecepatan tinggi yang mengeksekusi metode Simpleks Big-M, Eliminasi Gauss-Jordan untuk menyelesaikan Sistem Persamaan Linear (SPL), verifikasi kelayakan kendala, serta ekspor data grafik ke berkas CSV.
2. **Source Code Python & Visualisasi Grafis (`python/main.py`)**: Implementasi Python lengkap dengan fitur plotting grafik 2D (Area Layak, Garis Kendala, Titik Potong SPL Gauss-Jordan, dan Titik Optimal) dalam format PNG (Matplotlib) serta SVG & HTML mandiri (tanpa dependensi eksternal).
3. **Web Dashboard Interaktif (Next.js & Tailwind CSS)**: Antarmuka modern *client-side* yang ramah bagi pengguna bisnis non-IT, dilengkapi visualisasi area layak 2D, tabel interaktif, analisis faktor penghambat (*bottleneck*), simulasi skenario (*What-If*), serta ekspor laporan resmi (Excel, PDF, CSV, PNG).

---

## 🧮 Metode Matematis yang Digunakan

### 1. Metode Simpleks (Big-M Method)
Digunakan untuk mencari kombinasi produksi yang menghasilkan keuntungan maksimal di bawah pembatas kapasitas sumber daya:
* **Fungsi Tujuan:** $\text{Maksimalkan } Z = \sum_{j=1}^{n} c_j X_j$
* **Kendala Kapasitas:** $\sum_{j=1}^{n} a_{ij} X_j \le b_i \quad (\text{atau } \ge b_i)$
* **Variabel Bantu:** Variabel sisa (*slack* $S_i$), variabel kelebihan (*surplus* $E_i$), dan variabel artifisial ($A_i$) dengan penalti Big-M ($M = 10.000 \times \max(c_j)$).
* **Operasi Baris Elementer (OBE):** Pada setiap iterasi, matriks diubah menggunakan **Eliminasi Gauss-Jordan** pada elemen pivot hingga seluruh koefisien baris fungsi tujuan bernilai non-negatif.

### 2. Eliminasi Gauss-Jordan (Sistem Persamaan Linear 2 Variabel)
Digunakan dalam fungsi `hitungTitikPotongSPL` untuk membuktikan titik potong antara dua kendala penghambat utama (*binding constraints*):
$$\begin{bmatrix} a_1 & b_1 & | & c_1 \\ a_2 & b_2 & | & c_2 \end{bmatrix} \xrightarrow{\text{OBE Gauss-Jordan}} \begin{bmatrix} 1 & 0 & | & X_1 \\ 0 & 1 & | & X_2 \end{bmatrix}$$
Tahapan:
1. Menjadikan elemen diagonal pertama sebagai satu utama (*leading 1*): $R_1 \leftarrow R_1 / a_1$.
2. Menolkan elemen di bawah pivot: $R_2 \leftarrow R_2 - a_2 R_1$.
3. Menjadikan elemen diagonal kedua sebagai satu utama: $R_2 \leftarrow R_2 / a_{22}'$.
4. Menolkan elemen di atas pivot: $R_1 \leftarrow R_1 - a_{12}' R_2$.
Hasil pada kolom konstanta merupakan solusi unik titik potong yang diverifikasi identik dengan titik optimal Simpleks.

---

## 🐍 Menjalankan Program Python & Pembuatan Grafik

Berkas program Python terletak di [`python/main.py`](python/main.py).

### Fitur Program Python:
* Menjalankan seluruh algoritma Simpleks Big-M dan Eliminasi Gauss-Jordan dengan output per langkah.
* **Pembuatan Grafik Visualisasi 2D Otomatis:**
  * **Grafik Standar (Matplotlib):** Menyimpan gambar beresolusi tinggi `grafik_optimasi_produksi.png`.
  * **Grafik Mandiri (Zero-Dependency):** Menghasilkan berkas vektor `grafik_optimasi_produksi.svg` dan halaman interaktif `grafik_optimasi_produksi.html` yang dapat dibuka langsung di peramban web apa pun tanpa perlu memasang modul tambahan.
* Elemen grafik mencakup:
  * Garis pembatas kendala sumber daya.
  * Arsir area produksi yang layak (*Feasible Region*).
  * Penanda titik sudut dan koordinat titik produksi optimal ($X_1^*, X_2^*$).

### Langkah Eksekusi:
```bash
# 1. Jalankan program Python secara langsung
python3 python/main.py

# 2. (Opsional) Pasang Matplotlib jika ingin menghasilkan grafik PNG
pip install -r python/requirements.txt
```

Setelah program selesai dijalankan, Anda dapat membuka grafik hasil optimasi:
```bash
# Buka grafik di browser (Linux/macOS/Windows)
xdg-open grafik_optimasi_produksi.html   # Linux
open grafik_optimasi_produksi.html       # macOS
start grafik_optimasi_produksi.html      # Windows
```

---

## 💻 Menjalankan Program C++

Berkas program C++ terletak di folder [`cpp/main.cpp`](cpp/main.cpp).

### Persyaratan:
* Kompiler C++ (seperti `g++` atau `clang++`) yang mendukung standar C++11 atau lebih baru.

### Langkah Kompilasi & Eksekusi:
```bash
# 1. Kompilasi program C++
g++ -O3 -Wall -Wextra cpp/main.cpp -o optimasi_produksi

# 2. Jalankan program
./optimasi_produksi
```

### Menu Pilihan Data pada Program C++ & Python:
* **Pilihan 1 (Kasus Utama Web):** UMKM Konveksi Karya Busana (Kemeja Batik & Tunik Modern).
  * Keuntungan: Rp 65.000 / Kemeja Batik, Rp 85.000 / Tunik Modern.
  * Kendala: Bahan Baku Kain (95 m), Jam Jahit (120 jam), Mesin Bordir (64 jam).
  * Solusi Optimal: **20 Kemeja Batik** & **22 Tunik Modern** (Laba Maksimal: **Rp 3.170.000**).
* **Pilihan 2 (Kasus Roti Rumahan):** Usaha Bakery (Roti Keju & Roti Coklat).
  * Keuntungan: Rp 6.000 / Roti Keju, Rp 5.000 / Roti Coklat.
  * Solusi Optimal: **24 Roti Keju** & **24 Roti Coklat** (Laba Maksimal: **Rp 264.000**).
* **Pilihan 3:** Masukkan Data Usaha Baru Secara Manual (interaktif dengan validasi input anti-error).

Program C++ secara otomatis menghasilkan berkas `hasil_optimasi.csv` yang berisi koordinat titik optimal dan perpotongan garis sumbu kendala.

---

## 🌐 Menjalankan Web Dashboard (Next.js)

Web dashboard berjalan sepenuhnya di sisi klien (*client-side*):

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan mode pengembangan
npm run dev

# 3. Atau lakukan build produksi & jalankan
npm run build
npm start
```
Buka peramban di `http://localhost:5000`.

---

## 👥 Tim Pengembang
**Kelompok 9 - Matematika Dasar**  
**Universitas Negeri Semarang (UNNES)**  
Dashboard: [https://opb.keidev.my.id](https://opb.keidev.my.id)
