# CONTOH SOAL DAN PEMBAHASAN STEP-BY-STEP
## Optimasi Produksi Roti Keju & Roti Coklat Menggunakan Matriks Identitas (Eliminasi Gauss-Jordan)

---

### 1. Deskripsi Studi Kasus & Data Produksi

Sebuah usaha roti rumahan memproduksi dua varian roti manis harian, yaitu **Roti Keju ($x_1$)** dan **Roti Coklat ($x_2$)**. Keuntungan bersih dari penjualan 1 buah Roti Keju adalah **Rp6.000**, sedangkan 1 buah Roti Coklat menghasilkan keuntungan bersih **Rp5.000**.

Dalam satu hari produksi, toko memiliki keterbatasan pada 3 sumber daya ($m = 3$ kendala):
1. **Tepung Terigu**: Maksimal tersedia **5.000 gram**. Setiap 1 Roti Keju membutuhkan 100 gram dan 1 Roti Coklat membutuhkan 100 gram.
2. **Gula Pasir**: Maksimal tersedia **1.200 gram**. Setiap 1 Roti Keju membutuhkan 20 gram dan 1 Roti Coklat membutuhkan 30 gram.
3. **Waktu Pengolahan & Pengisian**: Maksimal tersedia **120 menit** (2 jam kerja membentuk & mengisi adonan per satuan roti). Setiap 1 Roti Keju membutuhkan 3 menit dan 1 Roti Coklat membutuhkan 2 menit.

#### Tabel Parameter & Sumber Daya

| Sumber Daya / Parameter | Roti Keju ($x_1$) | Roti Coklat ($x_2$) | Kapasitas Maksimal |
| :--- | :---: | :---: | :---: |
| 1. Tepung Terigu (gram) | 100 | 100 | 5.000 |
| 2. Gula Pasir (gram) | 20 | 30 | 1.200 |
| 3. Waktu Pengolahan & Pengisian (menit) | 3 | 2 | 120 |
| **Keuntungan Bersih per Buah (Rp)** | **6.000** | **5.000** | **-** |

---

### 2. Langkah 1: Perumusan Model Matematika

* **Variabel Keputusan:**
  * $x_1$ = jumlah produksi Roti Keju (buah)
  * $x_2$ = jumlah produksi Roti Coklat (buah)
  * Syarat non-negatif: $x_1 \ge 0$ dan $x_2 \ge 0$

* **Fungsi Tujuan:**
  * Dalam ribuan rupiah: Maksimumkan $Z = 6x_1 + 5x_2$
  * Dalam rupiah penuh: Maksimumkan $Z = 6.000x_1 + 5.000x_2$

* **Sistem Pertidaksamaan Kendala:**
  1. **Tepung Terigu:**
     $$100x_1 + 100x_2 \le 5.000 \iff x_1 + x_2 \le 50 \quad (\text{disederhanakan dibagi 100})$$
  2. **Gula Pasir:**
     $$20x_1 + 30x_2 \le 1.200 \iff 2x_1 + 3x_2 \le 120 \quad (\text{disederhanakan dibagi 10})$$
  3. **Waktu Pengolahan & Pengisian:**
     $$3x_1 + 2x_2 \le 120$$

---

### 3. Langkah 2: Bentuk Matriks Utama ($3 \times 2$)

Model pertidaksamaan kendala di atas dituliskan ke dalam bentuk perkalian matriks $A \cdot x \le b$ sebagai berikut:

$$A \cdot x \le b$$

$$\begin{bmatrix} 1 & 1 \\ 2 & 3 \\ 3 & 2 \end{bmatrix} \begin{bmatrix} x_1 \\ x_2 \end{bmatrix} \le \begin{bmatrix} 50 \\ 120 \\ 120 \end{bmatrix}$$

---

### 4. Langkah 3: Mencari Titik Pojok dengan Matriks Identitas (Gauss-Jordan)

Dari matriks $3 \times 2$ di atas, diambil 2 baris per pasangan lalu diubah menggunakan Operasi Baris Elementer (OBE) hingga sisi kiri menjadi **Matriks Identitas** $\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}$ sehingga nilai $x_1$ dan $x_2$ langsung terbaca di kolom kanan.

#### A. Pasangan 1: Kendala 1 (Tepung) & Kendala 2 (Gula)

$$\left[ \begin{array}{cc|c} 1 & 1 & 50 \\ 2 & 3 & 120 \end{array} \right] \xrightarrow{B_2 - 2B_1} \left[ \begin{array}{cc|c} 1 & 1 & 50 \\ 0 & 1 & 20 \end{array} \right] \xrightarrow{B_1 - B_2} \left[ \begin{array}{cc|c} 1 & 0 & 30 \\ 0 & 1 & 20 \end{array} \right]$$

