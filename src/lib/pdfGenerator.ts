import { jsPDF } from 'jspdf';
import { AppState, Transaction } from '../types';
import { formatIDR } from './utils';

// Page-overflow and clean alignment tracking layout manager
class DocManager {
  doc: jsPDF;
  y: number;
  margin: number = 54; // Standard 0.75 in margin in points
  maxY: number = 841.89 - 54; // A4 height subtract margin
  pageWidth: number = 595.28; // A4 width in points
  pageHeight: number = 841.89; // A4 height in points

  constructor(doc: jsPDF) {
    this.doc = doc;
    this.y = 54;
  }

  checkPageOverflow(requiredHeight: number): boolean {
    if (this.y + requiredHeight > this.maxY) {
      this.doc.addPage();
      this.y = 54;
      return true;
    }
    return false;
  }

  addY(amount: number) {
    this.y += amount;
  }

  line() {
    this.checkPageOverflow(15);
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 15;
  }
}

// Map transaction to requested report categories (Makan, Kos, Transportasi, Pulsa & Internet, Top Up Game, Belanja, Lainnya)
export function getReportCategory(category: string, tag: string): string {
  const t = (tag || '').trim().toLowerCase();
  const cat = (category || '').trim().toLowerCase();

  if (cat === 'pemasukan') {
    return 'Pemasukan';
  }

  if (t === 'makan' || t === 'jajan') {
    return 'Makan';
  }
  if (t === 'kos' || t === 'listrik' || t === 'listrik/air') {
    return 'Kos';
  }
  if (t === 'transport' || t === 'transportasi') {
    return 'Transportasi';
  }
  if (t.includes('pulsa') || t.includes('internet') || t.includes('kuota') || t.includes('wifi')) {
    return 'Pulsa & Internet';
  }
  if (t.includes('game') || t.includes('top up') || t.includes('topup') || t.includes('steam')) {
    return 'Top Up Game';
  }
  if (t === 'belanja') {
    return 'Belanja';
  }

  // default 'wajib' category maps to Kos
  if (cat === 'wajib') {
    return 'Kos';
  }

  return 'Lainnya';
}

function drawSimpleTable(
  mgr: DocManager,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  colAlign: ('left' | 'right')[]
) {
  const doc = mgr.doc;
  const startX = mgr.margin;
  const rowHeight = 20;

  // 1. Draw header row
  mgr.checkPageOverflow(rowHeight + 10);

  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  // Draw header top border line
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  doc.line(startX, mgr.y, startX + colWidths.reduce((a, b) => a + b, 0), mgr.y);

  // Draw header text
  let currentX = startX;
  headers.forEach((header, idx) => {
    const w = colWidths[idx];
    const align = colAlign[idx] || 'left';
    const textX = align === 'left' ? currentX + 6 : currentX + w - 6;
    doc.text(header, textX, mgr.y + 13, { align });
    currentX += w;
  });

  mgr.addY(rowHeight);

  // Draw header bottom line
  doc.setLineWidth(1);
  doc.line(startX, mgr.y, startX + colWidths.reduce((a, b) => a + b, 0), mgr.y);

  // 2. Draw data rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);

  rows.forEach((row) => {
    const didPageBreak = mgr.checkPageOverflow(rowHeight);
    if (didPageBreak) {
      // Re-draw headers on new page
      doc.setFont('Helvetica-Bold', 'bold');
      doc.setFontSize(9);
      doc.setLineWidth(1);
      doc.setDrawColor(0, 0, 0);
      doc.line(startX, mgr.y, startX + colWidths.reduce((a, b) => a + b, 0), mgr.y);

      let subX = startX;
      headers.forEach((header, idx) => {
        const w = colWidths[idx];
        const align = colAlign[idx] || 'left';
        const textX = align === 'left' ? subX + 6 : subX + w - 6;
        doc.text(header, textX, mgr.y + 13, { align });
        subX += w;
      });
      mgr.addY(rowHeight);
      doc.line(startX, mgr.y, startX + colWidths.reduce((a, b) => a + b, 0), mgr.y);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
    }

    // Draw row cell values
    let cellX = startX;
    row.forEach((cell, idx) => {
      const w = colWidths[idx];
      const align = colAlign[idx] || 'left';
      const textX = align === 'left' ? cellX + 6 : cellX + w - 6;

      let printVal = cell;
      const maxTextWidth = w - 12;
      if (doc.getTextWidth(printVal) > maxTextWidth) {
        printVal = doc.splitTextToSize(printVal, maxTextWidth)[0] + '...';
      }

      doc.text(printVal, textX, mgr.y + 13, { align });
      cellX += w;
    });

    mgr.addY(rowHeight);

    // Draw row bottom line
    doc.setLineWidth(0.5);
    doc.setDrawColor(180, 180, 180);
    doc.line(startX, mgr.y, startX + colWidths.reduce((a, b) => a + b, 0), mgr.y);
  });

  // Solid line after the table
  doc.setLineWidth(1);
  doc.setDrawColor(0, 0, 0);
  doc.line(startX, mgr.y, startX + colWidths.reduce((a, b) => a + b, 0), mgr.y);

  mgr.addY(20); // space below the table
}

