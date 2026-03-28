'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  FileText, BadgeDollarSign, Wallet, 
  MessageCircle, Users, PhoneCall, CheckCircle2, AlertCircle, LogOut, Check, ChevronRight
} from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  
  const [profilWarga, setProfilWarga] = useState<any>(null)
  const [tagihanTerbaru, setTagihanTerbaru] = useState<any>(null)
  // Default loading true agar sinkron dengan render pertama (mencegah hydration error)
  const [loading, setLoading] = useState(true) 

  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    // Dipanggil sekali saja saat halaman pertama kali dibuka
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) { 
        router.push('/')
        return 
      }

      if (session.user.email === 'admin@sekar.com') { 
        router.push('/admin')
        return 
      }

      const { data: warga } = await supabase.from('warga').select('*').eq('email', session.user.email).single()
      if (warga) {
        setProfilWarga(warga)
        const { data: tagihan } = await supabase.from('tagihan').select('*').eq('warga_id', warga.id).order('created_at', { ascending: false }).limit(1).single()
        if (tagihan) setTagihanTerbaru(tagihan)
      }
      
      setLoading(false)
    }

    getData()
  }, []) // <-- KUNCINYA DI SINI: Array kosong [] mencegah Infinite Loop

  const triggerAlert = (msg: string) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleKonfirmasiWA = () => {
    if (!tagihanTerbaru || !profilWarga) return
    const phoneAdmin = "628123456789" 
    const pesan = `Halo Admin!%0ASaya ingin konfirmasi pembayaran iuran:%0A--------------------%0ANama: *${profilWarga.nama_lengkap}*%0ABlok: *${profilWarga.blok_rumah}*%0ABulan: *${tagihanTerbaru.bulan}*%0ANominal: *Rp ${tagihanTerbaru.nominal.toLocaleString('id-ID')}*%0A--------------------%0AMohon dicek ya Admin, terima kasih!`
    
    window.open(`https://wa.me/${phoneAdmin}?text=${pesan}`, '_blank')
    triggerAlert("Membuka WhatsApp Admin...")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
          <div className="bg-black/90 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="bg-green-500 p-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"><Check className="text-white w-4 h-4" strokeWidth={4} /></div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">{toastMsg}</p>
          </div>
        </div>
      )}

      <div className="w-full md:max-w-5xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-0 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* header */}
        <div className="relative px-6 md:px-12 pt-12 pb-10 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 md:rounded-b-[40px] shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative flex justify-between items-start z-10">
            <div className="text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/80 mb-1">Skyland Portal</p>
              <h1 className="text-2xl md:text-4xl font-black mt-1 leading-none drop-shadow-md">Halo, {profilWarga?.nama_lengkap?.split(' ')[0] || 'Warga'}!</h1>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] font-black bg-white/20 backdrop-blur-sm text-white border border-white/20 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-inner">
                  BLOK {profilWarga?.blok_rumah || '-'}
                </span>
                <button onClick={handleLogout} className="text-[10px] font-bold text-red-300 hover:text-red-100 flex items-center gap-1 uppercase tracking-tighter transition-colors bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm active:scale-90"><LogOut size={12} /> Keluar</button>
              </div>
            </div>
            
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-[20px] flex items-center justify-center border border-white/20 shadow-xl relative overflow-hidden group">
               <Users className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md group-hover:scale-110 transition-transform" />
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20"></div>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="flex flex-col md:flex-row gap-8 px-6 md:px-12 mt-8 md:mt-12 md:pb-12">
          
          {/* bagian kiri (menu utama) */}
          <div className="flex-1">
            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Layanan Warga
            </h3>
            
            <div className="grid grid-cols-3 md:grid-cols-3 gap-4 text-center">
              
              <button onClick={() => router.push('/tata-tertib')} className="flex flex-col items-center group p-3 md:p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 outline-none">
                <span className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-teal-50 to-teal-100/50 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-active:scale-90 transition-transform border border-teal-100/50"><FileText className="text-teal-600 w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" /></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-700 group-hover:text-black">Aturan</span>
              </button>

              <button onClick={() => router.push('/tagihan')} className="flex flex-col items-center group p-3 md:p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 outline-none">
                <span className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-red-50 to-red-100/50 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-active:scale-90 transition-transform border border-red-100/50"><BadgeDollarSign className="text-red-500 w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" /></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-700 group-hover:text-black">Tagihan</span>
              </button>

              <button onClick={() => router.push('/pembayaran')} className="flex flex-col items-center group p-3 md:p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 outline-none">
                <span className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-amber-50 to-amber-100/50 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-active:scale-90 transition-transform border border-amber-100/50"><Wallet className="text-amber-500 w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" /></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-700 group-hover:text-black">Bayar</span>
              </button>

              <button onClick={() => router.push('/pengaduan')} className="flex flex-col items-center group p-3 md:p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 outline-none">
                <span className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-indigo-50 to-indigo-100/50 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-active:scale-90 transition-transform border border-indigo-100/50"><MessageCircle className="text-indigo-500 w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" /></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-700 group-hover:text-black">Laporan</span>
              </button>

              <button onClick={() => router.push('/kontak-darurat')} className="flex flex-col items-center group p-3 md:p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 outline-none">
                <span className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-emerald-50 to-emerald-100/50 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-active:scale-90 transition-transform border border-emerald-100/50"><PhoneCall className="text-emerald-500 w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" /></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-700 group-hover:text-black">Kontak</span>
              </button>

              <button onClick={() => router.push('/data-warga')} className="flex flex-col items-center group p-3 md:p-6 rounded-3xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 outline-none">
                <span className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-blue-50 to-blue-100/50 rounded-2xl flex items-center justify-center mb-3 shadow-sm group-active:scale-90 transition-transform border border-blue-100/50"><Users className="text-blue-500 w-6 h-6 md:w-8 md:h-8 drop-shadow-sm" /></span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-gray-700 group-hover:text-black">Warga</span>
              </button>

            </div>
          </div>

          {/* Bagian Kanan: Widget Tagihan */}
          <div className="w-full md:w-[380px] mt-4 md:mt-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span> Info Tagihan
              </h3>
              <button onClick={() => router.push('/tagihan')} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-0.5 hover:underline outline-none">Semua <ChevronRight size={14}/></button>
            </div>

            {loading ? (
              <div className="h-44 bg-gray-100 animate-pulse rounded-[35px]"></div>
            ) : tagihanTerbaru ? (
              <div className="relative p-[2px] rounded-[35px] bg-gradient-to-b from-gray-100 to-white shadow-xl shadow-gray-200/50 overflow-hidden h-full">
                  <div className={`absolute inset-0 opacity-10 ${tagihanTerbaru.status === 'lunas' ? 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-green-500' : 'bg-[url("https://www.transparenttextures.com/patterns/diagonal-striped-brick.png")] bg-red-500'}`}></div>
                  
                  <div className="relative bg-white p-6 md:p-8 rounded-[33px] z-10 flex flex-col items-center text-center h-full justify-center">
                      <p className="font-black text-[10px] text-gray-400 mb-2 uppercase tracking-[0.2em]">Bulan {tagihanTerbaru.bulan}</p>
                      <h4 className="font-black text-3xl md:text-4xl mb-1 text-black tracking-tighter"><span className="text-sm text-gray-400 align-top mr-1">Rp</span>{tagihanTerbaru.nominal.toLocaleString('id-ID')}</h4>
                      
                      <div className={`mt-3 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border shadow-sm ${tagihanTerbaru.status === 'lunas' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {tagihanTerbaru.status === 'lunas' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>} {tagihanTerbaru.status}
                      </div>

                      {tagihanTerbaru.status !== 'lunas' && (
                          <div className="w-full mt-6">
                              <button onClick={handleKonfirmasiWA} className="w-full relative overflow-hidden group bg-black text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all border-none outline-none">
                                  <span className="relative z-10 flex items-center justify-center gap-2">Bayar Sekarang <ChevronRight size={14}/></span>
                                  <span className="absolute block inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                              </button>
                          </div>
                      )}
                  </div>
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-[35px] text-center border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><BadgeDollarSign className="text-gray-300"/></div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Belum ada tagihan baru</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}