* **Hasil Pasangan 1:** Diperoleh $x_1 = 30$ dan $x_2 = 20 \implies$ Titik $(30, 20)$.

#### B. Pasangan 2: Kendala 1 (Tepung) & Kendala 3 (Waktu)

$$\left[ \begin{array}{cc|c} 1 & 1 & 50 \\ 3 & 2 & 120 \end{array} \right] \xrightarrow{B_2 - 3B_1} \left[ \begin{array}{cc|c} 1 & 1 & 50 \\ 0 & -1 & -30 \end{array} \right] \xrightarrow{-B_2} \left[ \begin{array}{cc|c} 1 & 1 & 50 \\ 0 & 1 & 30 \end{array} \right] \xrightarrow{B_1 - B_2} \left[ \begin{array}{cc|c} 1 & 0 & 20 \\ 0 & 1 & 30 \end{array} \right]$$

* **Hasil Pasangan 2:** Diperoleh $x_1 = 20$ dan $x_2 = 30 \implies$ Titik $(20, 30)$.

#### C. Pasangan 3: Kendala 2 (Gula) & Kendala 3 (Waktu)

$$\left[ \begin{array}{cc|c} 2 & 3 & 120 \\ 3 & 2 & 120 \end{array} \right] \xrightarrow{\frac{1}{2} B_1} \left[ \begin{array}{cc|c} 1 & 1{,}5 & 60 \\ 3 & 2 & 120 \end{array} \right] \xrightarrow{B_2 - 3B_1} \left[ \begin{array}{cc|c} 1 & 1{,}5 & 60 \\ 0 & -2{,}5 & -60 \end{array} \right]$$

$$\xrightarrow{B_2 / (-2{,}5)} \left[ \begin{array}{cc|c} 1 & 1{,}5 & 60 \\ 0 & 1 & 24 \end{array} \right] \xrightarrow{B_1 - 1{,}5B_2} \left[ \begin{array}{cc|c} 1 & 0 & 24 \\ 0 & 1 & 24 \end{array} \right]$$

* **Hasil Pasangan 3:** Diperoleh $x_1 = 24$ dan $x_2 = 24 \implies$ Titik $(24, 24)$.

#### Titik Pojok pada Sumbu Koordinat ($x_1 = 0$ dan $x_2 = 0$):
1. Titik asal / awal: $(0, 0)$
2. Batas terdekat di sumbu $x_1$ dari kendala waktu ($3x_1 = 120 \implies x_1 = 40$), yaitu **$(40, 0)$**
3. Batas terdekat di sumbu $x_2$ dari kendala gula ($3x_2 = 120 \implies x_2 = 40$), yaitu **$(0, 40)$**

---

### 5. Langkah 4: Uji Kelayakan Titik Potong ke Semua Kendala

| Titik Kandidat | Cek Tepung ($\le 5.000$ gr) | Cek Gula ($\le 1.200$ gr) | Cek Waktu ($\le 120$ mnt) | Status Kelayakan |
| :--- | :--- | :--- | :--- | :--- |
| **$(30, 20)$** | $100(30) + 100(20) = 5.000$<br>*(Aman)* | $20(30) + 30(20) = 1.200$<br>*(Aman)* | $3(30) + 2(20) = 130 > 120$<br>*(Melebihi batas)* | **TIDAK LAYAK** |
| **$(20, 30)$** | $100(20) + 100(30) = 5.000$<br>*(Aman)* | $20(20) + 30(30) = 1.300 > 1.200$<br>*(Melebihi batas)* | $3(20) + 2(30) = 120$<br>*(Aman)* | **TIDAK LAYAK** |
| **$(24, 24)$** | $100(24) + 100(24) = 4.800$<br>*(Aman)* | $20(24) + 30(24) = 1.200$<br>*(Aman)* | $3(24) + 2(24) = 120$<br>*(Aman)* | **LAYAK** |

---

### 6. Langkah 5: Evaluasi Fungsi Tujuan & Kesimpulan Hasil

Evaluasi seluruh titik pojok pada daerah layak (*feasible region*):

| No | Titik Pojok Layak | Perhitungan $Z = 6x_1 + 5x_2$ (dalam ribuan Rp) | Total Keuntungan | Keterangan |
| :---: | :---: | :--- | :---: | :--- |
| 1 | $(0, 0)$ | $6(0) + 5(0) = 0$ | Rp0 | Titik Asal |
| 2 | $(40, 0)$ | $6(40) + 5(0) = 240$ | Rp240.000 | Batas Sumbu $x_1$ |
| 3 | $(0, 40)$ | $6(0) + 5(40) = 200$ | Rp200.000 | Batas Sumbu $x_2$ |
| 4 | **$(24, 24)$** | **$6(24) + 5(24) = 144 + 120 = 264$** | **Rp264.000** | **SOLUSI OPTIMAL** |

---

### Kesimpulan Solusi Optimal