export function generateProfessionalPdf(
  state: AppState,
  currentTxs: Transaction[],
  userName: string,
  cycle: { start: Date; end: Date; daysTotal: number }
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const mgr = new DocManager(doc);

  // Constants
  const allowanceAmount = state.settings.allowanceAmount;
  const totalIncomeNum = currentTxs.filter((t) => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = currentTxs.filter((t) => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = allowanceAmount + totalIncomeNum; 
  const remaining = totalIncome - totalSpent;

  // Format cycle dates in Indonesian locale
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  const startStr = cycle.start.toLocaleDateString('id-ID', dateOptions);
  const endStr = cycle.end.toLocaleDateString('id-ID', dateOptions);
  const periodText = `${startStr} - ${endStr}`;
  const nowText = new Date().toLocaleDateString('id-ID', dateOptions);

  // 1. Header Laporan
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('LAPORAN KEUANGAN KOSMATE', 54, mgr.y);
  mgr.addY(25);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  
  // Align metadata texts cleanly with aligned colons
  doc.text('Nama Pengguna : ' + userName, 54, mgr.y);
  mgr.addY(14);
  doc.text('Periode            : ' + periodText, 54, mgr.y);
  mgr.addY(14);
  doc.text('Tanggal Cetak  : ' + nowText, 54, mgr.y);
  mgr.addY(25);

  // 2. Ringkasan Keuangan Section
  mgr.checkPageOverflow(110);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('RINGKASAN KEUANGAN', 54, mgr.y);
  mgr.addY(15);

  const ringkasanHeaders = ['Keterangan', 'Nominal'];
  const ringkasanRows = [
    ['Saldo Awal', formatIDR(allowanceAmount)],
    ['Total Pemasukan', formatIDR(totalIncomeNum)],
    ['Total Pengeluaran', formatIDR(totalSpent)],
    ['Saldo Akhir', formatIDR(remaining)],
  ];
  drawSimpleTable(mgr, ringkasanHeaders, ringkasanRows, [280, 207], ['left', 'right']);

  // 3. Ringkasan Per Kategori
  mgr.checkPageOverflow(170);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('RINGKASAN PER KATEGORI', 54, mgr.y);
  mgr.addY(15);

  const categoriesTotalMap: Record<string, number> = {
    'Makan': 0,
    'Kos': 0,
    'Transportasi': 0,
    'Pulsa & Internet': 0,
    'Top Up Game': 0,
    'Belanja': 0,
    'Lainnya': 0,
  };

  currentTxs.filter((t) => t.category !== 'pemasukan').forEach((t) => {
    const matchedCategory = getReportCategory(t.category, t.tag || '');
    if (categoriesTotalMap[matchedCategory] !== undefined) {
      categoriesTotalMap[matchedCategory] += t.amount;
    } else {
      categoriesTotalMap['Lainnya'] += t.amount;
    }
  });

  const categoriesHeaders = ['Kategori', 'Total'];
  const categoriesRows = [
    ['Makan', formatIDR(categoriesTotalMap['Makan'])],
    ['Kos', formatIDR(categoriesTotalMap['Kos'])],
    ['Transportasi', formatIDR(categoriesTotalMap['Transportasi'])],
    ['Pulsa & Internet', formatIDR(categoriesTotalMap['Pulsa & Internet'])],
    ['Top Up Game', formatIDR(categoriesTotalMap['Top Up Game'])],
    ['Belanja', formatIDR(categoriesTotalMap['Belanja'])],
    ['Lainnya', formatIDR(categoriesTotalMap['Lainnya'])],
  ];
  drawSimpleTable(mgr, categoriesHeaders, categoriesRows, [280, 207], ['left', 'right']);

  // 4. Statistik Ringkas
  mgr.checkPageOverflow(120);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('STATISTIK RINGKAS', 54, mgr.y);
  mgr.addY(18);

  const totalTxsCount = currentTxs.length;
  const daysInCycle = cycle.daysTotal || 30;
  const avgExpenseDaily = totalSpent / daysInCycle;
  const avgIncomeDaily = allowanceAmount / daysInCycle;

  // Determine top expense category
  let topCategoryName = '-';
  let topCategoryAmount = 0;
  Object.entries(categoriesTotalMap).forEach(([name, val]) => {
    if (val > topCategoryAmount) {
      topCategoryAmount = val;
      topCategoryName = name;
    }
  });

  // Determine single highest transaction
  let maxTxAmount = 0;
  currentTxs.forEach((t) => {
    if (t.amount > maxTxAmount) {
      maxTxAmount = t.amount;
    }
  });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total Transaksi                           : ${totalTxsCount} transaksi`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`Rata-rata Pengeluaran Harian    : ${formatIDR(avgExpenseDaily)}`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`Rata-rata Pemasukan Harian      : ${formatIDR(avgIncomeDaily)}`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`Kategori Pengeluaran Terbesar  : ${topCategoryName}`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`Nominal Pengeluaran Terbesar   : ${formatIDR(maxTxAmount)}`, 54, mgr.y);
  mgr.addY(25);

  // 5. Detail Seluruh Transaksi
  mgr.checkPageOverflow(120);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('DETAIL SELURUH TRANSAKSI', 54, mgr.y);
  mgr.addY(15);

  // Sort transactions oldest to newest
  const sortedTxs = [...currentTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const detailHeaders = ['No', 'Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Nominal'];
  const detailColWidths = [30, 65, 75, 100, 137, 80];
  const detailColAlign: ('left' | 'right')[] = ['left', 'left', 'left', 'left', 'left', 'right'];

  const detailRows = sortedTxs.map((t, index) => {
    const txDateStr = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
    const capitalizedCat = getReportCategory(t.category, t.tag || '');
    const isIncome = t.category === 'pemasukan';
    return [
      String(index + 1),
      txDateStr,
      isIncome ? 'Pemasukan' : 'Pengeluaran',
      capitalizedCat,
      t.description,
      isIncome ? '+ ' + formatIDR(t.amount) : '- ' + formatIDR(t.amount),
    ];
  });

  drawSimpleTable(mgr, detailHeaders, detailRows, detailColWidths, detailColAlign);

  // 6. Footer section at the end of the text page flow
  mgr.checkPageOverflow(100);
  mgr.line();
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(10);
  doc.text('KEMENTERIAN PENUTUP', 54, mgr.y);
  mgr.addY(16);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Dokumen ini dibuat otomatis oleh sistem KosMate.', 54, mgr.y);
  mgr.addY(14);
  doc.text('Dicetak pada:', 54, mgr.y);
  mgr.addY(14);

  const footerNow = new Date();
  const timeStr = footerNow.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  const fullStamp = `${footerNow.toLocaleDateString('id-ID', dateOptions)}, pukul ${timeStr}`;
  doc.text(fullStamp, 54, mgr.y);

  // Generate dynamic running page footers across all generated doc pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(54, 800, 541.28, 800);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Halaman ${i} dari ${totalPages}`, 54, 815);
    doc.text('KosMate - Laporan Keuangan Kos', 541.28, 815, { align: 'right' });
  }

  return doc;
}

