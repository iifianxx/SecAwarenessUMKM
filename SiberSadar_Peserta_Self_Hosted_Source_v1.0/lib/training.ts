export type RoleKey = "owner" | "finance" | "sales" | "staff";

export type Question = {
  prompt: string;
  choices: string[];
  answer: number;
  why: string;
};

export type RoleProfile = {
  title: string;
  short: string;
  icon: string;
  focus: string;
  promise: string;
  roleTip: string;
  scenarios: Question[];
  checklist: string[];
};

export const roleOrder: RoleKey[] = ["owner", "finance", "sales", "staff"];

export const roles: Record<RoleKey, RoleProfile> = {
  owner: {
    title: "Pemilik / Pimpinan",
    short: "Saya menyetujui keputusan dan pembayaran.",
    icon: "👤",
    focus: "Penyamaran, persetujuan mendesak, dan kelangsungan usaha",
    promise: "Saya akan memastikan perubahan rekening dan transaksi besar diperiksa oleh dua pihak.",
    roleTip: "Buat satu jalur persetujuan: nominal besar atau rekening baru selalu butuh konfirmasi kedua.",
    scenarios: [
      { prompt: "Pesan dari nomor baru mengaku staf: ‘Vendor ganti rekening. Tolong transfer sekarang.’", choices: ["Transfer agar operasional tidak terlambat", "Telepon staf dan vendor lewat nomor yang sudah tersimpan", "Balas meminta foto KTP"], answer: 1, why: "Nomor baru dan desakan adalah tanda bahaya. Konfirmasi lewat kontak lama memutus penyamaran." },
      { prompt: "‘Petugas marketplace’ menelepon dan meminta OTP agar toko tidak diblokir.", choices: ["Berikan OTP karena ancamannya mendesak", "Tutup telepon lalu cek aplikasi resmi", "Minta petugas mengirim kartu identitas"], answer: 1, why: "OTP adalah kunci akun. Petugas resmi tidak perlu meminta OTP Anda." },
      { prompt: "Komputer menampilkan pesan tebusan dan berkas tidak bisa dibuka.", choices: ["Matikan Wi-Fi/kabel jaringan dan segera lapor", "Bayar agar cepat selesai", "Terus coba membuka semua berkas"], answer: 0, why: "Putuskan koneksi untuk membatasi penyebaran, jangan menghapus bukti, lalu aktifkan respons insiden." },
    ],
    checklist: ["Informasi penting sudah dibedakan: publik, internal, atau rahasia", "Ada aturan dua persetujuan untuk rekening baru/transaksi besar", "Akun utama memakai MFA dan jalur pemulihan yang diuji", "Data/layanan penting memiliki cadangan atau jalur alternatif yang diuji"],
  },
  finance: {
    title: "Keuangan / Kasir",
    short: "Saya menerima, membayar, atau mencatat transaksi.",
    icon: "💳",
    focus: "Bukti transfer palsu, perubahan rekening, dan refund",
    promise: "Saya akan memeriksa mutasi dan mengonfirmasi perubahan rekening sebelum transaksi.",
    roleTip: "Screenshot bukan bukti uang masuk. Gunakan mutasi pada aplikasi bank resmi sebagai sumber kebenaran.",
    scenarios: [
      { prompt: "Pembeli menunjukkan screenshot transfer, tetapi saldo belum berubah.", choices: ["Serahkan barang karena ada screenshot", "Cek mutasi di aplikasi bank resmi", "Minta pembeli kirim OTP"], answer: 1, why: "Screenshot dapat diubah. Status transaksi harus dicek langsung pada kanal bank resmi." },
      { prompt: "Email vendor meminta pembayaran berikutnya ke rekening baru.", choices: ["Ubah data rekening dari email", "Telepon nomor vendor yang sudah tersimpan dan minta persetujuan kedua", "Balas email meminta selfie"], answer: 1, why: "Perubahan instruksi pembayaran harus dikonfirmasi lewat kanal lama dan disetujui pihak kedua." },
      { prompt: "Atasan lewat chat meminta refund segera ke rekening berbeda dari pembeli.", choices: ["Bayar agar tidak dimarahi", "Ikuti data rekening di chat", "Cocokkan pesanan, hubungi atasan lewat kanal lama, dan ikuti prosedur refund"], answer: 2, why: "Refund harus dapat ditelusuri dan mengikuti data transaksi serta jalur persetujuan yang berlaku." },
    ],
    checklist: ["Mutasi bank menjadi sumber status transaksi, bukan screenshot", "Rekening baru selalu dikonfirmasi lewat kontak lama", "Transaksi besar/refund membutuhkan persetujuan kedua", "Data transaksi rahasia dibatasi dan akun bank memakai MFA"],
  },
  sales: {
    title: "Admin Penjualan / Media",
    short: "Saya mengelola chat, toko online, atau media sosial.",
    icon: "💬",
    focus: "Pengambilalihan akun, tautan/APK, dan data pelanggan",
    promise: "Saya akan masuk melalui aplikasi resmi dan menjaga akses serta data pelanggan.",
    roleTip: "Jika pesan meminta login, jangan gunakan tautannya. Buka sendiri aplikasi atau alamat resmi yang tersimpan.",
    scenarios: [
      { prompt: "Pesan berbunyi: ‘Verifikasi toko dalam 10 menit’ disertai tautan login.", choices: ["Klik agar toko tidak diblokir", "Teruskan ke grup pelanggan", "Buka aplikasi marketplace secara langsung dan cek notifikasi"], answer: 2, why: "Masuk dari aplikasi resmi menghindari halaman login palsu pada tautan pesan." },
      { prompt: "Calon pembeli mengirim file APK dan berkata itu label pengiriman.", choices: ["Jangan instal; minta label lewat fitur resmi atau PDF", "Instal di ponsel pribadi", "Kirim ke rekan untuk dicoba"], answer: 0, why: "APK dapat memasang aplikasi berbahaya. Label pengiriman tidak memerlukan instalasi aplikasi dari chat." },
      { prompt: "‘Mitra iklan’ meminta ekspor seluruh data pelanggan untuk promosi.", choices: ["Kirim agar kampanye cepat", "Tolak dulu, verifikasi kewenangan dan gunakan data seminimal mungkin", "Unggah ke tautan penyimpanan publik"], answer: 1, why: "Data pelanggan hanya boleh dipakai sesuai kewenangan, tujuan, dan kebutuhan minimum." },
    ],
    checklist: ["Data pelanggan sudah ditandai sebagai rahasia/internal dan dibatasi", "Akun toko/media memakai MFA dan email pemulihan yang dikuasai usaha", "Tidak login melalui tautan atau memasang APK dari chat", "Akses admin lama segera dicabut saat pergantian staf"],
  },
  staff: {
    title: "Staf / Operasional",
    short: "Saya memakai perangkat dan akun untuk pekerjaan harian.",
    icon: "🧰",
    focus: "Akun bersama, berkas asing, pembaruan, dan pelaporan cepat",
    promise: "Saya akan memakai akun sendiri, berhenti saat ragu, dan cepat melapor.",
    roleTip: "Melapor cepat bukan berarti bersalah. Laporan dini memberi usaha waktu untuk membatasi dampak.",
    scenarios: [
      { prompt: "Rekan meminta kata sandi akun bersama lewat chat.", choices: ["Kirim karena satu tim", "Gunakan akun masing-masing atau minta akses resmi", "Tulis kata sandi di grup"], answer: 1, why: "Akun individu menjaga akuntabilitas dan mencegah kata sandi tersebar." },
      { prompt: "Anda menerima file tagihan yang tidak diharapkan dari pengirim asing.", choices: ["Buka untuk memastikan", "Teruskan ke semua rekan", "Jangan buka; konfirmasi pengirim dan laporkan"], answer: 2, why: "Berkas tak terduga perlu diverifikasi sebelum dibuka agar malware tidak dijalankan." },
      { prompt: "Muncul notifikasi login dari perangkat yang tidak dikenal.", choices: ["Abaikan jika akun masih bisa dipakai", "Masuk lewat aplikasi resmi, ganti kata sandi, keluarkan sesi lain, aktifkan MFA, lalu lapor", "Balas notifikasi dengan kata sandi lama"], answer: 1, why: "Amankan akun melalui kanal resmi dan beri tahu penanggung jawab agar dampak lain dapat diperiksa." },
    ],
    checklist: ["Setiap orang memakai akun dan kata sandi sendiri", "MFA aktif pada akun kerja yang mendukung", "Perangkat diperbarui dan data kerja penting memiliki cadangan", "Semua staf tahu jalur alternatif dan kepada siapa harus melapor"],
  },
};

