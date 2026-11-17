#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include <iomanip>
#include <cmath>
#include <limits>
#include <algorithm>

using namespace std;

// ============================================================================
// SISTEM OPTIMASI PERENCANAAN PRODUKSI (TERVERIFIKASI BEBAS ERROR)
// Kelompok 9 - Matematika Dasar (Universitas Negeri Semarang)
// Terintegrasi dengan Web Dashboard: https://opb.keidev.my.id
// Metode: Pemrograman Linear Simpleks & Eliminasi Gauss-Jordan
// ============================================================================

struct DataKendala {
    string namaKendala;
    string satuanKendala;
    vector<double> kebutuhanPerProduk; // Kebutuhan sumber daya untuk 1 unit tiap produk
    string tandaBatas;                 // "<=" (batas maksimal) atau ">=" (target minimal)
    double batasKapasitas;             // Total kapasitas sumber daya yang tersedia
};

// Fungsi Bantu: Membersihkan nilai -0.0 akibat pembulatan floating-point
double bersihkanNolNegatif(double nilai) {
    if (fabs(nilai) < 1e-9) {
        return 0.0;
    }
    return nilai;
}

// Fungsi Bantu: Membaca input bilangan bulat dengan validasi anti-error
int bacaBilanganBulat(const string &pesanPrompt, int batasMinimal, int batasMaksimal) {
    int nilaiInput;
    while (true) {
        cout << pesanPrompt;
        if (cin >> nilaiInput && nilaiInput >= batasMinimal && nilaiInput <= batasMaksimal) {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return nilaiInput;
        }
        cout << "  [Peringatan] Masukkan angka bulat antara " << batasMinimal
             << " sampai " << batasMaksimal << ".\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

// Fungsi Bantu: Membaca input bilangan desimal/pecahan dengan validasi anti-error
double bacaBilanganDesimal(const string &pesanPrompt, double batasMinimal) {
    double nilaiInput;
    while (true) {
        cout << pesanPrompt;
        if (cin >> nilaiInput && !isnan(nilaiInput) && !isinf(nilaiInput) && nilaiInput >= batasMinimal) {
            cin.ignore(numeric_limits<streamsize>::max(), '\n');
            return nilaiInput;
        }
        cout << "  [Peringatan] Masukkan angka yang valid (minimal " << batasMinimal << ").\n";
        cin.clear();
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
    }
}

// Fungsi Bantu: Membaca teks tidak kosong
string bacaTeks(const string &pesanPrompt) {
    string teksInput;
    while (true) {
        cout << pesanPrompt;
        getline(cin, teksInput);
        if (!teksInput.empty()) {
            return teksInput;
        }
        cout << "  [Peringatan] Input tidak boleh kosong.\n";
    }
}

// Fungsi Bantu: Menampilkan isi tabel matriks perhitungan pada setiap langkah iterasi
void cetakTabelMatriks(const vector<vector<double>> &tabelMatriks,
                       const vector<string> &labelKolom,
                       const vector<string> &labelBarisBasis) {
    int totalBarisKendala = static_cast<int>(tabelMatriks.size()) - 1;
    int totalKolomVariabel = static_cast<int>(tabelMatriks[0].size()) - 1;

    cout << "    ------------------------------------------------------------------\n";
    cout << "    " << left << setw(10) << "Basis";
    for (int kolom = 0; kolom < totalKolomVariabel; kolom++) {
        cout << right << setw(9) << labelKolom[kolom];
    }
    cout << right << setw(11) << "Kapasitas" << "\n";
    cout << "    ------------------------------------------------------------------\n";

    cout << fixed << setprecision(2);
    for (int baris = 0; baris < totalBarisKendala; baris++) {
        cout << "    " << left << setw(10) << labelBarisBasis[baris];
        for (int kolom = 0; kolom < totalKolomVariabel; kolom++) {
            cout << right << setw(9) << bersihkanNolNegatif(tabelMatriks[baris][kolom]);
        }
        cout << right << setw(11) << bersihkanNolNegatif(tabelMatriks[baris][totalKolomVariabel]) << "\n";
    }

    cout << "    ------------------------------------------------------------------\n";
    cout << "    " << left << setw(10) << "Tujuan(Z)";
    for (int kolom = 0; kolom < totalKolomVariabel; kolom++) {
        cout << right << setw(9) << bersihkanNolNegatif(tabelMatriks[totalBarisKendala][kolom]);
    }
    cout << right << setw(11) << bersihkanNolNegatif(tabelMatriks[totalBarisKendala][totalKolomVariabel]) << "\n";
    cout << "    ------------------------------------------------------------------\n";
}

// ============================================================================
// FUNGSI 1: Menghitung Titik Potong 2 Garis Kendala menggunakan
//           ELIMINASI GAUSS-JORDAN (Matriks Eselon Baris Tereduksi / RREF)
//
// Bentuk Matriks Augmented [ A | B ]:
// [ a1  b1 | c1 ]
// [ a2  b2 | c2 ]
//
// Melalui Operasi Baris Elementer (OBE) menuju bentuk:
// [ 1   0  | X1 ]
// [ 0   1  | X2 ]
// ============================================================================
bool hitungTitikPotongSPL(double kebutuhanProduk1_Garis1, double kebutuhanProduk2_Garis1, double kapasitas_Garis1,
                          double kebutuhanProduk1_Garis2, double kebutuhanProduk2_Garis2, double kapasitas_Garis2,
                          double &titikPotongProduk1, double &titikPotongProduk2) {
    // Matriks Augmentasi [2 x 3]
    double matriksAugmentasi[2][3] = {
        {kebutuhanProduk1_Garis1, kebutuhanProduk2_Garis1, kapasitas_Garis1},
        {kebutuhanProduk1_Garis2, kebutuhanProduk2_Garis2, kapasitas_Garis2}
    };

    // Langkah 1 Eliminasi Gauss-Jordan: Pastikan elemen pivot baris 1 (kolom 1) != 0
    if (fabs(matriksAugmentasi[0][0]) < 1e-9) {
        if (fabs(matriksAugmentasi[1][0]) < 1e-9) {
            return false; // Kedua garis tidak memiliki komponen X1, tidak ada perpotongan unik
        }
        // Tukar baris 1 dan baris 2 (OBE Tipe 1: Pertukaran Baris)
        for (int k = 0; k < 3; k++) {
            swap(matriksAugmentasi[0][k], matriksAugmentasi[1][k]);
        }
    }

    // Normalisasi Baris 1: R1 = R1 / a11 (OBE Tipe 2: Menjadikan satu utama / leading 1)
    double pivotBaris1 = matriksAugmentasi[0][0];
    for (int k = 0; k < 3; k++) {
        matriksAugmentasi[0][k] /= pivotBaris1;
    }

    // Eliminasi Baris 2: R2 = R2 - a21 * R1 (OBE Tipe 3: Menolkan elemen di bawah pivot)
    double faktorBaris2 = matriksAugmentasi[1][0];
    for (int k = 0; k < 3; k++) {
        matriksAugmentasi[1][k] -= faktorBaris2 * matriksAugmentasi[0][k];
    }

    // Langkah 2 Eliminasi Gauss-Jordan: Periksa elemen pivot baris 2 (kolom 2)
    double pivotBaris2 = matriksAugmentasi[1][1];
    if (fabs(pivotBaris2) < 1e-9) {
        return false; // Garis sejajar / determinan = 0, tidak ada titik potong tunggal
    }

    // Normalisasi Baris 2: R2 = R2 / a22 (Menjadikan satu utama pada baris kedua)
    for (int k = 0; k < 3; k++) {
        matriksAugmentasi[1][k] /= pivotBaris2;
    }

    // Eliminasi Baris 1: R1 = R1 - a12 * R2 (Menolkan elemen di atas pivot)
    // Hasil akhir membentuk Matriks Eselon Baris Tereduksi (Reduced Row Echelon Form)
    double faktorBaris1 = matriksAugmentasi[0][1];
    for (int k = 0; k < 3; k++) {
        matriksAugmentasi[0][k] -= faktorBaris1 * matriksAugmentasi[1][k];
    }

    // Solusi titik potong SPL langsung diperoleh dari kolom augmentasi
    titikPotongProduk1 = bersihkanNolNegatif(matriksAugmentasi[0][2]);
    titikPotongProduk2 = bersihkanNolNegatif(matriksAugmentasi[1][2]);
    return true;
}

// ============================================================================
// FUNGSI 2: Memeriksa apakah angka produksi benar-benar aman & memenuhi kendala
// ============================================================================
bool periksaKelayakanSolusi(const vector<double> &rencanaProduksi,
                            const vector<string> &daftarNamaProduk,
                            const vector<DataKendala> &daftarKendala) {
    cout << "\n[PROSES 4] VERIFIKASI KELAYAKAN SOLUSI TERHADAP SELURUH KENDALA\n";

    for (int indeksProduk = 0; indeksProduk < static_cast<int>(rencanaProduksi.size()); indeksProduk++) {
        if (rencanaProduksi[indeksProduk] < -1e-6) {
            cout << "  -> GAGAL: Jumlah produksi " << daftarNamaProduk[indeksProduk]
                 << " tidak boleh negatif (" << rencanaProduksi[indeksProduk] << ").\n";
            return false;
        }
    }

    bool semuaKendalaTerpenuhi = true;
    cout << fixed << setprecision(2);

    for (int indeksKendala = 0; indeksKendala < static_cast<int>(daftarKendala.size()); indeksKendala++) {
        double totalSumberDayaTerpakai = 0.0;
        for (int indeksProduk = 0; indeksProduk < static_cast<int>(rencanaProduksi.size()); indeksProduk++) {
            totalSumberDayaTerpakai += daftarKendala[indeksKendala].kebutuhanPerProduk[indeksProduk] * rencanaProduksi[indeksProduk];
        }
        totalSumberDayaTerpakai = bersihkanNolNegatif(totalSumberDayaTerpakai);

        bool kendalaIniAman = true;
        if (daftarKendala[indeksKendala].tandaBatas == "<=" &&
            totalSumberDayaTerpakai > daftarKendala[indeksKendala].batasKapasitas + 1e-5) {
            kendalaIniAman = false;
        }
        if (daftarKendala[indeksKendala].tandaBatas == ">=" &&
            totalSumberDayaTerpakai < daftarKendala[indeksKendala].batasKapasitas - 1e-5) {
            kendalaIniAman = false;
        }

        cout << "  -> Cek Kendala " << (indeksKendala + 1) << " (" << daftarKendala[indeksKendala].namaKendala << "): "
             << totalSumberDayaTerpakai << " " << daftarKendala[indeksKendala].tandaBatas << " "
             << daftarKendala[indeksKendala].batasKapasitas << " " << daftarKendala[indeksKendala].satuanKendala
             << "  -->  " << (kendalaIniAman ? "[MEMENUHI]" : "[MELANGGAR]") << "\n";

        if (!kendalaIniAman) {
            semuaKendalaTerpenuhi = false;
        }
    }

    return semuaKendalaTerpenuhi;
}

// ============================================================================
// FUNGSI 3: Algoritma Pencarian Produksi Optimal (Metode Simpleks Big-M)
//           Menggunakan ELIMINASI GAUSS-JORDAN pada setiap langkah iterasi OBE
// ============================================================================
bool cariProduksiOptimalDenganLog(int totalProduk,
                                  const vector<string> &daftarNamaProduk,
                                  const vector<double> &keuntunganPerUnit,
                                  const vector<DataKendala> &daftarKendala,
                                  vector<double> &rekomendasiProduksi,
                                  double &totalKeuntunganMaksimal) {
    int totalKendala = static_cast<int>(daftarKendala.size());

    cout << "\n[PROSES 1] INISIALISASI MODEL MATEMATIKA & FUNGSI TUJUAN\n";
    cout << "  -> Jumlah Jenis Produk (Variabel Keputusan) : " << totalProduk << "\n";
    cout << "  -> Jumlah Kendala Operasional               : " << totalKendala << "\n";
    cout << "  -> Fungsi Tujuan: Maksimalkan Z = ";
    cout << fixed << setprecision(0);
    for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
        cout << keuntunganPerUnit[indeksProduk] << " X" << (indeksProduk + 1)
             << (indeksProduk + 1 < totalProduk ? " + " : "");
    }
    cout << "\n";

    // Hitung jumlah variabel bantu (variabel sisa/slack dan variabel buatan/artifisial)
    int jumlahVariabelSisa = 0;
    int jumlahVariabelLebih = 0;
    int jumlahVariabelBuatan = 0;

    for (int indeksKendala = 0; indeksKendala < totalKendala; indeksKendala++) {
        if (daftarKendala[indeksKendala].tandaBatas == "<=") {
            jumlahVariabelSisa++;
        } else {
            jumlahVariabelLebih++;
            jumlahVariabelBuatan++;
        }
    }

    // Skala penalti Big-M menyesuaikan nilai keuntungan terbesar agar tetap akurat di segala nominal
    double keuntunganTerbesar = 1.0;
    for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
        if (fabs(keuntunganPerUnit[indeksProduk]) > keuntunganTerbesar) {
            keuntunganTerbesar = fabs(keuntunganPerUnit[indeksProduk]);
        }
    }
    const double PENALTI_BESAR = keuntunganTerbesar * 10000.0;

    int totalKolomTabel = totalProduk + jumlahVariabelSisa + jumlahVariabelLebih + jumlahVariabelBuatan;
    vector<vector<double>> tabelMatriks(totalKendala + 1, vector<double>(totalKolomTabel + 1, 0.0));
    vector<int> kolomBasisAktif(totalKendala, -1);
    vector<string> labelKolom(totalKolomTabel);
    vector<string> labelBarisBasis(totalKendala);

    for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
        labelKolom[indeksProduk] = "X" + to_string(indeksProduk + 1);
    }

    int posisiKolomSisa = totalProduk;
    int posisiKolomLebih = totalProduk + jumlahVariabelSisa;
    int posisiKolomBuatan = totalProduk + jumlahVariabelSisa + jumlahVariabelLebih;

    cout << "\n[PROSES 2] PEMBENTUKAN MATRIKS & TABEL SIMPLEKS AWAL\n";
    for (int indeksKendala = 0; indeksKendala < totalKendala; indeksKendala++) {
        for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
            tabelMatriks[indeksKendala][indeksProduk] = daftarKendala[indeksKendala].kebutuhanPerProduk[indeksProduk];
        }
        tabelMatriks[indeksKendala][totalKolomTabel] = daftarKendala[indeksKendala].batasKapasitas;

        if (daftarKendala[indeksKendala].tandaBatas == "<=") {
            tabelMatriks[indeksKendala][posisiKolomSisa] = 1.0;
            labelKolom[posisiKolomSisa] = "S" + to_string(indeksKendala + 1);
            labelBarisBasis[indeksKendala] = labelKolom[posisiKolomSisa];
            kolomBasisAktif[indeksKendala] = posisiKolomSisa;
            cout << "  -> Kendala " << (indeksKendala + 1) << " (" << daftarKendala[indeksKendala].namaKendala
                 << "): Ditambahkan variabel sisa kapasitas " << labelKolom[posisiKolomSisa] << "\n";
            posisiKolomSisa++;
        } else {
            tabelMatriks[indeksKendala][posisiKolomLebih] = -1.0;
            labelKolom[posisiKolomLebih] = "E" + to_string(indeksKendala + 1);
            posisiKolomLebih++;

            tabelMatriks[indeksKendala][posisiKolomBuatan] = 1.0;
            labelKolom[posisiKolomBuatan] = "A" + to_string(indeksKendala + 1);
            labelBarisBasis[indeksKendala] = labelKolom[posisiKolomBuatan];
            kolomBasisAktif[indeksKendala] = posisiKolomBuatan;
            tabelMatriks[totalKendala][posisiKolomBuatan] = PENALTI_BESAR;
            cout << "  -> Kendala " << (indeksKendala + 1) << " (" << daftarKendala[indeksKendala].namaKendala
                 << "): Ditambahkan variabel bantu target minimal " << labelKolom[posisiKolomBuatan] << "\n";
            posisiKolomBuatan++;
        }
    }

    // Masukkan koefisien keuntungan ke baris fungsi tujuan (baris paling bawah)
    for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
        tabelMatriks[totalKendala][indeksProduk] = -keuntunganPerUnit[indeksProduk];
    }

    // Sesuaikan baris fungsi tujuan jika terdapat kendala target minimal (>=)
    for (int indeksKendala = 0; indeksKendala < totalKendala; indeksKendala++) {
        if (daftarKendala[indeksKendala].tandaBatas == ">=") {
            for (int kolom = 0; kolom <= totalKolomTabel; kolom++) {
                tabelMatriks[totalKendala][kolom] -= PENALTI_BESAR * tabelMatriks[indeksKendala][kolom];
            }
        }
    }

    cout << "\n  [Tabel Matriks Awal - Iterasi 0]\n";
    cetakTabelMatriks(tabelMatriks, labelKolom, labelBarisBasis);

    cout << "\n[PROSES 3] ITERASI PENCARIAN SOLUSI OPTIMAL (ELIMINASI GAUSS-JORDAN)\n";
    bool selesaiOptimal = false;
    const int BATAS_MAKSIMAL_ITERASI = 500;

    for (int nomorIterasi = 1; nomorIterasi <= BATAS_MAKSIMAL_ITERASI; nomorIterasi++) {
        // Langkah A: Cari kolom masuk (nilai negatif terbesar pada baris tujuan)
        int kolomPivotTerpilih = -1;
        double nilaiTujuanTerkecil = -1e-7;

        for (int kolom = 0; kolom < totalKolomTabel; kolom++) {
            if (tabelMatriks[totalKendala][kolom] < nilaiTujuanTerkecil) {
                nilaiTujuanTerkecil = tabelMatriks[totalKendala][kolom];
                kolomPivotTerpilih = kolom;
            }
        }

        // Jika tidak ada lagi nilai negatif pada baris tujuan, solusi optimal sudah tercapai
        if (kolomPivotTerpilih == -1) {
            cout << "\n  -> [STOP] Semua koefisien baris tujuan sudah >= 0. Titik optimal tercapai!\n";
            selesaiOptimal = true;
            break;
        }

        cout << "\n  --- Iterasi ke-" << nomorIterasi << " ---\n";
        cout << fixed << setprecision(2);
        cout << "  1. Variabel Masuk (Kolom Pivot) : " << labelKolom[kolomPivotTerpilih]
             << " (nilai tujuan paling negatif = " << nilaiTujuanTerkecil << ")\n";

        // Langkah B: Hitung rasio pembatas untuk menentukan baris keluar
        int barisPivotTerpilih = -1;
        double rasioPembatasTerkecil = numeric_limits<double>::infinity();
        cout << "  2. Uji Rasio Pembatas (Kapasitas / Elemen Kolom Pivot):\n";

        for (int baris = 0; baris < totalKendala; baris++) {
            double elemenKolomPivot = tabelMatriks[baris][kolomPivotTerpilih];
            double nilaiKapasitasBaris = tabelMatriks[baris][totalKolomTabel];

            if (elemenKolomPivot > 1e-9) {
                double hasilRasio = nilaiKapasitasBaris / elemenKolomPivot;
                cout << "     - Baris " << labelBarisBasis[baris] << " : "
                     << nilaiKapasitasBaris << " / " << elemenKolomPivot
                     << " = " << hasilRasio << "\n";

                if (hasilRasio < rasioPembatasTerkecil - 1e-9) {
                    rasioPembatasTerkecil = hasilRasio;
                    barisPivotTerpilih = baris;
                }
            } else {
                cout << "     - Baris " << labelBarisBasis[baris] << " : Diabaikan (elemen <= 0)\n";
            }
        }

        if (barisPivotTerpilih == -1) {
            cout << "  -> [GAGAL] Tidak ditemukan batas rasio positif (Solusi tidak terbatas / Unbounded).\n";
            return false;
        }

        double angkaPivotUtama = tabelMatriks[barisPivotTerpilih][kolomPivotTerpilih];
        cout << "  3. Variabel Keluar (Baris Pivot): " << labelBarisBasis[barisPivotTerpilih]
             << " (rasio terkecil = " << rasioPembatasTerkecil << ", angka pivot = " << angkaPivotUtama << ")\n";
        cout << "  4. Eliminasi Gauss-Jordan: Mengganti basis '" << labelBarisBasis[barisPivotTerpilih]
             << "' dengan '" << labelKolom[kolomPivotTerpilih] << "'...\n";

        // Langkah C (Eliminasi Gauss-Jordan - Leading 1): Bagi baris pivot dengan angka pivot utama
        for (int kolom = 0; kolom <= totalKolomTabel; kolom++) {
            tabelMatriks[barisPivotTerpilih][kolom] /= angkaPivotUtama;
        }

        // Langkah D (Eliminasi Gauss-Jordan - Menolkan elemen kolom pivot di semua baris lain):
        for (int baris = 0; baris <= totalKendala; baris++) {
            if (baris != barisPivotTerpilih) {
                double faktorPengali = tabelMatriks[baris][kolomPivotTerpilih];
                for (int kolom = 0; kolom <= totalKolomTabel; kolom++) {
                    tabelMatriks[baris][kolom] -= faktorPengali * tabelMatriks[barisPivotTerpilih][kolom];
                }
            }
        }

        kolomBasisAktif[barisPivotTerpilih] = kolomPivotTerpilih;
        labelBarisBasis[barisPivotTerpilih] = labelKolom[kolomPivotTerpilih];

        cetakTabelMatriks(tabelMatriks, labelKolom, labelBarisBasis);
    }

    if (!selesaiOptimal) {
        cout << "  -> [GAGAL] Perhitungan melebihi batas iterasi maksimal.\n";
        return false;
    }

    // Ambil hasil jumlah produksi optimal dari baris basis akhir
    rekomendasiProduksi.assign(totalProduk, 0.0);
    for (int baris = 0; baris < totalKendala; baris++) {
        if (kolomBasisAktif[baris] >= 0 && kolomBasisAktif[baris] < totalProduk) {
            rekomendasiProduksi[kolomBasisAktif[baris]] = bersihkanNolNegatif(tabelMatriks[baris][totalKolomTabel]);
        }
    }

    // Verifikasi hasil akhir terhadap seluruh kendala
    if (!periksaKelayakanSolusi(rekomendasiProduksi, daftarNamaProduk, daftarKendala)) {
        return false;
    }

    totalKeuntunganMaksimal = 0.0;
    for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
        totalKeuntunganMaksimal += keuntunganPerUnit[indeksProduk] * rekomendasiProduksi[indeksProduk];
    }
    totalKeuntunganMaksimal = bersihkanNolNegatif(totalKeuntunganMaksimal);

    return true;
}

