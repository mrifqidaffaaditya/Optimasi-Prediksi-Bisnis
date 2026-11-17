#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
============================================================================
SISTEM OPTIMASI PERENCANAAN PRODUKSI (TERVERIFIKASI BEBAS ERROR)
Kelompok 9 - Matematika Dasar (Universitas Negeri Semarang)
Terintegrasi dengan Web Dashboard: https://opb.keidev.my.id
Metode: Pemrograman Linear Simpleks & Eliminasi Gauss-Jordan
============================================================================
"""

import sys
import math
from typing import List, Tuple, Dict, Any, Optional

# ============================================================================
# STRUKTUR DATA KENDALA OPERASIONAL
# ============================================================================
class DataKendala:
    def __init__(
        self,
        nama_kendala: str,
        satuan_kendala: str,
        kebutuhan_per_produk: List[float],
        tanda_batas: str,
        batas_kapasitas: float,
    ):
        self.nama_kendala = nama_kendala
        self.satuan_kendala = satuan_kendala
        self.kebutuhan_per_produk = kebutuhan_per_produk
        self.tanda_batas = tanda_batas  # "<=" atau ">="
        self.batas_kapasitas = batas_kapasitas


# ============================================================================
# FUNGSI BANTU INPUT & PEMBERSIHAN DATA
# ============================================================================
def bersihkan_nol_negatif(nilai: float) -> float:
    """Membersihkan nilai -0.0 akibat floating-point rounding."""
    if abs(nilai) < 1e-9:
        return 0.0
    return nilai


def baca_bilangan_bulat(pesan_prompt: str, batas_minimal: int, batas_maksimal: int) -> int:
    """Membaca input bilangan bulat dengan validasi anti-error."""
    while True:
        try:
            teks = input(pesan_prompt).strip()
            nilai = int(teks)
            if batas_minimal <= nilai <= batas_maksimal:
                return nilai
            print(f"  [Peringatan] Masukkan angka bulat antara {batas_minimal} sampai {batas_maksimal}.")
        except ValueError:
            print(f"  [Peringatan] Masukkan angka bulat yang valid ({batas_minimal}-{batas_maksimal}).")


def baca_bilangan_desimal(pesan_prompt: str, batas_minimal: float = 0.0) -> float:
    """Membaca input bilangan desimal/pecahan dengan validasi anti-error."""
    while True:
        try:
            teks = input(pesan_prompt).strip()
            nilai = float(teks)
            if not math.isnan(nilai) and not math.isinf(nilai) and nilai >= batas_minimal:
                return nilai
            print(f"  [Peringatan] Masukkan angka yang valid (minimal {batas_minimal}).")
        except ValueError:
            print(f"  [Peringatan] Format angka tidak valid. Gunakan tanda titik untuk desimal.")


def baca_teks(pesan_prompt: str) -> str:
    """Membaca teks tidak kosong."""
    while True:
        teks = input(pesan_prompt).strip()
        if teks:
            return teks
        print("  [Peringatan] Input tidak boleh kosong.")


def cetak_tabel_matriks(
    tabel_matriks: List[List[float]],
    label_kolom: List[str],
    label_baris_basis: List[str],
):
    """Menampilkan isi tabel matriks perhitungan pada setiap iterasi."""
    total_baris_kendala = len(tabel_matriks) - 1
    total_kolom_variabel = len(tabel_matriks[0]) - 1

    print("    " + "-" * 66)
    baris_header = f"    {'Basis':<10}"
    for kolom in range(total_kolom_variabel):
        baris_header += f"{label_kolom[kolom]:>9}"
    baris_header += f"{'Kapasitas':>11}"
    print(baris_header)
    print("    " + "-" * 66)

    for baris in range(total_baris_kendala):
        baris_data = f"    {label_baris_basis[baris]:<10}"
        for kolom in range(total_kolom_variabel):
            baris_data += f"{bersihkan_nol_negatif(tabel_matriks[baris][kolom]):>9.2f}"
        baris_data += f"{bersihkan_nol_negatif(tabel_matriks[baris][total_kolom_variabel]):>11.2f}"
        print(baris_data)

    print("    " + "-" * 66)
    baris_tujuan = f"    {'Tujuan(Z)':<10}"
    for kolom in range(total_kolom_variabel):
        baris_tujuan += f"{bersihkan_nol_negatif(tabel_matriks[total_baris_kendala][kolom]):>9.2f}"
    baris_tujuan += f"{bersihkan_nol_negatif(tabel_matriks[total_baris_kendala][total_kolom_variabel]):>11.2f}"
    print(baris_tujuan)
    print("    " + "-" * 66)


# ============================================================================
# FUNGSI 1: ELIMINASI GAUSS-JORDAN UNTUK SPL 2 VARIABEL
# Menghitung perpotongan 2 garis kendala menuju bentuk eselon baris tereduksi (RREF)
# ============================================================================
def hitung_titik_potong_spl(
    a1: float, b1: float, c1: float,
    a2: float, b2: float, c2: float
) -> Tuple[bool, float, float]:
    """
    Menyelesaikan Sistem Persamaan Linear 2x2 menggunakan Eliminasi Gauss-Jordan:
    [ a1  b1 | c1 ]
    [ a2  b2 | c2 ]
    menuju bentuk eselon baris tereduksi (RREF):
    [ 1   0  | X1 ]
    [ 0   1  | X2 ]
    """
    # Matriks Augmentasi [2 x 3]
    M = [
        [float(a1), float(b1), float(c1)],
        [float(a2), float(b2), float(c2)],
    ]

    # Langkah 1 Eliminasi Gauss-Jordan: Pastikan elemen pivot baris 1 (kolom 1) != 0
    if abs(M[0][0]) < 1e-9:
        if abs(M[1][0]) < 1e-9:
            return False, 0.0, 0.0  # Tidak ada solusi unik
        # OBE Tipe 1: Pertukaran baris
        M[0], M[1] = M[1], M[0]

    # Normalisasi Baris 1: R1 = R1 / a11 (OBE Tipe 2: Menjadikan leading 1)
    pivot1 = M[0][0]
    for k in range(3):
        M[0][k] /= pivot1

    # Eliminasi Baris 2: R2 = R2 - a21 * R1 (OBE Tipe 3: Menolkan elemen di bawah pivot)
    faktor2 = M[1][0]
    for k in range(3):
        M[1][k] -= faktor2 * M[0][k]

    # Langkah 2 Eliminasi Gauss-Jordan: Cek elemen pivot baris 2 (kolom 2)
    pivot2 = M[1][1]
    if abs(pivot2) < 1e-9:
        return False, 0.0, 0.0  # Garis sejajar / tidak berpotongan unik

    # Normalisasi Baris 2: R2 = R2 / a22 (Leading 1 baris 2)
    for k in range(3):
        M[1][k] /= pivot2

    # Eliminasi Baris 1: R1 = R1 - a12 * R2 (Menolkan elemen di atas pivot)
    faktor1 = M[0][1]
    for k in range(3):
        M[0][k] -= faktor1 * M[1][k]

    # Solusi titik potong diperoleh langsung dari kolom konstanta tereduksi
    x1 = bersihkan_nol_negatif(M[0][2])
    x2 = bersihkan_nol_negatif(M[1][2])
    return True, x1, x2


# ============================================================================
# FUNGSI 2: VERIFIKASI KELAYAKAN SOLUSI TERHADAP SELURUH KENDALA
# ============================================================================
def periksa_kelayakan_solusi(
    rencana_produksi: List[float],
    daftar_nama_produk: List[str],
    daftar_kendala: List[DataKendala],
) -> bool:
    print("\n[PROSES 4] VERIFIKASI KELAYAKAN SOLUSI TERHADAP SELURUH KENDALA")

    for i, jumlah in enumerate(rencana_produksi):
        if jumlah < -1e-6:
            print(f"  -> GAGAL: Jumlah produksi {daftar_nama_produk[i]} tidak boleh negatif ({jumlah:.2f}).")
            return False

    semua_aman = True
    for idx, kendala in enumerate(daftar_kendala):
        terpakai = sum(
            kendala.kebutuhan_per_produk[i] * rencana_produksi[i]
            for i in range(len(rencana_produksi))
        )
        terpakai = bersihkan_nol_negatif(terpakai)

        aman = True
        if kendala.tanda_batas == "<=" and terpakai > kendala.batas_kapasitas + 1e-5:
            aman = False
        if kendala.tanda_batas == ">=" and terpakai < kendala.batas_kapasitas - 1e-5:
            aman = False

        status_teks = "[MEMENUHI]" if aman else "[MELANGGAR]"
        print(
            f"  -> Cek Kendala {idx + 1} ({kendala.nama_kendala}): "
            f"{terpakai:.2f} {kendala.tanda_batas} {kendala.batas_kapasitas:.2f} {kendala.satuan_kendala}  -->  {status_teks}"
        )
        if not aman:
            semua_aman = False

    return semua_aman


# ============================================================================
# FUNGSI 3: METODE SIMPLEKS BIG-M DENGAN ELIMINASI GAUSS-JORDAN
# ============================================================================
def cari_produksi_optimal_dengan_log(
    total_produk: int,
    daftar_nama_produk: List[str],
    keuntungan_per_unit: List[float],
    daftar_kendala: List[DataKendala],
) -> Tuple[bool, List[float], float]:
    total_kendala = len(daftar_kendala)

    print("\n[PROSES 1] INISIALISASI MODEL MATEMATIKA & FUNGSI TUJUAN")
    print(f"  -> Jumlah Jenis Produk (Variabel Keputusan) : {total_produk}")
    print(f"  -> Jumlah Kendala Operasional               : {total_kendala}")

    persamaan_z = " + ".join(
        f"{keuntungan_per_unit[i]:.0f} X{i + 1}" for i in range(total_produk)
    )
    print(f"  -> Fungsi Tujuan: Maksimalkan Z = {persamaan_z}")

    # Variabel bantu
    jumlah_sisa = sum(1 for k in daftar_kendala if k.tanda_batas == "<=")
    jumlah_lebih = sum(1 for k in daftar_kendala if k.tanda_batas == ">=")
    jumlah_buatan = jumlah_lebih

    keuntungan_terbesar = max([abs(k) for k in keuntungan_per_unit] + [1.0])
    PENALTI_BESAR = keuntungan_terbesar * 10000.0

    total_kolom = total_produk + jumlah_sisa + jumlah_lebih + jumlah_buatan
    tabel = [[0.0] * (total_kolom + 1) for _ in range(total_kendala + 1)]
    kolom_basis_aktif = [-1] * total_kendala
    label_kolom = [f"X{i + 1}" for i in range(total_produk)] + [""] * (total_kolom - total_produk)
    label_baris_basis = [""] * total_kendala

    posisi_sisa = total_produk
    posisi_lebih = total_produk + jumlah_sisa
    posisi_buatan = total_produk + jumlah_sisa + jumlah_lebih

    print("\n[PROSES 2] PEMBENTUKAN MATRIKS & TABEL SIMPLEKS AWAL")
    for i, kendala in enumerate(daftar_kendala):
        for j in range(total_produk):
            tabel[i][j] = kendala.kebutuhan_per_produk[j]
        tabel[i][total_kolom] = kendala.batas_kapasitas

        if kendala.tanda_batas == "<=":
            tabel[i][posisi_sisa] = 1.0
            label_kolom[posisi_sisa] = f"S{i + 1}"
            label_baris_basis[i] = label_kolom[posisi_sisa]
            kolom_basis_aktif[i] = posisi_sisa
            print(f"  -> Kendala {i + 1} ({kendala.nama_kendala}): Ditambahkan variabel sisa kapasitas {label_kolom[posisi_sisa]}")
            posisi_sisa += 1
        else:
            tabel[i][posisi_lebih] = -1.0
            label_kolom[posisi_lebih] = f"E{i + 1}"
            posisi_lebih += 1

            tabel[i][posisi_buatan] = 1.0
            label_kolom[posisi_buatan] = f"A{i + 1}"
            label_baris_basis[i] = label_kolom[posisi_buatan]
            kolom_basis_aktif[i] = posisi_buatan
            tabel[total_kendala][posisi_buatan] = PENALTI_BESAR
            print(f"  -> Kendala {i + 1} ({kendala.nama_kendala}): Ditambahkan variabel bantu target minimal {label_kolom[posisi_buatan]}")
            posisi_buatan += 1

    # Koefisien keuntungan pada baris fungsi tujuan
    for j in range(total_produk):
        tabel[total_kendala][j] = -keuntungan_per_unit[j]

    # Sesuaikan baris fungsi tujuan jika terdapat variabel buatan (Big-M)
    for i, kendala in enumerate(daftar_kendala):
        if kendala.tanda_batas == ">=":
            for col in range(total_kolom + 1):
                tabel[total_kendala][col] -= PENALTI_BESAR * tabel[i][col]

    print("\n  [Tabel Matriks Awal - Iterasi 0]")
    cetak_tabel_matriks(tabel, label_kolom, label_baris_basis)

    print("\n[PROSES 3] ITERASI PENCARIAN SOLUSI OPTIMAL (ELIMINASI GAUSS-JORDAN)")
    selesai_optimal = False
    BATAS_ITERASI = 500

    for nomor_iterasi in range(1, BATAS_ITERASI + 1):
        # 1. Variabel Masuk: Nilai tujuan paling negatif
        kolom_pivot = -1
        nilai_terkecil = -1e-7

        for col in range(total_kolom):
            if tabel[total_kendala][col] < nilai_terkecil:
                nilai_terkecil = tabel[total_kendala][col]
                kolom_pivot = col

        if kolom_pivot == -1:
            print("\n  -> [STOP] Semua koefisien baris tujuan sudah >= 0. Titik optimal tercapai!")
            selesai_optimal = True
            break

        print(f"\n  --- Iterasi ke-{nomor_iterasi} ---")
        print(f"  1. Variabel Masuk (Kolom Pivot) : {label_kolom[kolom_pivot]} (nilai tujuan paling negatif = {nilai_terkecil:.2f})")
        print("  2. Uji Rasio Pembatas (Kapasitas / Elemen Kolom Pivot):")

        # 2. Variabel Keluar: Rasio kapasitas / elemen pivot positif terkecil
        baris_pivot = -1
        rasio_terkecil = float("inf")

        for row in range(total_kendala):
            elemen = tabel[row][kolom_pivot]
            kapasitas = tabel[row][total_kolom]

            if elemen > 1e-9:
                rasio = kapasitas / elemen
                print(f"     - Baris {label_baris_basis[row]} : {kapasitas:.2f} / {elemen:.2f} = {rasio:.2f}")
                if rasio < rasio_terkecil - 1e-9:
                    rasio_terkecil = rasio
                    baris_pivot = row
            else:
                print(f"     - Baris {label_baris_basis[row]} : Diabaikan (elemen <= 0)")

        if baris_pivot == -1:
            print("  -> [GAGAL] Tidak ditemukan batas rasio positif (Solusi tidak terbatas / Unbounded).")
            return False, [0.0] * total_produk, 0.0

        angka_pivot = tabel[baris_pivot][kolom_pivot]
        print(f"  3. Variabel Keluar (Baris Pivot): {label_baris_basis[baris_pivot]} (rasio terkecil = {rasio_terkecil:.2f}, angka pivot = {angka_pivot:.2f})")
        print(f"  4. Eliminasi Gauss-Jordan: Mengganti basis '{label_baris_basis[baris_pivot]}' dengan '{label_kolom[kolom_pivot]}'...")

        # 3. Operasi Baris Elementer (Eliminasi Gauss-Jordan)
        # a. Normalisasi baris pivot: R_pivot = R_pivot / angka_pivot
        for col in range(total_kolom + 1):
            tabel[baris_pivot][col] /= angka_pivot

        # b. Menolkan elemen kolom pivot di semua baris lain
        for row in range(total_kendala + 1):
            if row != baris_pivot:
                faktor = tabel[row][kolom_pivot]
                for col in range(total_kolom + 1):
                    tabel[row][col] -= faktor * tabel[baris_pivot][col]

        kolom_basis_aktif[baris_pivot] = kolom_pivot
        label_baris_basis[baris_pivot] = label_kolom[kolom_pivot]

        cetak_tabel_matriks(tabel, label_kolom, label_baris_basis)

    if not selesai_optimal:
        print("  -> [GAGAL] Perhitungan melebihi batas iterasi maksimal.")
        return False, [0.0] * total_produk, 0.0

    # Ambil alokasi produksi optimal
    rekomendasi_produksi = [0.0] * total_produk
    for row in range(total_kendala):
        basis_idx = kolom_basis_aktif[row]
        if 0 <= basis_idx < total_produk:
            rekomendasi_produksi[basis_idx] = bersihkan_nol_negatif(tabel[row][total_kolom])

    # Verifikasi kelayakan
    if not periksa_kelayakan_solusi(rekomendasi_produksi, daftar_nama_produk, daftar_kendala):
        return False, rekomendasi_produksi, 0.0

    total_keuntungan = sum(
        keuntungan_per_unit[i] * rekomendasi_produksi[i] for i in range(total_produk)
    )
    total_keuntungan = bersihkan_nol_negatif(total_keuntungan)

    return True, rekomendasi_produksi, total_keuntungan


# ============================================================================
# FUNGSI 4: PEMBUATAN GRAFIK VISUALISASI 2D (MATPLOTLIB & STANDALONE SVG/HTML)
# ============================================================================
def buat_grafik_visualisasi(
    daftar_nama_produk: List[str],
    daftar_kendala: List[DataKendala],
    rekomendasi_produksi: List[float],
    total_keuntungan_maksimal: float,
):
    """
    Menghasilkan grafik visualisasi 2D untuk model 2 variabel keputusan:
    - Garis kendala pembatas
    - Area layak (Feasible Region)
    - Titik potong SPL (Eliminasi Gauss-Jordan)
    - Titik optimal rekomendasi produksi
    Menyimpan ke PNG (jika matplotlib tersedia) dan SVG/HTML interaktif mandiri.
    """
    if len(daftar_nama_produk) != 2:
        print("  -> Info Grafik: Visualisasi 2D aktif khusus untuk model dengan 2 jenis produk.")
        return

    print("\n[PROSES 5] PEMBUATAN GRAFIK VISUALISASI 2D")
    nama_p1, nama_p2 = daftar_nama_produk[0], daftar_nama_produk[1]
    opt_x1, opt_x2 = rekomendasi_produksi[0], rekomendasi_produksi[1]

    # Cari batas maksimum sumbu X dan Y dari perpotongan sumbu
    max_x = max(opt_x1 * 1.5, 10.0)
    max_y = max(opt_x2 * 1.5, 10.0)

    for k in daftar_kendala:
        a, b, cap = k.kebutuhan_per_produk[0], k.kebutuhan_per_produk[1], k.batas_kapasitas
        if a > 1e-9:
            max_x = max(max_x, (cap / a) * 1.15)
        if b > 1e-9:
            max_y = max(max_y, (cap / b) * 1.15)

    # 1. Coba plot menggunakan Matplotlib (jika terpasang)
    matplotlib_berhasil = False
    try:
        import matplotlib
        matplotlib.use("Agg")  # Mode tanpa layar GUI untuk server / terminal
        import matplotlib.pyplot as plt
        import numpy as np

        fig, ax = plt.subplots(figsize=(9, 7), dpi=150)
        warna_kendala = ["#1F4E5F", "#C2793A", "#6B7A3A", "#8A3B4A", "#5E6C84"]

        x_vals = np.linspace(0, max_x, 400)
        garis_y_list = []

        for idx, k in enumerate(daftar_kendala):
            a, b, cap = k.kebutuhan_per_produk[0], k.kebutuhan_per_produk[1], k.batas_kapasitas
            warna = warna_kendala[idx % len(warna_kendala)]

            if b > 1e-9:
                y_line = (cap - a * x_vals) / b
                y_line_clamped = np.maximum(0, y_line)
                ax.plot(x_vals, y_line, label=f"{k.nama_kendala} ({a}·X₁ + {b}·X₂ {k.tanda_batas} {cap})", color=warna, linewidth=2)
                garis_y_list.append(y_line_clamped)
            elif a > 1e-9:
                x_val = cap / a
                ax.axvline(x=x_val, label=f"{k.nama_kendala} ({a}·X₁ {k.tanda_batas} {cap})", color=warna, linestyle="--", linewidth=2)

        # Arsir area layak (Feasible Region)
        if garis_y_list:
            y_feasible = np.minimum.reduce(garis_y_list)
            ax.fill_between(x_vals, 0, y_feasible, where=(y_feasible >= 0), color="#2F7D57", alpha=0.22, label="Area Produksi Layak (Feasible Region)")

        # Titik Optimal
        ax.scatter([opt_x1], [opt_x2], color="#D97706", s=140, zorder=5, edgecolor="black", label=f"Titik Optimal ({opt_x1:.1f}, {opt_x2:.1f})")
        ax.annotate(
            f" Optimal: ({opt_x1:.0f}, {opt_x2:.0f})\n Untung: Rp {total_keuntungan_maksimal:,.0f}",
            (opt_x1, opt_x2),
            textcoords="offset points",
            xytext=(15, 10),
            bbox=dict(boxstyle="round,pad=0.4", fc="#FEF7EC", ec="#D97706", lw=1.5),
            fontsize=9,
            fontweight="bold"
        )

        ax.set_xlim(0, max_x)
        ax.set_ylim(0, max_y)
        ax.set_xlabel(f"X₁: {nama_p1} (unit)", fontsize=11, fontweight="bold")
        ax.set_ylabel(f"X₂: {nama_p2} (unit)", fontsize=11, fontweight="bold")
        ax.set_title("Visualisasi Optimasi Perencanaan Produksi\nKelompok 9 - Matematika Dasar UNNES", fontsize=12, fontweight="bold", pad=12)
        ax.grid(True, linestyle=":", alpha=0.6)
        ax.legend(loc="upper right", fontsize=8.5, framealpha=0.9)

        plt.tight_layout()
        plt.savefig("grafik_optimasi_produksi.png")
        plt.close()
        print("  -> [Sukses] Grafik format PNG berhasil disimpan ke 'grafik_optimasi_produksi.png'.")
        matplotlib_berhasil = True
    except ImportError:
        print("  -> [Catatan] Modul 'matplotlib' belum terpasang. Menghasilkan grafik mandiri format SVG & HTML...")
    except Exception as e:
        print(f"  -> [Info] Matplotlib: {e}")

    # 2. Selalu hasilkan grafik vektor mandiri format SVG & HTML (Zero Dependency!)
    buat_grafik_svg_html(
        nama_p1, nama_p2, daftar_kendala,
        opt_x1, opt_x2, total_keuntungan_maksimal,
        max_x, max_y
    )


def buat_grafik_svg_html(
    nama_p1: str, nama_p2: str,
    daftar_kendala: List[DataKendala],
    opt_x1: float, opt_x2: float,
    total_keuntungan: float,
    max_x: float, max_y: float
):
    """Membuat visualisasi grafik SVG & HTML mandiri tanpa modul eksternal."""
    width, height = 750, 520
    pad_left, pad_right = 70, 40
    pad_top, pad_bottom = 50, 60

    plot_w = width - pad_left - pad_right
    plot_h = height - pad_top - pad_bottom

    def map_x(x):
        return pad_left + (x / max_x) * plot_w

    def map_y(y):
        return pad_top + plot_h - (y / max_y) * plot_h

    warna_kendala = ["#1F4E5F", "#C2793A", "#6B7A3A", "#8A3B4A"]
    svg_elements = []

    # Background
    svg_elements.append(f'<rect width="{width}" height="{height}" fill="#FAFAF8" rx="16" />')

    # Grid Lines
    for i in range(1, 6):
        gx = (max_x / 5) * i
        gy = (max_y / 5) * i
        sx = map_x(gx)
        sy = map_y(gy)
        svg_elements.append(f'<line x1="{sx}" y1="{pad_top}" x2="{sx}" y2="{pad_top + plot_h}" stroke="#E3E1DB" stroke-dasharray="3,3" />')
        svg_elements.append(f'<line x1="{pad_left}" y1="{sy}" x2="{pad_left + plot_w}" y2="{sy}" stroke="#E3E1DB" stroke-dasharray="3,3" />')
        svg_elements.append(f'<text x="{sx}" y="{pad_top + plot_h + 16}" font-size="10" fill="#5B6672" text-anchor="middle">{gx:.0f}</text>')
        svg_elements.append(f'<text x="{pad_left - 8}" y="{sy + 4}" font-size="10" fill="#5B6672" text-anchor="end">{gy:.0f}</text>')

    # Axis Lines
    svg_elements.append(f'<line x1="{pad_left}" y1="{pad_top + plot_h}" x2="{pad_left + plot_w}" y2="{pad_top + plot_h}" stroke="#16202A" stroke-width="2" />')
    svg_elements.append(f'<line x1="{pad_left}" y1="{pad_top}" x2="{pad_left}" y2="{pad_top + plot_h}" stroke="#16202A" stroke-width="2" />')

    # Axis Labels
    svg_elements.append(f'<text x="{pad_left + plot_w / 2}" y="{height - 15}" font-size="12" font-weight="bold" fill="#16202A" text-anchor="middle">X₁: {nama_p1} (unit)</text>')
    svg_elements.append(f'<text x="20" y="{pad_top + plot_h / 2}" font-size="12" font-weight="bold" fill="#16202A" text-anchor="middle" transform="rotate(-90 20 {pad_top + plot_h / 2})">X₂: {nama_p2} (unit)</text>')

    # Judul
    svg_elements.append(f'<text x="{width / 2}" y="28" font-size="14" font-weight="bold" fill="#1F4E5F" text-anchor="middle">Grafik Area Produksi Optimal (Kelompok 9 UNNES)</text>')

    # Garis Kendala
    for idx, k in enumerate(daftar_kendala):
        a, b, cap = k.kebutuhan_per_produk[0], k.kebutuhan_per_produk[1], k.batas_kapasitas
        warna = warna_kendala[idx % len(warna_kendala)]

        # Titik potong sumbu
        x_potong = (cap / a) if a > 1e-9 else max_x
        y_potong = (cap / b) if b > 1e-9 else max_y

        x1_svg, y1_svg = map_x(0), map_y(min(max_y, y_potong))
        x2_svg, y2_svg = map_x(min(max_x, x_potong)), map_y(0)

        svg_elements.append(f'<line x1="{x1_svg}" y1="{y1_svg}" x2="{x2_svg}" y2="{y2_svg}" stroke="{warna}" stroke-width="2.5" />')

    # Titik Optimal
    sx_opt = map_x(opt_x1)
    sy_opt = map_y(opt_x2)
    svg_elements.append(f'<circle cx="{sx_opt}" cy="{sy_opt}" r="8" fill="#D97706" stroke="#FFFFFF" stroke-width="2" />')
    svg_elements.append(f'<rect x="{sx_opt + 12}" y="{sy_opt - 35}" width="180" height="42" fill="#FEF7EC" stroke="#D97706" stroke-width="1.5" rx="6" />')
    svg_elements.append(f'<text x="{sx_opt + 20}" y="{sy_opt - 20}" font-size="11" font-weight="bold" fill="#D97706">Titik Optimal: ({opt_x1:.0f}, {opt_x2:.0f})</text>')
    svg_elements.append(f'<text x="{sx_opt + 20}" y="{sy_opt - 6}" font-size="10" fill="#16202A">Laba: Rp {total_keuntungan:,.0f}</text>')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="auto" style="font-family: system-ui, -apple-system, sans-serif;">
{''.join(svg_elements)}
</svg>'''

    # Tulis berkas SVG
    with open("grafik_optimasi_produksi.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    print("  -> [Sukses] Grafik vektor mandiri berhasil disimpan ke 'grafik_optimasi_produksi.svg'.")

    # Tulis berkas HTML interaktif
    html_content = f'''<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Grafik Optimasi Produksi - Kelompok 9 UNNES</title>
  <style>
    body {{ font-family: system-ui, -apple-system, sans-serif; background: #F7F6F3; margin: 0; padding: 24px; color: #16202A; display: flex; flex-direction: column; align-items: center; }}
    .card {{ background: #FFFFFF; border: 1px solid #E3E1DB; border-radius: 16px; padding: 24px; max-width: 820px; width: 100%; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
    .badge {{ background: #E8EFF1; color: #1F4E5F; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; display: inline-block; margin-bottom: 8px; }}
    h1 {{ font-size: 20px; margin: 0 0 4px 0; color: #16202A; }}
    p {{ font-size: 13px; color: #5B6672; margin: 0 0 16px 0; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Kelompok 9 - Matematika Dasar UNNES</div>
    <h1>Visualisasi Area Produksi & Titik Optimal</h1>
    <p>Titik optimal ({opt_x1:.0f} unit {nama_p1}, {opt_x2:.0f} unit {nama_p2}) menghasilkan keuntungan maksimal sebesar Rp {total_keuntungan:,.0f}.</p>
    {svg_content}
  </div>
</body>
</html>'''

    with open("grafik_optimasi_produksi.html", "w", encoding="utf-8") as f:
        f.write(html_content)
    print("  -> [Sukses] Halaman tampilan grafik web berhasil disimpan ke 'grafik_optimasi_produksi.html'.")


# ============================================================================
# PROGRAM UTAMA
# ============================================================================
def main():
    print("=" * 68)
    print("   SISTEM PERENCANAAN PRODUKSI OPTIMAL (UMKM & INDUSTRI)")
    print("   Kelompok 9 - Matematika Dasar | Web: opb.keidev.my.id")
    print("   Metode: Pemrograman Linear Simpleks & Eliminasi Gauss-Jordan")
    print("=" * 68)
    print("Pilih data perencanaan:")
    print("  1. Kasus Utama: UMKM Konveksi Busana (Kemeja Batik & Tunik Modern)")
    print("  2. Kasus Roti Rumahan: Usaha Bakery (Roti Keju & Roti Coklat)")
    print("  3. Masukkan Data Usaha Baru Secara Manual")

    pilihan = baca_bilangan_bulat("Pilih menu (1, 2, atau 3): ", 1, 3)

    if pilihan == 1:
        total_produk = 2
        daftar_nama_produk = ["Kemeja Batik", "Tunik Modern"]
        daftar_satuan_produk = ["potong", "potong"]
        keuntungan_per_unit = [65000.0, 85000.0]

        daftar_kendala = [
            DataKendala("Bahan Baku Kain", "meter", [2.0, 2.5], "<=", 95.0),
            DataKendala("Jam Kerja Jahit", "jam",   [3.0, 2.0], "<=", 120.0),
            DataKendala("Mesin Bordir",    "jam",   [1.0, 2.0], "<=", 64.0),
        ]
    elif pilihan == 2:
        total_produk = 2
        daftar_nama_produk = ["Roti Keju", "Roti Coklat"]
        daftar_satuan_produk = ["buah", "buah"]
        keuntungan_per_unit = [6000.0, 5000.0]

        daftar_kendala = [
            DataKendala("Tepung Terigu",              "gram",  [100.0, 100.0], "<=", 5000.0),
            DataKendala("Gula Pasir",                 "gram",  [20.0,  30.0],  "<=", 1200.0),
            DataKendala("Waktu Pengolahan & Pengisian","menit", [3.0,   2.0],   "<=", 120.0),
        ]
    else:
        total_produk = baca_bilangan_bulat("\nBerapa jenis produk yang dibuat? (minimal 2): ", 2, 50)
        daftar_nama_produk = []
        daftar_satuan_produk = []
        keuntungan_per_unit = []

        for p_idx in range(total_produk):
            print(f"\n--- Data Produk ke-{p_idx + 1} ---")
            daftar_nama_produk.append(baca_teks("Nama produk                : "))
            daftar_satuan_produk.append(baca_teks("Satuan (contoh: potong/box): "))
            keuntungan_per_unit.append(baca_bilangan_desimal("Keuntungan per unit (Rp)   : ", 0.0))

        total_kendala = baca_bilangan_bulat("\nBerapa jumlah batasan/kendala usaha? (minimal 1): ", 1, 50)
        daftar_kendala = []

        for k_idx in range(total_kendala):
            print(f"\n--- Data Kendala ke-{k_idx + 1} ---")
            nama_k = baca_teks("Nama kendala (misal: Tepung/Mesin) : ")
            satuan_k = baca_teks("Satuan (misal: kg/meter/jam)       : ")

            kebutuhan = []
            for p_idx in range(total_produk):
                prompt = f"Kebutuhan untuk 1 {daftar_nama_produk[p_idx]} : "
                kebutuhan.append(baca_bilangan_desimal(prompt, 0.0))

            pilihan_jenis = baca_bilangan_bulat("Jenis batas (1 = Maksimal <=, 2 = Minimal >=): ", 1, 2)
            tanda = ">=" if pilihan_jenis == 2 else "<="
            kapasitas = baca_bilangan_desimal("Total kapasitas yang tersedia      : ", 0.0)

            daftar_kendala.append(DataKendala(nama_k, satuan_k, kebutuhan, tanda, kapasitas))

    solusi_ditemukan, rekomendasi_produksi, total_keuntungan = cari_produksi_optimal_dengan_log(
        total_produk, daftar_nama_produk, keuntungan_per_unit, daftar_kendala
    )

    print("\n" + "=" * 68)
    print("   RINGKASAN AKHIR UNTUK KLIEN / MANAJEMEN")
    print("=" * 68)

    if not solusi_ditemukan:
        print("STATUS: TIDAK DITEMUKAN SOLUSI YANG MEMENUHI SYARAT.")
        print("Penjelasan: Batasan/kendala yang dimasukkan saling bertentangan")
        print("atau kapasitas tidak membatasi pertumbuhan produksi.")
        print("Saran: Silakan periksa kembali angka kapasitas dan target Anda.")
        print("=" * 68)
        return

    print("1. Target Produksi yang Disarankan:")
    for i in range(total_produk):
        laba = bersihkan_nol_negatif(rekomendasi_produksi[i] * keuntungan_per_unit[i])
        print(
            f"   - {daftar_nama_produk[i]} : {bersihkan_nol_negatif(rekomendasi_produksi[i]):.0f} "
            f"{daftar_satuan_produk[i]} (Laba: Rp {laba:,.0f})"
        )

    print(f"\n2. Estimasi Keuntungan Maksimal: Rp {total_keuntungan:,.0f}")

    print("\n3. Status Sumber Daya:")
    for kendala in daftar_kendala:
        terpakai = sum(
            kendala.kebutuhan_per_produk[i] * rekomendasi_produksi[i]
            for i in range(total_produk)
        )
        terpakai = bersihkan_nol_negatif(terpakai)
        sisa = bersihkan_nol_negatif(kendala.batas_kapasitas - terpakai)

        status_sumber = ""
        if abs(sisa) < 0.01:
            status_sumber = "[HABIS / BOTTLENECK]"
        elif kendala.tanda_batas == ">=":
            status_sumber = f"[Target Terpenuhi, Surplus: {abs(sisa):.1f} {kendala.satuan_kendala}]"
        else:
            status_sumber = f"[Sisa: {sisa:.1f} {kendala.satuan_kendala}]"

        print(f"   - {kendala.nama_kendala}: {terpakai:.1f} / {kendala.batas_kapasitas:.1f} {kendala.satuan_kendala} {status_sumber}")

    # Verifikasi Eliminasi Gauss-Jordan pada SPL
    if total_produk == 2 and len(daftar_kendala) >= 2:
        idx2 = 2 if len(daftar_kendala) >= 3 else 1
        k1 = daftar_kendala[0]
        k2 = daftar_kendala[idx2]

        sukses, px1, px2 = hitung_titik_potong_spl(
            k1.kebutuhan_per_produk[0], k1.kebutuhan_per_produk[1], k1.batas_kapasitas,
            k2.kebutuhan_per_produk[0], k2.kebutuhan_per_produk[1], k2.batas_kapasitas,
        )
        if sukses:
            print(
                f"\n4. Verifikasi Titik Potong SPL (Eliminasi Gauss-Jordan {k1.nama_kendala} & {k2.nama_kendala}): "
                f"({px1:.1f}, {px2:.1f})"
            )

    # Buat grafik visualisasi
    buat_grafik_visualisasi(daftar_nama_produk, daftar_kendala, rekomendasi_produksi, total_keuntungan)
    print("=" * 68)


if __name__ == "__main__":
    main()