export const lessons = [
  { icon: "✋", title: "Jeda", anchor: "Kenali risiko", lead: "Desakan membuat kita melewati pemeriksaan.", points: ["Berhenti 30 detik", "Jangan klik, transfer, instal, atau membalas dulu", "Anggap permintaan rahasia dan mendesak sebagai tanda bahaya"] },
  { icon: "🔎", title: "Cek", anchor: "Jaga informasi tetap benar dan utuh", lead: "Periksa fakta dari sumber yang Anda buka sendiri.", points: ["Cek pengirim, alamat, isi, dan konteks", "Masuk lewat aplikasi atau alamat resmi", "Cek mutasi, bukan screenshot yang bisa diubah"] },
  { icon: "☎️", title: "Konfirmasi", anchor: "Pastikan identitas dan sumber asli", lead: "Gunakan kanal yang sudah dipercaya.", points: ["Telepon nomor lama yang tersimpan", "Tanyakan kepada pihak kedua", "OTP, PIN, dan kata sandi tidak pernah dibagikan"] },
  { icon: "🔐", title: "Lindungi", anchor: "Jaga rahasia dan ketersediaan", lead: "Kurangi peluang akun, data, dan layanan terganggu.", points: ["Bedakan informasi publik, internal, dan rahasia", "Pakai kata sandi unik, MFA, dan pembaruan", "Batasi akses; siapkan cadangan atau jalur alternatif lalu uji"] },
  { icon: "📣", title: "Laporkan", anchor: "Pulihkan dengan bukti", lead: "Kecepatan respons lebih penting daripada rasa malu.", points: ["Putuskan koneksi jika perangkat diduga terinfeksi", "Hubungi penanggung jawab dan penyedia akun/bank", "Simpan bukti; jangan menghapus percakapan atau transaksi"] },
];

