# KosFinance 🪙 — Konsep & Dokumen Rincian Pengembangan Aplikasi

Aplikasi pelacak keuangan modern yang dirancang khusus untuk memenuhi kebutuhan sosiologis dan finansial mahasiswa atau pekerja perantau yang tinggal di rumah kos (**Anak Kos**).

Dokumen ini menjelaskan secara mendalam tentang filosofi aplikasi, arsitektur sistem, desain visual, rincian fitur, serta keputusan teknologi yang diambil selama proses pengembangan KosFinance.

---

## 1. Filosofi & Konsep Utama (Core Ideas)

Manajemen keuangan anak kos sangat unik dibanding rumah tangga atau profesional umum. Keuangan anak kos dicirikan dengan ketersediaan anggaran yang terbatas, kedatangan kiriman yang bersiklus, serta tingkat kebutuhan sosial kemahasiswaan yang fluktuatif. KosFinance memformulasikan ekosistem ini ke dalam beberapa konsep inti:

### A. Allowance-Cycle Engine (Siklus Uang Saku)
Aplikasi keuangan pada umumnya memantau pengeluaran dari tanggal 1 hingga akhir bulan kalender. Namun, anak kos menerima uang bulanan pada tanggal yang acak (misalnya setiap tanggal 5 atau tanggal 25). 
* KosFinance memperkenalkan fitur **Siklus Fleksibel** yang disesuaikan dengan tanggal masuk kiriman atau gaji utama pengguna.
* Semua perhitungan grafik, pengukur sisa uang harian, dan ringkasan bulanan akan berpusat pada rentang siklus aktif ini demi menjaga akurasi real-time.

### B. Konsep Tiga Keranjang Utama (The Three Buckets)
Untuk mengedukasi keuangan sederhana tanpa membuat pusing, keuangan diringkas ke dalam tiga kategori utama pengeluaran:
1. **Wajib (Essential)**: Kebutuhan hidup primer yang tidak bisa ditunda, seperti sewa kamar kos, tagihan internet, token listrik, dan kebutuhan pangan pokok.
2. **Fleksibel (Discretionary)**: Pengeluaran gaya hidup, bersenang-senang, jajan kopi, nongkrong, nonton bioskop, atau berbelanja barang hobi.
3. **Darurat (Emergency)**: Cadangan dana khusus untuk kejadian tak terduga, seperti sakit berobat, laptop rusak, motor bocor ban, atau iuran darurat mendesak.

### C. Pemisahan Alur Pemasukan (Separate Income Isolation)
Berdasarkan masukan kenyamanan pengguna terbaru, tombol pencatatan **Pemasukan** dipisahkan secara struktural dari tombol kategori pengeluaran harian.
* **Tujuan**: Menghindari kesalahan kognitif pengguna yang tidak sengaja menyisipkan pemasukan ke dalam keranjang pengeluaran, serta memberikan alur UI/UX pencatatan yang eksklusif demi mempertegas status uang masuk.
* **Perilaku**: Pengguna dapat berpindah tipe form melalui tombol navigasi visual bertipe Tab besar (Neo-Brutalist) di halaman pencatatan transaksi untuk mencatat transaksi keluar atau transaksi masuk dengan setelan Tag dinamis yang langsung menyesuaikan otomatis.

### D. Survival Mode (Ambang Bertahan Hidup)
Sistem memiliki algoritme pendeteksi krisis sisa anggaran:
* Jika uang saku harian rata-rata (*average daily allowance remaining*) berada di bawah batas **Survival Threshold** yang diatur pengguna di pengaturan, aplikasi akan berubah visual secara dinamis mengaktifkan simbol peringatan **Survival Mode**.
* Area dashboard akan berganti aksen, memprioritaskan pangkasan jajan tak penting, serta memberikan tips berhemat lokal yang relevan untuk bertahan sampai tanggal siklus berikutnya.

---

## 2. Palet Desain & UX (Aesthetic Style System)

KosFinance mengadopsi gaya visual **Neo-Brutalisme** yang dinamis, tegas, dan trendi. Desain ini merepresentasikan semangat independensi anak kos yang modern dan berani:

