import { BusinessTemplate } from '@/types';

export const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  {
    id: 'fnb-bakery',
    name: 'Produksi F&B (Bakery & Kue)',
    category: 'Manufaktur & Kuliner',
    description: 'Menentukan jumlah produksi Roti Tawar dan Roti Manis terbaik berdasarkan ketersediaan tepung, mentega, dan jam kerja oven.',
    objective: 'MAXIMIZE_PROFIT',
    products: [
      {
        id: 'p1',
        name: 'Roti Tawar',
        profit: 6000,
        unit: 'bungkus',
        integerOnly: true,
      },
      {
        id: 'p2',
        name: 'Roti Manis',
        profit: 9000,
        unit: 'bungkus',
        integerOnly: true,
      },
    ],
    resources: [
      {
        id: 'r1',
        name: 'Tepung Terigu',
        capacity: 120,
        unit: 'kg',
        type: 'LEQ',
      },
      {
        id: 'r2',
        name: 'Mentega',
        capacity: 45,
        unit: 'kg',
        type: 'LEQ',
      },
      {
        id: 'r3',
        name: 'Kapasitas Oven',
        capacity: 50,
        unit: 'jam',
        type: 'LEQ',
      },
    ],
    usage: {
      p1: {
        r1: 0.25, // 0.25 kg tepung per roti tawar
        r2: 0.05, // 0.05 kg mentega
        r3: 0.08, // 0.08 jam oven
      },
      p2: {
        r1: 0.2,  // 0.2 kg tepung per roti manis
        r2: 0.12, // 0.12 kg mentega
        r3: 0.1,  // 0.1 jam oven
      },
    },
  },
  {
    id: 'marketing-budget',
    name: 'Alokasi Anggaran Pemasaran',
    category: 'Pemasaran & Digital',
    description: 'Optimasi pembagian anggaran antara Iklan Media Sosial dan Kerjasama Influencer untuk mendapatkan prospek (leads) maksimal.',
    objective: 'MAXIMIZE_PROFIT',
    products: [
      {
        id: 'p1',
        name: 'Iklan Media Sosial',
        profit: 140, // 140 prospek per paket Rp 1 jt
        unit: 'paket juta',
        integerOnly: false,
      },
      {
        id: 'p2',
        name: 'Endorsement Influencer',
        profit: 220, // 220 prospek per paket Rp 1 jt
        unit: 'slot tayang',
        integerOnly: true,
      },
    ],
    resources: [
      {
        id: 'r1',
        name: 'Total Anggaran',
        capacity: 30, // 30 juta
        unit: 'juta Rp',
        type: 'LEQ',
      },
      {
        id: 'r2',
        name: 'Jam Tim Kreatif',
        capacity: 120,
        unit: 'jam',
        type: 'LEQ',
      },
      {
        id: 'r3',
        name: 'Batas Slot Influencer',
        capacity: 10,
        unit: 'slot',
        type: 'LEQ',
      },
    ],
    usage: {
      p1: {
        r1: 1, // 1 juta per paket iklan
        r2: 3, // 3 jam review konten
        r3: 0,
      },
      p2: {
        r1: 2.5, // 2.5 juta per endorsement
        r2: 8,   // 8 jam koordinasi & revisi
        r3: 1,   // 1 slot
      },
    },
  },
  {
    id: 'warehouse-distribution',
    name: 'Distribusi & Kapasitas Gudang',
    category: 'Logistik & Distribusi',
    description: 'Menyeimbangkan alokasi ruang gudang dan armada pengiriman antara Produk Retail A dan Produk Retail B.',
    objective: 'MAXIMIZE_PROFIT',
    products: [
      {
        id: 'p1',
        name: 'Paket Retail A',
        profit: 25000,
        unit: 'karton',
        integerOnly: true,
      },
      {
        id: 'p2',
        name: 'Paket Retail B (Premium)',
        profit: 48000,
        unit: 'karton',
        integerOnly: true,
      },
    ],
    resources: [
      {
        id: 'r1',
        name: 'Ruang Palet Gudang',
        capacity: 650,
        unit: 'm³',
        type: 'LEQ',
      },
      {
        id: 'r2',
        name: 'Kapasitas Muat Armada',
        capacity: 900,
        unit: 'kg',
        type: 'LEQ',
      },
      {
        id: 'r3',
        name: 'Waktu Bongkar Muat',
        capacity: 80,
        unit: 'jam kerja',
        type: 'LEQ',
      },
    ],
    usage: {
      p1: {
        r1: 0.4,
        r2: 1.2,
        r3: 0.1,
      },
      p2: {
        r1: 0.8,
        r2: 1.5,
        r3: 0.15,
      },
    },
  },
];
