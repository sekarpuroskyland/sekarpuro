'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Wallet, CreditCard, Check, ChevronRight, Copy, Info } from 'lucide-react'

export default function Pembayaran() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profilWarga, setProfilWarga] = useState<any>(null)
  const [tagihanTerbaru, setTagihanTerbaru] = useState<any>(null)

  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    const getData = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return; }

      const { data: warga } = await supabase.from('warga').select('*').eq('email', session.user.email).single()
      if (warga) {
        setProfilWarga(warga)
        const { data: tagihan } = await supabase
          .from('tagihan')
          .select('*')
          .eq('warga_id', warga.id)
          .eq('status', 'belum lunas')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (tagihan) setTagihanTerbaru(tagihan)
      }
      setLoading(false)
    }
    getData()
  }, [router])

  const triggerAlert = (msg: string) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleKonfirmasiWA = () => {
    if (!profilWarga) return
    const phoneAdmin = "628123456789" // GANTI NOMOR WA ADMIN
    
    const infoTagihan = tagihanTerbaru 
      ? `Bulan: *${tagihanTerbaru.bulan}*%0ANominal: *Rp ${tagihanTerbaru.nominal.toLocaleString('id-ID')}*` 
      : `Bulan: *(Sebutkan Bulan)*%0ANominal: *(Sebutkan Nominal)*`

    const pesan = `Halo Admin Skyland!%0A%0ASaya ingin mengirimkan bukti transfer pembayaran iuran:%0A--------------------%0ANama: *${profilWarga.nama_lengkap}*%0ABlok: *${profilWarga.blok_rumah}*%0A${infoTagihan}%0A--------------------%0ABerikut saya lampirkan foto struknya. Terima kasih! 🙏`
    
    window.open(`https://wa.me/${phoneAdmin}?text=${pesan}`, '_blank')
    triggerAlert("Membuka WhatsApp Admin...")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    triggerAlert("Nomor Rekening Mandiri Disalin!")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {/* TOAST MODERN */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
          <div className="bg-black/90 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="bg-green-500 p-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]"><Check className="text-white w-4 h-4" strokeWidth={4} /></div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Container utama: Edge-to-Edge di HP, Lebar di Desktop */}
      <div className="w-full md:max-w-4xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-0 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Mewah */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-amber-500 to-orange-600 md:rounded-b-[40px] shadow-lg overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative flex items-center gap-4 z-10 text-white">
            <button onClick={() => router.back()} className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-white/20 hover:bg-white/30">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Pembayaran</h1>
              <p className="text-[9px] md:text-[10px] text-orange-100 font-black uppercase tracking-[0.2em] mt-1 md:mt-2">Transfer & Konfirmasi</p>
            </div>
          </div>
        </div>

        {/* Content Area dibelah dua kalau di Desktop */}
        <div className="flex flex-col md:flex-row gap-8 px-6 md:px-12 mt-8 md:mt-12 md:pb-12 flex-1">
          
          {/* Kolom Kiri: Info Tagihan & Tombol */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Ringkasan Tagihan
            </h3>

            <div className="bg-orange-50 border border-orange-100 p-6 md:p-8 rounded-[32px] mb-8 flex items-center justify-between shadow-inner">
               <div>
                 <p className="text-[10px] md:text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Total Belum Dibayar</p>
                 {loading ? (
                   <div className="h-8 w-32 bg-orange-200 animate-pulse rounded-lg"></div>
                 ) : (
                   <h2 className="text-2xl md:text-4xl font-black text-black tracking-tighter">
                     {tagihanTerbaru ? `Rp ${tagihanTerbaru.nominal.toLocaleString('id-ID')}` : 'Rp 0'}
                   </h2>
                 )}
                 <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-2">
                   Untuk Bulan: <span className="text-orange-600">{tagihanTerbaru ? tagihanTerbaru.bulan : '-'}</span>
                 </p>
               </div>
               <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-[20px] flex items-center justify-center shadow-md text-orange-500 rotate-3">
                 <Wallet className="w-6 h-6 md:w-8 md:h-8" />
               </div>
            </div>

            <div className="hidden md:block bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-[28px] mb-8 text-center">
               <Info className="w-6 h-6 text-gray-400 mx-auto mb-2" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                 Pastikan nominal transfer sesuai dengan tagihan.<br/>Simpan bukti transfer untuk dikirim ke Admin.
               </p>
            </div>

            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Langkah Terakhir
            </h3>

            <button 
              onClick={handleKonfirmasiWA} 
              className="w-full relative overflow-hidden group bg-black text-white p-5 md:p-6 rounded-[28px] shadow-xl active:scale-95 transition-all text-left"
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-xs md:text-sm uppercase tracking-widest mb-1">Konfirmasi Pembayaran</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Kirim bukti transfer ke WhatsApp</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </div>
              <span className="absolute block inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>

          {/* Kolom Kanan: Kartu ATM Virtual */}
          <div className="w-full md:w-[400px] mt-2 md:mt-0 flex flex-col justify-center">
            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-blue-600"></span> Rekening Tujuan
            </h3>

            <div className="relative p-8 md:p-10 rounded-[35px] bg-gradient-to-br from-[#0B1E59] to-[#1A3673] text-white shadow-2xl shadow-blue-900/30 overflow-hidden transform transition-transform hover:scale-[1.02] duration-300">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#F2C94C]/20 rounded-full blur-xl translate-y-1/3 -translate-x-1/4"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-10 md:mb-12">
                <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/80 mb-1">Bank Transfer</p>
                  <h3 className="text-2xl font-black italic tracking-tighter text-[#F2C94C] drop-shadow-sm">MANDIRI</h3>
                </div>
                <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white/50" />
              </div>

              <div className="relative z-10 mb-8 md:mb-10">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/80 mb-2">Nomor Rekening</p>
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl md:text-[32px] font-black tracking-widest drop-shadow-md leading-none">
                    144 00 <span className="text-blue-300">1234567</span> 8
                  </h4>
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-200/80 mb-1">Atas Nama</p>
                  <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-white drop-shadow-sm">PENGURUS RT SKYLAND</h4>
                </div>
                <button 
                  onClick={() => copyToClipboard("1440012345678")} 
                  className="px-5 py-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/10 transition-all active:scale-95 flex items-center gap-2 shadow-lg"
                  title="Salin Nomor Rekening"
                >
                  <Copy size={16} className="text-white" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Salin</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}