* **Desain Batas Hitam Kontras Tinggi (High Contrast Borders)**: Setiap tombol, input field, dan kartu dibungkus dengan border tebal hitam solid (`border-2 border-[#1A1A1A]` atau `border-4`).
* **Flat Shadow (Bayangan Datar Tegas)**: Tidak menggunakan efek soft-blur shadow modern, melainkan solid offset shadow yang mengambang serasi di permukaan, misal `shadow-[4px_4px_0px_#FFE66D]`.
* **Sistem Kode Warna Fungsional**:
  * <kbd>#FFE66D</kbd> **Kuning Terang**: Merepresentasikan pengeluaran **Wajib** (perhatian penuh).
  * <kbd>#4ECDC4</kbd> **Teal / Hijau Toska**: Merepresentasikan pengeluaran **Fleksibel** (kebebasan bergaya).
  * <kbd>#FF6B6B</kbd> **Merah Coral**: Merepresentasikan pengeluaran **Darurat** (tindakan cepat/krisis).
  * <kbd>#10B981</kbd> **Hijau Emerald**: Merepresentasikan kontur **Pemasukan** (gaji, transfer, atau beasiswa).
* **Tipografi Bersih & Tegas**: Menggunakan font sans-serif modern berbobot tebal dikombinasikan dengan monospaced font untuk entri nominal angka nominal mentah agar data keuangan terlihat presisi, transparan, dan berstruktur komputeris yang rapi.

---

## 3. Cakupan Rincian Menyeluruh Fitur & Halaman

Setiap menu dirancang melayani sub-modul fungsional yang mendukung keberlangsungan hidup anak kos secara mendalam:

### A. Dashboard Utama (Dashboard.tsx)
Sebagai pusat peninjauan keuangan kilat, dashboard menyatukan indikator performa utama keuangan secara dinamis:
* **Budget Progress Circular Card**: Panel bundar interaktif yang menyajikan sisa anggaran siklus aktif terhadap waktu (hari) yang tersisa.
* **Metrik Sisa Saldo**: Menampilkan kalkulasi saldo aktif secara real-time yang langsung berkurang ketika ada pengeluaran dan bertambah ketika ada pemasukan tercatat.
* **Kalkulator Uang Saku Harian**: Secara cerdas membagi sisa saldo dengan jumlah hari tersisa sebelum siklus baru dimulai. Pengguna dapat melacak, *"Apakah aman berbelanja Rp50.000 hari ini?"*.
* **Status Survival & Indikator Bahaya**: Jika uang harian jatuh di bawah ambang batas kesepakatan (*survival threshold*), dashboard akan menampilkan banner darurat berwarna kuning-merah menyala dengan seruan tindakan hemat dan rekomendasi menu makanan murah/tips lokal.
* **Daftar Transaksi Terbaru**: Menampilkan daftar mutasi transaksi terakhir yang ringkas dengan kemampuan penghapusan instan direct-to-cloud.

### B. Formulir Pencatatan Transaksi (AddTransaction.tsx)
Halaman ini adalah pintu masuk utama data mutasi harian pengguna, dirancang sangat ergonomis:
* **Neo-Brutalist Toggle Tabs Berwarna Kontras**: Menampilkan tombol "Pengeluaran" dan "Pemasukan" yang besar dan kontras secara berdampingan di bagian atas. Jika tab "Pengeluaran" aktif, ia diwarnai Merah Coral (`#FF6B6B`) dengan bayangan tebal. Jika beralih ke "Pemasukan", ia secara instan berubah menjadi Hijau Emerald (`#10B981`) untuk mempertegas batas psikologis pencatatan jenis dana secara tegas. Tab yang tidak aktif diberi warna abu-abu mati (*dead gray*) dengan border tipis.