export const preQuestions = (role: RoleKey): Question[] => [
  { prompt: "Pesan mendesak meminta Anda klik tautan dan masuk sekarang. Apa langkah pertama?", choices: ["Klik sebelum waktunya habis", "Jeda dan periksa lewat aplikasi resmi", "Teruskan ke rekan"], answer: 1, why: "Jeda memutus tekanan dan memberi waktu untuk verifikasi." },
  { prompt: "Seseorang yang mengaku petugas meminta OTP. Apa yang Anda lakukan?", choices: ["Tolak dan tutup percakapan", "Berikan satu kali saja", "Kirim separuh angkanya"], answer: 0, why: "OTP adalah kunci sementara akun dan tidak boleh diberikan kepada siapa pun." },
  { prompt: "Cara paling aman memeriksa sebuah notifikasi akun adalah...", choices: ["Membuka tautan di pesan", "Mencari tautan serupa di media sosial", "Membuka aplikasi atau alamat resmi sendiri"], answer: 2, why: "Kanal resmi yang dibuka sendiri menghindari tautan palsu." },
  { ...roles[role].scenarios[0] },
  { prompt: "Setelah salah klik dan memasukkan kata sandi, apa yang paling tepat?", choices: ["Diam agar tidak dimarahi", "Ganti kata sandi lewat kanal resmi, keluarkan sesi lain, aktifkan MFA, dan lapor", "Hapus riwayat browser saja"], answer: 1, why: "Amankan akun dan lapor cepat agar dampak lain bisa diperiksa." },
];

export const postQuestions = (role: RoleKey): Question[] => [
  { prompt: "Pesan mengancam akun ditutup dalam 15 menit. Pilihan paling aman?", choices: ["Jeda, lalu cek langsung pada aplikasi resmi", "Klik tautan dan segera login", "Balas dengan data akun"], answer: 0, why: "Desakan bukan bukti keaslian. Periksa lewat kanal resmi." },
  { prompt: "Apa yang boleh dibagikan kepada petugas layanan resmi?", choices: ["OTP", "Kata sandi", "Nomor laporan atau informasi non-rahasia yang memang diperlukan"], answer: 2, why: "OTP, PIN, dan kata sandi tetap rahasia. Bagikan hanya informasi minimum yang diperlukan." },
  { prompt: "Anda ragu pada permintaan pembayaran atau akses. Apa tindakan terbaik?", choices: ["Ikuti agar cepat", "Konfirmasi lewat kontak lama dan minta pemeriksaan pihak kedua", "Tanyakan di kolom komentar publik"], answer: 1, why: "Kanal lama dan pihak kedua mengurangi risiko penyamaran serta salah keputusan." },
  { ...roles[role].scenarios[1] },
  { prompt: "Perangkat diduga terinfeksi dan akun mungkin diambil alih. Urutan paling aman?", choices: ["Lanjut bekerja, lalu lapor besok", "Hapus semua bukti", "Batasi koneksi, amankan akun lewat perangkat bersih, lapor, dan simpan bukti"], answer: 2, why: "Membatasi, mengamankan, melapor, dan menjaga bukti membantu respons yang terarah." },
];
