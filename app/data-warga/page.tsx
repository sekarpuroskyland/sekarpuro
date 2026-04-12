'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Search, CheckCircle2, AlertCircle, RefreshCcw, Check, Users } from 'lucide-react'

export default function DataWarga() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listWarga, setListWarga] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    fetchWarga()
  }, [])

  const fetchWarga = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('warga')
      .select(`
        id, nama_lengkap, blok_rumah, email,
        tagihan ( status, bulan, created_at )
      `)
      .neq('email', 'admin@sekar.com')
      .order('blok_rumah', { ascending: true })

    if (data) {
      const formatted = data.map(w => ({
        ...w,
        statusTerakhir: w.tagihan?.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]?.status || 'belum ada data'
      }))
      setListWarga(formatted)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
          <div className="bg-black/90 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="bg-blue-500 p-2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Check className="text-white w-4 h-4" strokeWidth={4} />
            </div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">Memuat data terbaru...</p>
          </div>
        </div>
      )}

      <div className="w-full md:max-w-5xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-12 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header - LOGO SUDAH DILURUSKAN */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-900 md:rounded-b-[40px] shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative flex justify-between items-start z-20 text-white">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/dashboard')} 
                className="relative z-50 p-3 bg-white/10 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-white/20 hover:bg-white/20 shadow-sm cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Data Warga</h1>
                <p className="text-[9px] md:text-[10px] text-cyan-200 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Status Iuran Transparan</p>
              </div>
            </div>

            {/* LOGO SKYVIA KANAN - SUDAH TEGAK LURUS */}
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl relative overflow-hidden group p-2">
               <Image 
                 src="/images/skyvia.png" 
                 alt="Skyvia Logo" 
                 width={48} 
                 height={48} 
                 className="object-contain group-hover:scale-110 transition-transform duration-300"
               />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 md:px-12 mt-8 md:mt-10 flex-1">
          
          <div className="bg-gray-50 border-2 border-gray-100 rounded-[28px] flex items-center px-5 py-4 gap-4 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm mb-8 md:w-1/2">
            <Search size={20} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari Nama atau Blok..." 
              className="bg-transparent outline-none text-sm font-bold w-full uppercase text-black placeholder:text-gray-300"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Daftar Warga Skyvia</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20 text-gray-300">
              <RefreshCcw className="animate-spin mb-4 w-10 h-10 text-blue-200" />
              <p className="text-[10px] font-black uppercase tracking-widest">Singkronisasi Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              {listWarga
                .filter(w => w.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) || w.blok_rumah.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((warga) => (
                  <div key={warga.id} className="p-5 md:p-6 bg-white border-2 border-gray-50 rounded-[28px] flex items-center justify-between shadow-sm transition-all hover:border-blue-100 hover:shadow-md group cursor-default">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[20px] flex items-center justify-center font-black text-sm md:text-base shadow-inner transition-colors duration-300 ${warga.statusTerakhir === 'lunas' ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-red-50 text-red-600 group-hover:bg-red-100'}`}>
                        {warga.blok_rumah}
                      </div>
                      <div>
                        <h4 className="font-black text-sm md:text-base uppercase leading-none mb-1 text-gray-800 group-hover:text-black transition-colors">{warga.nama_lengkap}</h4>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warga Skyvia</p>
                      </div>
                    </div>

                    <div className={`flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-black text-[9px] md:text-[10px] uppercase shadow-sm transition-transform group-hover:scale-105 ${
                      warga.statusTerakhir === 'lunas' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {warga.statusTerakhir === 'lunas' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                      {warga.statusTerakhir}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}