### C. Patungan Cepat (Split Bill - SplitBill.tsx & SplitBillDetail.tsx)
Seringkali anak kos makan bersama (*sharing bills*) tetapi kesulitan menagih atau membagi tagihan secara merata. Modul ini menyelesaikannya:
* **Pembuatan Sesi**: Membuat sesi baru dengan judul kegiatan, total tagihan yang dibayarkan kasir, nama-nama partisipan, dan pilihan pembagian tagihan secara merata (*equal split*).
* **Proporsi Adil Instan**: Aplikasi langsung menghitung berapa kewajiban bayar per individu hingga rupiah terkecil.
* **Pelacakan Status Piutang (Who Owes Who)**: Menghasilkan check-list nama pembayar patungan dengan tombol penanda status **Lunas** atau **Belum Lunas**. 
* **UI/UX Interaktif Detail**: Halaman detail menyajikan grafik cincin (*progress ring*) berapa persen piutang yang sudah terkumpul kembali, total dana yang masih mengambang di luar, serta memudahkan pengguna untuk segera mengingatkan teman yang belum melunasi kewajiban patungan.

### D. Pengingat Tagihan (Bills Tracker - Bills.tsx)
Menghindarkan anak kos dari pemutusan jaringan internet, token listrik padam, atau pengusiran kos akibat lupa membayar tagihan berkala:
* **Daftar Tagihan Aktif**: Menyimpan catatan tagihan rutin lengkap dengan nominalnya.
* **Kalender Pembayaran**: Mengintegrasikan jadwal jatuh tempo tagihan langsung ke sistem data kalender built-in di dalam aplikasi.
* **Tombol Cepat Pelunasan**: Pengguna dapat mengeklik "Tandai Sudah Bayar" untuk mendokumentasikan riwayat pembayaran bulan aktif secara lokal dan cloud.

### E. Celengan Impian (Savings Target - Savings.tsx)
Membantu anak kos mengumpulkan uang saku untuk mencapai keinginan materi atau kebutuhan berkala tanpa mengorbankan stabilitas konsumsi harian:
* **Penentuan Target**: Membuat kartu impian dengan nama barang, gambar ilustrasi (menggunakan pustaka ikon Lucide), nominal target, serta tanggal tenggat pencapaian.
* **Fungsi Celengan (Isi Celengan)**: Memungkinkan pengguna memasukkan dana tabungan secara fleksibel. Saldo tabungan ini dihitung rapi mengurangi saldo anggaran harian secara teratur.
* **Progress Trackers**: Menampilkan persentase pencapaian celengan lengkap dengan hitungan matematika sisa dana yang masih perlu ditabung per hari/minggu untuk mencapai target tepat waktu.

### F. Kalender Agenda Keuangan (Calendar.tsx)
Menyediakan visualisasi spasial waktu atas seluruh aktivitas keuangan pengguna:
* **Interactive Calendar Grid**: Menampilkan kalender bulanan lengkap dengan indikator hari.
* **Penanda Titik Warna (Indicator Dots)**:
  * Titik **Merah** menandakan adanya rincian pengeluaran pada tanggal tersebut.
  * Titik **Hijau** menandakan adanya arus uang masuk/pemasukan.
* **Detail Agenda Harian**: Pengguna dapat mengetuk sel tanggal tertentu untuk melihat daftar rangkuman semua transaksi, tagihan yang jatuh tempo, atau celengan target terkategori pada hari tersebut.

### G. Generator Laporan Cerdas (Reports.tsx & pdfGenerator.ts)
Modul pelaporan KosFinance didesain dengan tingkat kepekaan fungsional yang tinggi, menyediakan tiga tipe ekspor data siap pakai:

#### 1. Laporan PDF Profesional Mandiri (Personal Finance Statement)
* **Metadata Laporan**: Menyertakan nama pengguna, periode siklus aktif, dan stempel digital pencetakan resmi.
* **Ringkasan Arus Kas**: Menyajikan total pemasukan nyata (*Total Income*) bersanding dengan total pengeluaran nyata (*Total Expense*), memberikan kalkulasi sisa dana bersih saat ini.
* **Visualisasi Alokasi Keranjang**: Diagram batang atau ringkasan alokasi per kategori "The Three Buckets" (Wajib, Fleksibel, Darurat) untuk sarana refleksi anggaran.
* **Detail Transaksi Komparatif**: Menyajikan seluruh data transaksi secara lengkap terurut tanggal. Setiap nominal pengeluaran diberi tanda pengurang (`- Rp xxx`), sedangkan pemasukan diberi tanda penambah (`+ Rp xxx`) dalam warna teks yang disesuaikan secara harmonis.