* **Kombinasi Produksi Terbaik:**
  * Memproduksi **24 buah Roti Keju** ($x_1^* = 24$)
  * Memproduksi **24 buah Roti Coklat** ($x_2^* = 24$)
* **Keuntungan Maksimum:** **Rp264.000 per hari**.
* **Analisis Penggunaan Sumber Daya:**
  * **Gula Pasir:** Terpakai $1.200 / 1.200$ gram ($100\%$, habis terpakai &ndash; *bottleneck*).
  * **Waktu Pengolahan:** Terpakai $120 / 120$ menit ($100\%$, habis terpakai &ndash; *bottleneck*).
  * **Tepung Terigu:** Terpakai $4.800 / 5.000$ gram ($96\%$, masih tersisa $200$ gram kapasitas aman).

---

## CONTOH KASUS MINIMASI (KHUSUS WEB DASHBOARD)
### Formulasi Pakan Ternak (Minimalkan Biaya Operasional)

#### 1. Deskripsi & Data Formulasi
Sebuah peternakan ingin meracik ransum pakan harian dari dua jenis bahan pakan: **Konsentrat Kedelai ($x_1$)** seharga **Rp4.000/kg** dan **Dedak Jagung & Padi ($x_2$)** seharga **Rp3.000/kg**.
Ransum pakan wajib memenuhi kebutuhan gizi minimum dan tidak melampaui kapasitas wadah mixer:
1. **Target Protein Kasar ($\ge 24$ unit):** Konsentrat Kedelai mengandung 3 unit/kg, Dedak mengandung 2 unit/kg.
2. **Target Mineral & Kalsium ($\ge 16$ unit):** Konsentrat Kedelai mengandung 1 unit/kg, Dedak mengandung 2 unit/kg.
3. **Kapasitas Wadah Mixer ($\le 12$ kg):** Total campuran pakan maksimal 12 kg per batch.

#### 2. Perumusan Model Matematika
* **Fungsi Tujuan:** $\text{Minimalkan } Z = 4.000x_1 + 3.000x_2$
* **Kendala Spesifikasi:**
  1. $3x_1 + 2x_2 \ge 24$
  2. $x_1 + 2x_2 \ge 16$
  3. $x_1 + x_2 \le 12$
  4. Syarat non-negatif: $x_1 \ge 0, x_2 \ge 0$

#### 3. Titik Potong Dua Kendala Utama (Eliminasi Gauss-Jordan)
Mengambil dua kendala batas nutrisi minimum:
$$\left[ \begin{array}{cc|c} 3 & 2 & 24 \\ 1 & 2 & 16 \end{array} \right] \xrightarrow{B_1 \leftrightarrow B_2} \left[ \begin{array}{cc|c} 1 & 2 & 16 \\ 3 & 2 & 24 \end{array} \right] \xrightarrow{B_2 - 3B_1} \left[ \begin{array}{cc|c} 1 & 2 & 16 \\ 0 & -4 & -24 \end{array} \right]$$

$$\xrightarrow{B_2 / (-4)} \left[ \begin{array}{cc|c} 1 & 2 & 16 \\ 0 & 1 & 6 \end{array} \right] \xrightarrow{B_1 - 2B_2} \left[ \begin{array}{cc|c} 1 & 0 & 4 \\ 0 & 1 & 6 \end{array} \right]$$

* Diperoleh perpotongan kendala gizi: $x_1 = 4\text{ kg}$ dan $x_2 = 6\text{ kg} \implies (4, 6)$.

#### 4. Uji Titik Pojok Daerah Layak (*Feasible Region*)
* **Titik $(4, 6)$:**
  * Protein: $3(4) + 2(6) = 24 \ge 24$ *(Terpenuhi tepat)*
  * Mineral: $1(4) + 2(6) = 16 \ge 16$ *(Terpenuhi tepat)*
  * Mixer: $4 + 6 = 10 \le 12$ *(Aman, sisa 2 kg)*
  * **Total Biaya: $4.000(4) + 3.000(6) = \text{Rp } 34.000$ (BIAYA MINIMUM &ndash; OPTIMAL)**
* **Titik $(0, 12)$:**
  * Total Biaya: $4.000(0) + 3.000(12) = \text{Rp } 36.000$
* **Titik $(8, 4)$:**
  * Total Biaya: $4.000(8) + 3.000(4) = \text{Rp } 44.000$

#### 5. Kesimpulan Kasus Minimasi
* **Rekomendasi Pembelian Bahan:** Gunakan **4 kg Konsentrat Kedelai** dan **6 kg Dedak Jagung & Padi**.
* **Biaya Operasional Minimum:** **Rp34.000 per batch**.
* **Status Nutrisi:** Target protein (24/24 unit) dan mineral (16/16 unit) terpenuhi $100\%$ tepat dengan efisiensi biaya tertinggi.

