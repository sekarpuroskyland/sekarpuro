'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Receipt, AlertCircle, CheckCircle2, ChevronRight, CalendarDays, Wallet } from 'lucide-react'

export default function Tagihan() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [listTagihan, setListTagihan] = useState<any[]>([])
  const [totalTunggakan, setTotalTunggakan] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return; }
      
      // Proteksi Admin
      if (session.user.email === 'admin@sekar.com') { router.push('/admin'); return; }

      const { data: warga } = await supabase.from('warga').select('id').eq('email', session.user.email).single()

      if (warga) {
        const { data: tagihan, error } = await supabase
          .from('tagihan')
          .select('*')
          .eq('warga_id', warga.id)
          .order('created_at', { ascending: false })

        if (tagihan) {
          setListTagihan(tagihan)
          // Hitung otomatis total yang belum lunas
          const total = tagihan.filter(t => t.status !== 'lunas').reduce((sum, item) => sum + item.nominal, 0)
          setTotalTunggakan(total)
        }
        if (error) console.log("Error SQL:", error.message)
      }
      setLoading(false)
    }

    fetchData()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {/* Container: Edge-to-Edge di HP, Kotak Lebar di Desktop */}
      <div className="w-full md:max-w-4xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-12 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Mewah Tema Netral (Slate/Dark Gray) */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-slate-700 via-slate-800 to-black md:rounded-b-[40px] shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

          <div className="relative flex items-center gap-4 z-10 text-white">
            <button onClick={() => router.back()} className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-white/20 hover:bg-white/20 shadow-sm">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Tagihan Anda</h1>
              <p className="text-[9px] md:text-[10px] text-slate-300 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Riwayat Iuran Skyland</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 md:px-12 mt-8 md:mt-10 flex-1">
          
          {/* Ringkasan Total Tunggakan (Tema Netral Terang) */}
          <div className="bg-slate-50 border border-slate-200 p-6 md:p-8 rounded-[32px] mb-8 flex items-center justify-between shadow-inner">
             <div>
               <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Total Belum Dibayar</p>
               {loading ? (
                 <div className="h-8 w-32 bg-slate-200 animate-pulse rounded-lg"></div>
               ) : (
                 <h2 className="text-2xl md:text-4xl font-black text-black tracking-tighter">
                   Rp {totalTunggakan.toLocaleString('id-ID')}
                 </h2>
               )}
             </div>
             <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-[20px] flex items-center justify-center shadow-md text-slate-700 rotate-3">
               <Wallet className="w-6 h-6 md:w-8 md:h-8" />
             </div>
          </div>

          <div className="flex items-center gap-2 mb-6">
             <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"></span>
             <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Detail Riwayat Iuran</h3>
          </div>

          {/* List Tagihan */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-50 border-2 border-gray-100 animate-pulse rounded-[28px]"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {listTagihan.length > 0 ? (
                listTagihan.map((item) => (
                  <div key={item.id} className="bg-white border-2 border-gray-50 hover:border-slate-200 rounded-[28px] p-5 md:p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${item.status === 'lunas' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                          <CalendarDays className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                          <p className="font-black text-sm md:text-base uppercase tracking-tighter">{item.bulan}</p>
                          <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest">Iuran Bulanan</p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase shadow-sm ${
                        item.status === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                      }`}>
                        {item.status === 'lunas' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                        {item.status}
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-100 mt-2">
                      <div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Nominal</p>
                        <p className="text-xl md:text-2xl font-black tracking-tighter leading-none">
                          <span className="text-xs text-gray-400 align-top mr-1">Rp</span>
                          {item.nominal.toLocaleString('id-ID')}
                        </p>
                      </div>

                      {item.status !== 'lunas' && (
                        <button 
                          onClick={() => router.push('/pembayaran')}
                          className="relative overflow-hidden group/btn bg-black text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                          <span className="relative z-10 flex items-center gap-1">
                            Bayar <ChevronRight size={14} />
                          </span>
                          {/* Hover tombol jadi hitam pekat ala dark mode */}
                          <span className="absolute inset-0 bg-gradient-to-r from-slate-700 to-black opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                        </button>
                      )}
                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 text-center py-20 bg-gray-50 rounded-[35px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Receipt className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Belum ada history tagihan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}