#### 2. Laporan PDF Bersertifikasi Khusus Orang Tua (Parental Certified Report)
Anak kos sering kali menghadapi tuntutan transparansi pengeluaran dari orang tua di rumah. Namun, mencantumkan pengeluaran untuk kesenangan pribadi (seperti berbelanja kosmetik, konsol game, jajan kopi susu, atau nonton bioskop) secara eksplisit berisiko memicu konflik. KosFinance menghadirkan solusi diplomatis melalui **Filter Sensor Cerdas**:
* **Filter Sensor Jajan**: Semua pengeluaran dalam keranjang **Fleksibel** secara otomatis disaring atau disamarkan. Transaksi tidak formal seperti *"Beli Kopi Starbucks"* atau *"Beli Voucher Game"* ditiadakan atau digabungkan ke pos penulisan umum.
* **Kategori Ramah Orang Tua**: Pengeluaran dinormalisasi ke dalam kategori formal yang disukai orang tua, dengan nama alias yang lebih sopan dan akademis:
  * Pengeluaran makan sehari-hari diringkas menjadi **Makanan & Gizi Pokok**.
  * Tagihan internet disamarkan menjadi **Koneksi Belajar & Penunjang Akademis**.
  * Tagihan sewa tempat tinggal dicatat sebagai **Sewa Kos & Utilitas**.
  * Pengeluaran darurat kesehatan dicatat sebagai **Kesehatan & Kebugaran Mandiri**.
* **Tabel Rincian Pemasukan Transparan**: Menyajikan tabel terpisah bertajuk **RINCIAN PEMASUKAN LAIN-LAIN**. Fitur ini memisahkan pendapatan dari beasiswa, upah sampingan, atau sisa celengan guna mendemonstrasikan perilaku kemandirian finansial yang progresif di mata orang tua.

#### 3. Ekspor Spreadsheet (.CSV)
* **Raw Data Eksportir**: Menghasilkan file raw data berpemisah koma komparatif lengkap yang bersih.
* **Kompatibilitas Penuh**: Menggunakan format UTF-8 Byte Order Mark (BOM) sehingga file langsung terbuka dengan rapi tanpa masalah enkripsi pada Microsoft Excel, WPS Office, maupun Google Sheets.
* **Metode Data**: Menyertakan detail kolom tanggal lokal lengkap, deskripsi, keranjang, tag spesifik, jenis transaksi (Pemasukan/Pengeluaran), nominal berformat Rupiah lokal, serta angka nominal orisinal (raw number) untuk menyederhanakan perhitungan grafik pivot mandiri oleh pengguna tingkat lanjut.

---

## 4. Arsitektur Teknis & Aliran Sinkronisasi (Tech Specs)

Pengembangan KosFinance bertumpu atas fondasi performa tinggi, stabilitas, ekosistem tipe yang aman, dan efisiensi penyimpanan:

```
                  ┌────────────────────────────────────────┐
                  │              KosFinance UI             │
                  │        (React 18, Vite, Tailwind CSS)  │
                  └───────────────────┬────────────────────┘
                                      │
                         (Zustand State & Auth Hook)
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │             Local Context              │
                  │          /src/store.tsx Store          │
                  └───────────────────┬────────────────────┘
                                      │
                            (Firebase Sync Engine)
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │           Firebase Firestore           │
                  │    (& Google Auth Persistent Cloud)    │
                  └────────────────────────────────────────┘
```