// ============================================================================
// FUNGSI 4: Menyimpan hasil perhitungan ke file CSV
// ============================================================================
void simpanHasilKeCSV(const vector<string> &daftarNamaProduk,
                      const vector<DataKendala> &daftarKendala,
                      const vector<double> &rekomendasiProduksi,
                      double totalKeuntunganMaksimal) {
    cout << "\n[PROSES 5] EKSPOR DATA GRAFIK KE FILE CSV\n";
    ofstream fileCSV("hasil_optimasi.csv");
    if (!fileCSV.is_open()) {
        cout << "  -> [Peringatan] Gagal membuka file 'hasil_optimasi.csv' (pastikan tidak sedang dibuka di Excel).\n";
        return;
    }

    fileCSV << fixed << setprecision(2);
    fileCSV << "Jenis_Data,Keterangan,Nilai_Produk1,Nilai_Produk2,Keuntungan_atau_Kapasitas\n";

    double jumlahProduk1 = (!rekomendasiProduksi.empty()) ? rekomendasiProduksi[0] : 0.0;
    double jumlahProduk2 = (rekomendasiProduksi.size() > 1) ? rekomendasiProduksi[1] : 0.0;
    fileCSV << "Titik_Optimal,Rekomendasi Produksi Terbaik,"
            << bersihkanNolNegatif(jumlahProduk1) << ","
            << bersihkanNolNegatif(jumlahProduk2) << ","
            << bersihkanNolNegatif(totalKeuntunganMaksimal) << "\n";
    cout << "  -> Menulis titik optimal (" << jumlahProduk1 << ", " << jumlahProduk2
         << ") dengan Z = " << totalKeuntunganMaksimal << "\n";

    if (daftarNamaProduk.size() == 2) {
        for (int indeksKendala = 0; indeksKendala < static_cast<int>(daftarKendala.size()); indeksKendala++) {
            double butuhProduk1 = daftarKendala[indeksKendala].kebutuhanPerProduk[0];
            double butuhProduk2 = daftarKendala[indeksKendala].kebutuhanPerProduk[1];
            double kapasitasMaks = daftarKendala[indeksKendala].batasKapasitas;

            double titikPotongSumbuX1 = (fabs(butuhProduk1) > 1e-9) ? bersihkanNolNegatif(kapasitasMaks / butuhProduk1) : 0.0;
            double titikPotongSumbuX2 = (fabs(butuhProduk2) > 1e-9) ? bersihkanNolNegatif(kapasitasMaks / butuhProduk2) : 0.0;

            fileCSV << "Garis_Kendala,\"" << daftarKendala[indeksKendala].namaKendala << "\","
                    << titikPotongSumbuX1 << "," << titikPotongSumbuX2 << "," << kapasitasMaks << "\n";
            cout << "  -> Menulis garis kendala '" << daftarKendala[indeksKendala].namaKendala
                 << "' (potong X1=" << titikPotongSumbuX1 << ", potong X2=" << titikPotongSumbuX2 << ")\n";
        }
    }

    fileCSV.close();
    cout << "  -> File 'hasil_optimasi.csv' berhasil disimpan.\n";
}