export function getFriendlyParentDescriptionAndCategory(t: Transaction): { description: string; category: string } {
  let friendlyCat = getReportCategory(t.category, t.tag || '');
  let friendlyDesc = t.description;

  const tCategory = t.category.toLowerCase();
  const tDescription = t.description.toLowerCase();
  const tTag = (t.tag || '').toLowerCase();

  if (tCategory === 'wajib') {
    if (tTag === 'makan' || tTag === 'jajan') {
      friendlyCat = 'Makanan';
      friendlyDesc = 'Konsumsi Nutrisi Harian Sehat';
    } else if (tTag === 'kos' || tTag === 'listrik' || tTag === 'listrik/air') {
      friendlyCat = 'Kebutuhan Kos';
      friendlyDesc = 'Sewa Kamar Kos & Tagihan Bulanan';
    } else if (tTag.includes('pulsa') || tTag.includes('internet') || tTag.includes('kuota') || tTag.includes('wifi')) {
      friendlyCat = 'Internet';
      friendlyDesc = 'Koneksi Belajar & Penunjang Akademis';
    } else {
      friendlyCat = 'Kebutuhan Kos';
      friendlyDesc = 'Biaya Kebutuhan Hunian Kos';
    }
  } else if (tCategory === 'darurat') {
    friendlyCat = 'Lainnya';
    friendlyDesc = tTag === 'kesehatan' ? 'Biaya Pengobatan & Penjagaan Imunitas' : 'Keperluan Mendesak Penunjang Pendidikan';
  } else if (tCategory === 'fleksibel') {
    // Automatic filtering or disguising of discretionary expenses
    friendlyCat = 'Lainnya';
    
    if (tDescription.includes('game') || tDescription.includes('top up') || tDescription.includes('topup') || tDescription.includes('steam') || tTag.includes('game')) {
      friendlyDesc = 'Pembelian Referensi Akademik & E-Book';
    } else if (tDescription.includes('kopi') || tDescription.includes('starbucks') || tDescription.includes('nongkrong') || tDescription.includes('jajan') || tDescription.includes('cafe') || tDescription.includes('kafe')) {
      friendlyDesc = 'Bahan Forum Diskusi Belajar Kelompok';
    } else if (tDescription.includes('nonton') || tDescription.includes('bioskop') || tDescription.includes('hiburan') || tDescription.includes('tiket')) {
      friendlyDesc = 'Keperluan Dokumentasi & Media Lapangan';
    } else if (tDescription.includes('belanja') || tDescription.includes('supermarket') || tDescription.includes('indomaret') || tDescription.includes('alfamart')) {
      friendlyDesc = 'Pembelian Alat Tulis & Perlengkapan Belajar';
    } else {
      friendlyDesc = 'Keperluan Praktikum & Penunjang Akademik';
    }
  }

  // Normalize list category mapping
  if (friendlyCat === 'Makan') friendlyCat = 'Makanan';
  if (friendlyCat === 'Kos') friendlyCat = 'Kebutuhan Kos';
  if (friendlyCat === 'Pulsa & Internet') friendlyCat = 'Internet';

  return { description: friendlyDesc, category: friendlyCat };
}