### A. Ekosistem Frontend (React & TypeScript)
* **Vite Compiler**: Menjamin waktu muat (*load time*) super cepat, perakitan aset yang bersih, serta isolasi modular komponen CSS yang efisien.
* **Strict Type Safety (`src/types.ts`)**: Mendefinisikan kontrak interface yang kokoh untuk mencegah kegagalan runtime (bug pointer hampa) pada tipe `Transaction`, `Bill`, `SavingsTarget`, dan `SplitSession`.
* **Framer Motion (`motion/react`)**: Menggerakkan transisi perpindahan halaman, slide-in form, riak-riak hover, dan notifikasi agar layout aplikasi tidak terkesan kaku.

### B. Sinkronisasi Data & Penyimpanan Offline (Firestore Offline & Auto-Sync)
* **Dukungan Cloud Terintegrasi**: Mengacu pada pola integrasi database mutakhir, data tersimpan secara asinkron dalam **Firebase Firestore Database**.
* **Penyimpanan Cache Offline (Offline Persistence)**: Firestore dikonfigurasi secara khusus dengan fitur *local cache storage/offline persistence diaktifkan*. Hal ini menjamin pengguna tetap dapat mengakses, membaca, serta mencatat transaksi pemasukan maupun pengeluaran baru meskipun sedang kehabisan kuota internet atau tidak berada dalam jangkauan sinyal (offline).
* **Sinkronisasi Otomatis Tanpa Hambatan (Auto-Sync)**: Begitu perangkat pengguna mendeteksi adanya koneksi internet aktif kembali (seperti saat terhubung ke Wi-Fi kosan atau jaringan seluler), Firestore secara otomatis mengunggah perubahan data lokal serta menyinkronkan seluruh riwayat pengeluaran/pemasukan tersebut ke cloud tanpa memerlukan tindakan manual dari pengguna.
* **Keamanan Data Multi-User**: Semua data dilindungi secara privat berdasarkan kepemilikan UID unik (`users/{userId}/transactions/{txId}`) bersumber dari Firebase Authentication, yang menjamin tidak ada kebocoran atau tumpang-tindih informasi antar-pengguna seliar apa pun aktivitas sinkronisasi offline mereka.
* **Sesi Otentikasi Fleksibel**: Log masuk yang aman didukung penuh oleh **Google Authentication SDK** serta opsi login email dan kata sandi mandiri yang tangguh.

### C. Client-Side Document Rendering (PDFAging Engine)
* Penyusunan PDF menggunakan library **jsPDF**.
* Rendering dilakukan sepenuhnya di sisi klien (*client-side*). Hal ini membuat proses pembuatan laporan terasa instan tanpa perlu menunggu loading jaringan dari server, sekaligus menghemat infrastruktur load balancer.
* Skema koordinat grid yang dirancang khusus (`mgr.y`, `mgr.checkPageOverflow(height)`) mengontrol pemutusan halaman dokumen (*page-break system*) agar tabel transaksi yang sangat panjang tidak terpotong atau tertimpa di bagian footer halaman PDF.

---

## 5. Ringkasan Siklus Hidup Transaksi Transparansi Keuangan

Proses aliran transaksi keuangan dari pencatatan hingga ekspor laporan:

1. **Input**: Pengguna memasuki menu Tambah Transaksi, memilih jenis transaksi (Pengeluaran/Pemasukan), mengisi nominal, deskripsi, keranjang, dan tag khusus.
2. **Commit**: Data divalidasi oleh skema tipe TypeScript, lalu dikirim ke fungsi `addTransaction()` di `/src/store.tsx`.
3. **Sync & Persist**: State lokal diupdate seketika demi kemulusan akses tanpa jeda hambat (*optimistic UI*), disusul oleh mutasi query dokumen tertarget ke cloud Firestore secara real-time.
4. **Aggregate**: Di halaman laporan bulanan, sistem mengelompokkan kategori keranjang, memfilter tipe pemasukan untuk disajikan ke area ringkasan khusus, lalu merelasikan total dana sisa pada dashboard secara dinamis.
5. **Output**: Pengguna dapat mengeklik ekspor guna merender data transaksi ke dokumen visual PDF formal atau lembar kerja data CSV sesuai skenario yang dibutuhkan.

---
*KosFinance — Solusi Hebat, Hemat, Cermat bagi Keberlangsungan Finansial Masa Depan Anak Kos.*
