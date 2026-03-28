'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function TataTertib() {
  const router = useRouter()

  const aturan = [
    "Wajib lapor RT/RW jika ada tamu menginap lebih dari 24 jam.",
    "Jam tenang lingkungan dimulai pukul 22.00 WIB setiap hari.",
    "Sampah rumah tangga wajib ditaruh di tempat sampah depan rumah setiap pagi.",
    "Dilarang memarkir kendaraan sembarangan yang dapat menghalangi akses jalan warga lain.",
    "Batas kecepatan maksimal kendaraan di dalam area komplek adalah 20 km/jam.",
    "Iuran Pemeliharaan Lingkungan (IPL) wajib dibayarkan sebelum tanggal 25 setiap bulan.",
    "Dilarang membuat keributan atau memutar musik dengan volume keras di malam hari.",
    "Setiap warga wajib menjaga kebersihan dan fasilitas umum Skyland Digital."
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {/* Container: Edge-to-Edge di HP, Kotak di Desktop */}
      <div className="w-full md:max-w-5xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-12 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Mewah Tema Security/Aturan */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-900 md:rounded-b-[40px] shadow-lg overflow-hidden">
          {/* Efek Cahaya Latar */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative flex items-center gap-4 z-10 text-white">
            <button onClick={() => router.back()} className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-white/20 hover:bg-white/20 shadow-sm">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Tata Tertib</h1>
              <p className="text-[9px] md:text-[10px] text-teal-200 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Regulasi & Keamanan Skyland</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 md:px-12 mt-8 md:mt-12 flex-1">
          
          {/* Banner Pembuka */}
          <div className="bg-teal-50 border border-teal-100 p-6 md:p-8 rounded-[32px] mb-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 shadow-inner">
             <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[24px] flex items-center justify-center shadow-md text-teal-600 shrink-0 rotate-3 transform transition-transform hover:rotate-6 duration-300">
               <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" />
             </div>
             <div className="text-center md:text-left flex-1 mt-2 md:mt-1">
               <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-teal-800 mb-2 leading-tight">Pilar Kenyamanan Bersama</h3>
               <p className="text-[10px] md:text-xs font-bold text-teal-600/80 uppercase tracking-widest leading-relaxed">
                 Peraturan ini dibuat bukan untuk mengekang, melainkan demi menciptakan lingkungan yang aman, tentram, dan tertib bagi seluruh keluarga besar Skyland Digital.
               </p>
             </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
             <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Daftar Peraturan Warga</h3>
          </div>

          {/* Grid Aturan (Responsif: 1 Kolom HP, 2 Kolom Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {aturan.map((item, index) => (
              <div 
                key={index} 
                className="p-5 md:p-6 bg-white border-2 border-gray-50 hover:border-teal-100 rounded-[28px] shadow-sm hover:shadow-md transition-all group flex gap-4 md:gap-5 items-start cursor-default"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-black text-sm md:text-base shrink-0 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-teal-100/50">
                  {index + 1}
                </div>
                <div className="mt-1 flex-1">
                  <p className="text-[11px] md:text-xs font-black text-gray-600 uppercase tracking-tighter leading-relaxed group-hover:text-black transition-colors duration-300">
                    {item}
                  </p>
                  {/* Ikon kecil muncul pas dihover buat pemanis */}
                  <div className="h-0 overflow-hidden opacity-0 group-hover:h-5 group-hover:opacity-100 group-hover:mt-3 transition-all duration-300 flex items-center gap-1.5 text-teal-600">
                     <CheckCircle2 size={14} />
                     <span className="text-[8px] font-black uppercase tracking-widest">Wajib Dipatuhi</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}