// ============================================================================
// PROGRAM UTAMA
// ============================================================================
int main() {
    cout << "====================================================================\n";
    cout << "   SISTEM PERENCANAAN PRODUKSI OPTIMAL (UMKM & INDUSTRI)\n";
    cout << "   Kelompok 9 - Matematika Dasar | Web: opb.keidev.my.id\n";
    cout << "   Metode: Pemrograman Linear Simpleks & Eliminasi Gauss-Jordan\n";
    cout << "====================================================================\n";
    cout << "Pilih data perencanaan:\n";
    cout << "  1. Kasus Utama: UMKM Konveksi Busana (Kemeja Batik & Tunik Modern)\n";
    cout << "  2. Kasus Roti Rumahan: Usaha Bakery (Roti Keju & Roti Coklat)\n";
    cout << "  3. Masukkan Data Usaha Baru Secara Manual\n";

    int pilihanMenu = bacaBilanganBulat("Pilih menu (1, 2, atau 3): ", 1, 3);

    int totalProduk = 0;
    vector<string> daftarNamaProduk;
    vector<string> daftarSatuanProduk;
    vector<double> keuntunganPerUnit;
    vector<DataKendala> daftarKendala;

    if (pilihanMenu == 1) {
        // Data Utama: UMKM Konveksi Karya Busana (UNNES Kelompok 9)
        totalProduk        = 2;
        daftarNamaProduk   = {"Kemeja Batik", "Tunik Modern"};
        daftarSatuanProduk = {"potong", "potong"};
        keuntunganPerUnit  = {65000.0, 85000.0};

        daftarKendala = {
            {"Bahan Baku Kain", "meter", {2.0, 2.5}, "<=", 95.0},
            {"Jam Kerja Jahit", "jam",   {3.0, 2.0}, "<=", 120.0},
            {"Mesin Bordir",    "jam",   {1.0, 2.0}, "<=", 64.0}
        };
    } else if (pilihanMenu == 2) {
        // Data Contoh Usaha Roti Rumahan
        totalProduk        = 2;
        daftarNamaProduk   = {"Roti Keju", "Roti Coklat"};
        daftarSatuanProduk = {"buah", "buah"};
        keuntunganPerUnit  = {6000.0, 5000.0};

        daftarKendala = {
            {"Tepung Terigu",              "gram",  {100.0, 100.0}, "<=", 5000.0},
            {"Gula Pasir",                 "gram",  {20.0,  30.0},  "<=", 1200.0},
            {"Waktu Pengolahan & Pengisian","menit", {3.0,   2.0},   "<=", 120.0}
        };
    } else {
        totalProduk = bacaBilanganBulat("\nBerapa jenis produk yang dibuat? (minimal 2): ", 2, 50);

        daftarNamaProduk.resize(totalProduk);
        daftarSatuanProduk.resize(totalProduk);
        keuntunganPerUnit.resize(totalProduk);

        for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
            cout << "\n--- Data Produk ke-" << (indeksProduk + 1) << " ---\n";
            daftarNamaProduk[indeksProduk]   = bacaTeks("Nama produk                : ");
            daftarSatuanProduk[indeksProduk] = bacaTeks("Satuan (contoh: potong/box): ");
            keuntunganPerUnit[indeksProduk]  = bacaBilanganDesimal("Keuntungan per unit (Rp)   : ", 0.0);
        }

        int totalKendala = bacaBilanganBulat("\nBerapa jumlah batasan/kendala usaha? (minimal 1): ", 1, 50);
        daftarKendala.resize(totalKendala);

        for (int indeksKendala = 0; indeksKendala < totalKendala; indeksKendala++) {
            cout << "\n--- Data Kendala ke-" << (indeksKendala + 1) << " ---\n";
            daftarKendala[indeksKendala].namaKendala   = bacaTeks("Nama kendala (misal: Tepung/Mesin) : ");
            daftarKendala[indeksKendala].satuanKendala = bacaTeks("Satuan (misal: kg/meter/jam)       : ");

            daftarKendala[indeksKendala].kebutuhanPerProduk.resize(totalProduk);
            for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
                string promptKebutuhan = "Kebutuhan untuk 1 " + daftarNamaProduk[indeksProduk] + " : ";
                daftarKendala[indeksKendala].kebutuhanPerProduk[indeksProduk] = bacaBilanganDesimal(promptKebutuhan, 0.0);
            }

            int pilihanJenisBatas = bacaBilanganBulat("Jenis batas (1 = Maksimal <=, 2 = Minimal >=): ", 1, 2);
            daftarKendala[indeksKendala].tandaBatas = (pilihanJenisBatas == 2) ? ">=" : "<=";

            daftarKendala[indeksKendala].batasKapasitas = bacaBilanganDesimal("Total kapasitas yang tersedia      : ", 0.0);
        }
    }

    vector<double> rekomendasiProduksi;
    double totalKeuntunganMaksimal = 0.0;
    bool solusiDitemukan = cariProduksiOptimalDenganLog(
        totalProduk, daftarNamaProduk, keuntunganPerUnit, daftarKendala, rekomendasiProduksi, totalKeuntunganMaksimal
    );

    cout << "\n====================================================================\n";
    cout << "   RINGKASAN AKHIR UNTUK KLIEN / MANAJEMEN\n";
    cout << "====================================================================\n";

    if (!solusiDitemukan) {
        cout << "STATUS: TIDAK DITEMUKAN SOLUSI YANG MEMENUHI SYARAT.\n";
        cout << "Penjelasan: Batasan/kendala yang dimasukkan saling bertentangan\n";
        cout << "atau kapasitas tidak membatasi pertumbuhan produksi.\n";
        cout << "Saran: Silakan periksa kembali angka kapasitas dan target Anda.\n";
        cout << "====================================================================\n";
        return 0;
    }

    cout << fixed << setprecision(0);
    cout << "1. Target Produksi yang Disarankan:\n";
    for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
        double labaProdukIni = bersihkanNolNegatif(rekomendasiProduksi[indeksProduk] * keuntunganPerUnit[indeksProduk]);
        cout << "   - " << daftarNamaProduk[indeksProduk] << " : "
             << bersihkanNolNegatif(rekomendasiProduksi[indeksProduk])
             << " " << daftarSatuanProduk[indeksProduk] << " (Laba: Rp " << labaProdukIni << ")\n";
    }

    cout << "\n2. Estimasi Keuntungan Maksimal: Rp " << totalKeuntunganMaksimal << "\n";

    cout << "\n3. Status Sumber Daya:\n";
    cout << fixed << setprecision(1);
    for (int indeksKendala = 0; indeksKendala < static_cast<int>(daftarKendala.size()); indeksKendala++) {
        double sumberDayaTerpakai = 0.0;
        for (int indeksProduk = 0; indeksProduk < totalProduk; indeksProduk++) {
            sumberDayaTerpakai += daftarKendala[indeksKendala].kebutuhanPerProduk[indeksProduk] * rekomendasiProduksi[indeksProduk];
        }
        sumberDayaTerpakai = bersihkanNolNegatif(sumberDayaTerpakai);
        double sisaKapasitas = bersihkanNolNegatif(daftarKendala[indeksKendala].batasKapasitas - sumberDayaTerpakai);

        cout << "   - " << daftarKendala[indeksKendala].namaKendala << ": " << sumberDayaTerpakai
             << " / " << daftarKendala[indeksKendala].batasKapasitas << " " << daftarKendala[indeksKendala].satuanKendala;

        if (fabs(sisaKapasitas) < 0.01) {
            cout << " [HABIS / BOTTLENECK]\n";
        } else if (daftarKendala[indeksKendala].tandaBatas == ">=") {
            cout << " [Target Terpenuhi, Surplus: " << fabs(sisaKapasitas) << " " << daftarKendala[indeksKendala].satuanKendala << "]\n";
        } else {
            cout << " [Sisa: " << sisaKapasitas << " " << daftarKendala[indeksKendala].satuanKendala << "]\n";
        }
    }

    if (totalProduk == 2 && daftarKendala.size() >= 2) {
        double titikPotongProduk1 = 0.0, titikPotongProduk2 = 0.0;
        // Hitung titik potong garis kendala 1 & kendala 3 (atau 1 & 2) dengan Eliminasi Gauss-Jordan
        int idxKendala2 = (daftarKendala.size() >= 3) ? 2 : 1;
        if (hitungTitikPotongSPL(
                daftarKendala[0].kebutuhanPerProduk[0], daftarKendala[0].kebutuhanPerProduk[1], daftarKendala[0].batasKapasitas,
                daftarKendala[idxKendala2].kebutuhanPerProduk[0], daftarKendala[idxKendala2].kebutuhanPerProduk[1], daftarKendala[idxKendala2].batasKapasitas,
                titikPotongProduk1, titikPotongProduk2)) {
            cout << "\n4. Verifikasi Titik Potong SPL (Eliminasi Gauss-Jordan "
                 << daftarKendala[0].namaKendala << " & " << daftarKendala[idxKendala2].namaKendala << "): ("
                 << titikPotongProduk1 << ", " << titikPotongProduk2 << ")\n";
        }
    }

    simpanHasilKeCSV(daftarNamaProduk, daftarKendala, rekomendasiProduksi, totalKeuntunganMaksimal);
    cout << "====================================================================\n";

    return 0;
}
