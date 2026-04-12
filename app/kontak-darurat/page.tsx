'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Phone, PhoneCall, ShieldAlert, AlertOctagon, RefreshCcw } from 'lucide-react'

export default function KontakDarurat() {
  const router = useRouter()
  const [kontak, setKontak] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchKontak = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('kontak_darurat')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (data) setKontak(data)
      setLoading(false)
    }
    fetchKontak()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {/* Container: Edge-to-Edge di HP, Kotak di Desktop */}
      <div className="w-full md:max-w-5xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-0 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Mewah Tema Darurat (Merah/Crimson) */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-red-600 via-rose-700 to-red-900 md:rounded-b-[40px] shadow-lg overflow-hidden flex justify-between items-center">
          
          {/* Cahaya Latar */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative flex items-center gap-4 z-20 text-white">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="relative z-50 p-3 bg-white/10 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-white/20 hover:bg-white/20 shadow-sm cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md text-white">Kontak Darurat</h1>
              <p className="text-[9px] md:text-[10px] text-red-100 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Respon Cepat 24 Jam</p>
            </div>
          </div>

          {/* LOGO SKYVIA KANAN - TEGAK LURUS */}
          <div className="relative z-20 w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl overflow-hidden group p-2 transition-transform hover:scale-105">
             <Image 
               src="/images/skyvia.png" 
               alt="Skyvia Logo" 
               width={48} 
               height={48} 
               className="object-contain"
             />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 md:px-12 mt-8 md:mt-10 flex-1 md:pb-12">
          
          {/* Banner Peringatan */}
          <div className="bg-red-50 border border-red-100 p-6 rounded-[32px] mb-8 flex items-start gap-4 md:gap-6 shadow-inner">
             <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-red-600 shrink-0 animate-pulse">
               <ShieldAlert className="w-6 h-6 md:w-7 md:h-7" />
             </div>
             <div>
               <h3 className="text-xs md:text-sm font-black uppercase tracking-widest text-red-800 mb-1 leading-tight">Gunakan Saat Mendesak</h3>
               <p className="text-[10px] md:text-xs font-bold text-red-600/80 uppercase tracking-widest leading-relaxed">
                 Hubungi nomor di bawah ini hanya untuk situasi gawat darurat seperti kebakaran, tindak kriminal, atau bantuan medis segera.
               </p>
             </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
             <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
             <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Daftar Panggilan Cepat Skyvia</h3>
          </div>

          {/* Grid Kontak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {loading ? (
              /* Skeleton Loading */
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-50 border-2 border-gray-100 animate-pulse rounded-[32px]"></div>
              ))
            ) : kontak.length > 0 ? (
              kontak.map((item, index) => (
                <div 
                  key={index} 
                  className="p-4 md:p-5 bg-white border-2 border-gray-50 hover:border-red-100 rounded-[32px] shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 text-red-600 rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-300">
                      <PhoneCall className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm md:text-base uppercase tracking-tighter text-black leading-none mb-1">
                        {item.nama}
                      </h3>
                      <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        {item.jabatan}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tombol Telepon Langsung */}
                  <a 
                    href={`tel:${item.nomer}`} 
                    className="relative overflow-hidden w-12 h-12 md:w-14 md:h-14 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-all group/btn"
                    title={`Hubungi ${item.nama}`}
                  >
                    <Phone className="w-5 h-5 relative z-10 group-hover/btn:animate-bounce" />
                    <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                  </a>
                </div>
              ))
            ) : (
              /* Empty State */
              <div className="col-span-1 md:col-span-2 text-center py-16 bg-gray-50 rounded-[35px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <AlertOctagon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Belum ada kontak darurat</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}