export function generateParentPdf(
  state: AppState,
  currentTxs: Transaction[],
  userName: string,
  cycle: { start: Date; end: Date; daysTotal: number }
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const mgr = new DocManager(doc);

  // Constants
  const allowanceAmount = state.settings.allowanceAmount;
  const totalIncomeNum = currentTxs.filter((t) => t.category === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const totalSpent = currentTxs.filter((t) => t.category !== 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = allowanceAmount + totalIncomeNum;
  const remaining = totalIncome - totalSpent;

  // Format cycle dates in Indonesian locale
  const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
  const startStr = cycle.start.toLocaleDateString('id-ID', dateOptions);
  const endStr = cycle.end.toLocaleDateString('id-ID', dateOptions);
  const periodText = `${startStr} - ${endStr}`;
  const nowText = new Date().toLocaleDateString('id-ID', dateOptions);

  // 1. Header Laporan
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('VINSZ FINANCE', 54, mgr.y);

  // Draw discrete watermarked header badge
  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(1);
  doc.rect(380, mgr.y - 12, 161.28, 18, 'FD');
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('VERSI: RINGKASAN UTILITAS', 460.64, mgr.y, { align: 'center' });

  mgr.addY(18);

  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('LAPORAN KEUANGAN UNTUK ORANG TUA', 54, mgr.y);
  mgr.addY(25);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  
  // Metadata fields
  doc.text('Nama Pengguna : ' + userName, 54, mgr.y);
  mgr.addY(14);
  doc.text('Periode            : ' + periodText, 54, mgr.y);
  mgr.addY(14);
  doc.text('Tanggal Cetak  : ' + nowText, 54, mgr.y);
  mgr.addY(25);

  // 2. Ringkasan Keuangan
  mgr.checkPageOverflow(110);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('RINGKASAN KEUANGAN', 54, mgr.y);
  mgr.addY(15);

  const ringkasanHeaders = ['Keterangan', 'Nominal'];
  const ringkasanRows = [
    ['Uang Masuk (Uang Saku + Lainnya)', formatIDR(totalIncome)],
    ['Total Pengeluaran', formatIDR(totalSpent)],
    ['Sisa Uang Saat Ini', formatIDR(remaining)],
  ];
  drawSimpleTable(mgr, ringkasanHeaders, ringkasanRows, [280, 207], ['left', 'right']);

  // Rumus
  mgr.checkPageOverflow(30);
  doc.setFont('Helvetica-Oblique', 'italic');
  doc.setFontSize(9);
  doc.text('Rumus: Sisa Uang = Uang Masuk - Total Pengeluaran', 54, mgr.y);
  mgr.addY(25);

  // 3. Daftar Barang yang Dibeli
  mgr.checkPageOverflow(120);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('DAFTAR BARANG YANG DIBELI', 54, mgr.y);
  mgr.addY(15);

  const sortedPurchases = [...currentTxs]
    .filter((t) => t.category !== 'pemasukan')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const sortedIncomes = [...currentTxs]
    .filter((t) => t.category === 'pemasukan')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const detailHeaders = ['Tanggal', 'Nama Barang', 'Kategori', 'Harga'];
  const detailColWidths = [75, 212, 100, 100];
  const detailColAlign: ('left' | 'right')[] = ['left', 'left', 'left', 'right'];

  const detailRows = sortedPurchases.map((t) => {
    const txDateStr = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const friendly = getFriendlyParentDescriptionAndCategory(t);
    return [
      txDateStr,
      friendly.description,
      friendly.category,
      formatIDR(t.amount),
    ];
  });

  if (detailRows.length === 0) {
    drawSimpleTable(mgr, detailHeaders, [['-', 'Tidak ada pengeluaran', '-', '-']], detailColWidths, detailColAlign);
  } else {
    drawSimpleTable(mgr, detailHeaders, detailRows, detailColWidths, detailColAlign);
  }

  if (sortedIncomes.length > 0) {
    mgr.checkPageOverflow(120);
    doc.setFont('Helvetica-Bold', 'bold');
    doc.setFontSize(11);
    doc.text('RINCIAN PEMASUKAN LAIN-LAIN', 54, mgr.y);
    mgr.addY(15);

    const incomeHeaders = ['Tanggal', 'Sumber Pemasukan', 'Kategori', 'Jumlah'];
    const incomeColWidths = [75, 212, 100, 100];
    const incomeColAlign: ('left' | 'right')[] = ['left', 'left', 'left', 'right'];

    const incomeRows = sortedIncomes.map((t) => {
      const txDateStr = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return [
        txDateStr,
        t.description,
        'Pemasukan',
        formatIDR(t.amount),
      ];
    });

    drawSimpleTable(mgr, incomeHeaders, incomeRows, incomeColWidths, incomeColAlign);
  }

  // 4. Rekap Per Kategori
  mgr.checkPageOverflow(150);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('REKAP PER KATEGORI', 54, mgr.y);
  mgr.addY(15);

  const parentCategoriesMap: Record<string, number> = {
    'Makanan': 0,
    'Kebutuhan Kos': 0,
    'Internet': 0,
    'Transportasi': 0,
    'Lainnya': 0,
  };

  currentTxs.filter((t) => t.category !== 'pemasukan').forEach((t) => {
    const friendly = getFriendlyParentDescriptionAndCategory(t);
    const repCat = friendly.category;
    if (repCat === 'Makanan') {
      parentCategoriesMap['Makanan'] += t.amount;
    } else if (repCat === 'Kebutuhan Kos') {
      parentCategoriesMap['Kebutuhan Kos'] += t.amount;
    } else if (repCat === 'Internet') {
      parentCategoriesMap['Internet'] += t.amount;
    } else if (repCat === 'Transportasi') {
      parentCategoriesMap['Transportasi'] += t.amount;
    } else {
      parentCategoriesMap['Lainnya'] += t.amount;
    }
  });

  const categoriesHeaders = ['Kategori', 'Total'];
  const categoriesRows = [
    ['Makanan', formatIDR(parentCategoriesMap['Makanan'])],
    ['Kebutuhan Kos', formatIDR(parentCategoriesMap['Kebutuhan Kos'])],
    ['Internet', formatIDR(parentCategoriesMap['Internet'])],
    ['Transportasi', formatIDR(parentCategoriesMap['Transportasi'])],
    ['Lainnya', formatIDR(parentCategoriesMap['Lainnya'])],
  ];
  drawSimpleTable(mgr, categoriesHeaders, categoriesRows, [280, 207], ['left', 'right']);

  // 5. Informasi Keuangan
  mgr.checkPageOverflow(160);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(11);
  doc.text('INFORMASI KEUANGAN', 54, mgr.y);
  mgr.addY(18);

  const totalTxsCount = currentTxs.filter((t) => t.category !== 'pemasukan').length;
  
  // Determine top category and purchase details
  let topCategoryName = '-';
  let topCategoryAmount = 0;
  Object.entries(parentCategoriesMap).forEach(([name, val]) => {
    if (val > topCategoryAmount) {
      topCategoryAmount = val;
      topCategoryName = name;
    }
  });

  let maxTxAmount = 0;
  let maxTxName = '-';
  currentTxs.filter((t) => t.category !== 'pemasukan').forEach((t) => {
    if (t.amount > maxTxAmount) {
      maxTxAmount = t.amount;
      const friendly = getFriendlyParentDescriptionAndCategory(t);
      maxTxName = friendly.description;
    }
  });

  const usePercentage = allowanceAmount > 0 ? ((totalSpent / allowanceAmount) * 100).toFixed(0) : '0';

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  
  doc.text(`* Total transaksi bulan ini     : ${totalTxsCount} transaksi`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`* Pengeluaran terbesar         : ${formatIDR(maxTxAmount)} (${maxTxName})`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`* Kategori pengeluaran terbesar : ${topCategoryName} (${formatIDR(topCategoryAmount)})`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`* Persentase penggunaan uang   : ${usePercentage}% dari uang masuk`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`* Sisa uang saat ini           : ${formatIDR(remaining)}`, 54, mgr.y);
  mgr.addY(25);

  // Descriptive Text matches the exact contoh:
  mgr.checkPageOverflow(45);
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(10);
  doc.text(`Pengeluaran terbesar bulan ini adalah kategori ${topCategoryName} sebesar ${formatIDR(topCategoryAmount)}.`, 54, mgr.y);
  mgr.addY(15);
  doc.text(`Sisa uang saat ini ${formatIDR(remaining)}.`, 54, mgr.y);
  mgr.addY(25);

  // 6. Catatan Untuk Orang Tua
  mgr.checkPageOverflow(80);
  mgr.line();
  doc.setFont('Helvetica-Bold', 'bold');
  doc.setFontSize(10);
  doc.text('CATATAN UNTUK ORANG TUA', 54, mgr.y);
  mgr.addY(16);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  const catatanText = 'Dokumen ini dibuat otomatis oleh Vinsz Finance untuk membantu orang tua memantau penggunaan dana bulanan secara sederhana dan transparan.';
  const splitCatatan = doc.splitTextToSize(catatanText, 487);
  doc.text(splitCatatan, 54, mgr.y);
  mgr.addY(30);

  // Generate dynamic running page footers across all generated doc pages
  const totalPagesParent = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPagesParent; i++) {
    doc.setPage(i);

    // Draw background diagonal watermark indicating digital certified document
    doc.setFont('Helvetica-Bold', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(245, 245, 245);
    doc.text('RINGKASAN UTILITAS - LAPORAN TERVERIFIKASI', 50, 480, { angle: 30 });

    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(54, 800, 541.28, 800);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Halaman ${i} dari ${totalPagesParent} | [RINGKASAN UTILITAS]`, 54, 815);
    doc.text('Vinsz Finance - Laporan Orang Tua', 541.28, 815, { align: 'right' });
  }

  return doc;
}
