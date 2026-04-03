'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Wallet, MessageCircle, Phone, BadgeDollarSign } from 'lucide-react'

export default function PanduanAplikasi() {
  const router = useRouter()

  const panduanList = [
    {
      icon: <BadgeDollarSign className="text-red-500 w-6 h-6 md:w-8 md:h-8" />,
      bg: "bg-red-50",
      border: "border-red-100",
      title: "Cek Tagihan & History",
      desc: "Menu Tagihan menampilkan semua riwayat iuran Anda tiap bulannya. Lunas akan berwarna Hijau, sedangkan yang belum lunas berwarna Merah."
    },
    {
      icon: <Wallet className="text-amber-500 w-6 h-6 md:w-8 md:h-8" />,
      bg: "bg-amber-50",
      border: "border-amber-100",
      title: "Cara Bayar Iuran",
      desc: "Klik menu Bayar, Anda akan melihat panduan transfer (BCA/Mandiri/Dana). Setelah transfer, klik tombol Konfirmasi WhatsApp untuk mengirim bukti ke Admin."
    },
    {
      icon: <MessageCircle className="text-indigo-500 w-6 h-6 md:w-8 md:h-8" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      title: "Membuat Laporan Warga",
      desc: "Ada fasilitas rusak atau keluhan tetangga? Buka menu Laporan, tulis keluhan Anda. Laporan akan otomatis diteruskan ke WhatsApp Pengurus/RT."
    },
    {
      icon: <Phone className="text-emerald-500 w-6 h-6 md:w-8 md:h-8" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      title: "Kontak Darurat",
      desc: "Jika ada kondisi mendesak (Keamanan/Kebakaran), klik menu Kontak. Tersedia daftar nomor telepon Satpam dan petugas yang bisa langsung ditelepon."
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8 overflow-x-hidden">
      
      {/* Container Responsif: Layar HP full, Desktop jadi card lebar */}
      <div className="w-full md:max-w-5xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-12 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative px-6 md:px-12 pt-8 md:pt-12 pb-6 md:pb-8 flex items-center gap-4 bg-white z-10 border-b md:border-b-0 border-gray-50">
          <button onClick={() => router.push('/dashboard')} className="p-3 md:p-4 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-2xl md:rounded-[20px] active:scale-90 transition-all shadow-sm group">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-black transition-colors" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none text-teal-800">Panduan Portal</h1>
            <p className="text-[9px] md:text-[11px] text-teal-600 font-black uppercase tracking-[0.2em] mt-1 md:mt-2">Cara Penggunaan Aplikasi</p>
          </div>
        </div>

        <div className="px-6 md:px-12 flex flex-col gap-6 md:gap-10 mt-4 md:mt-0">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-6 md:p-10 rounded-[30px] md:rounded-[40px] shadow-lg shadow-teal-500/20 text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8">
            <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full blur-xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
            
            <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl md:rounded-[24px] flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
               <BookOpen className="w-7 h-7 md:w-10 md:h-10 text-white" />
            </div>
            
            <div className="relative z-10">
              <h2 className="font-black text-xl md:text-3xl uppercase leading-tight mb-2 md:mb-3 drop-shadow-sm">Selamat Datang Warga!</h2>
              <p className="text-xs md:text-sm font-bold text-teal-50 opacity-90 leading-relaxed md:leading-loose md:max-w-2xl">
                Skyland Portal dirancang untuk mempermudah Anda memantau iuran bulanan dan berkomunikasi dengan pengurus lingkungan secara transparan.
              </p>
            </div>
          </div>

          {/* List Panduan (Grid Responsif) */}
          <div>
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <span className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-teal-500 animate-pulse"></span>
              <h3 className="font-black text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">Fitur Utama</h3>
            </div>

            {/* Desktop 2 kolom, HP 1 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {panduanList.map((item, index) => (
                <div key={index} className="p-5 md:p-6 bg-white border-2 border-gray-50 rounded-[28px] md:rounded-[32px] shadow-sm hover:border-teal-100 hover:shadow-md transition-all group">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] flex items-center justify-center shrink-0 shadow-inner ${item.bg} ${item.border} border group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-sm md:text-base uppercase text-gray-800 leading-none mb-2 md:mb-3 mt-1">{item.title}</h4>
                      <p className="text-[11px] md:text-xs font-bold text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bantuan Ekstra */}
          <div className="p-6 md:p-8 bg-gray-50 rounded-[30px] md:rounded-[36px] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8 mt-2 md:mt-4">
            <div className="text-center md:text-left">
              <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Masih Bingung?</p>
              <h4 className="font-black text-sm md:text-lg text-black uppercase">Hubungi Admin IT</h4>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/6281233429997?text=Halo%20Admin,%20saya%20butuh%20bantuan%20cara%20pakai%20Skyland%20Portal`, '_blank')}
              className="w-full md:w-auto px-8 py-4 bg-black hover:bg-gray-800 text-white rounded-2xl md:rounded-[20px] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} /> Chat Sekarang
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}