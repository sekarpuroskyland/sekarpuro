'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Send, MessageSquare, AlertTriangle, Check, ChevronDown } from 'lucide-react'

export default function Pengaduan() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [nama, setNama] = useState('')
  const [blok, setBlok] = useState('')
  
  const [kategori, setKategori] = useState('Keamanan & Ketertiban')
  const [laporan, setLaporan] = useState('')

  // State untuk Custom Dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const [showToast, setShowToast] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const kategoriOptions = [
    "Keamanan & Ketertiban",
    "Kebersihan / Sampah",
    "Fasilitas Umum (Lampu/Jalan)",
    "Infrastruktur / Saluran Air",
    "Lainnya"
  ]

  useEffect(() => {
    const getProfil = async () => {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return; }
      
      if (session.user.email === 'admin@sekar.com') { router.push('/admin'); return; }

      const { data } = await supabase.from('warga').select('*').eq('email', session.user.email).single()
      if (data) {
        setNama(data.nama_lengkap)
        setBlok(data.blok_rumah)
      }
      setLoading(false)
    }
    getProfil()
  }, [router])

  const triggerToast = (msg: string) => {
    setToastMsg(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const kirimWA = (e: React.FormEvent) => {
    e.preventDefault()
    if (!laporan.trim()) return triggerToast("Laporan tidak boleh kosong!")

    const nomerAdmin = "6281233429997" // SUDAH UPDATE NOMOR CLIENT
    const pesan = `*LAPORAN PENGADUAN WARGA SKYVIA*%0A---------------------------%0A*Nama:* ${nama}%0A*Blok:* ${blok}%0A*Kategori:* ${kategori}%0A*Laporan:* ${laporan}%0A---------------------------%0AMohon segera ditindaklanjuti. Terima kasih.`
    
    window.open(`https://wa.me/${nomerAdmin}?text=${pesan}`, '_blank')
    triggerToast("Membuka WhatsApp Admin...")
    setLaporan('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8 overflow-x-hidden">
      
      {/* TOAST MODERN */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in zoom-in slide-in-from-top-10 duration-500 w-max">
          <div className="bg-black/90 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
            <div className="bg-indigo-500 p-2 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"><Check className="text-white w-4 h-4" strokeWidth={4} /></div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">{toastMsg}</p>
          </div>
        </div>
      )}

      {/* Container */}
      <div className="w-full md:max-w-5xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-0 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Mewah Skyvia */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 md:rounded-b-[40px] shadow-lg overflow-hidden flex justify-between items-center">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

          <div className="relative flex items-center gap-4 z-20 text-white">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="relative z-50 p-3 bg-white/10 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-white/20 hover:bg-white/20 shadow-sm cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Pusat Laporan</h1>
              <p className="text-[9px] md:text-[10px] text-indigo-200 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Layanan Bantuan Warga</p>
            </div>
          </div>

          {/* LOGO SKYVIA KANAN - TEGAK LURUS */}
          <div className="relative z-20 w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl p-2 group transition-transform hover:scale-105">
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
        <div className="flex flex-col md:flex-row gap-8 px-6 md:px-12 mt-8 md:mt-12 md:pb-12 flex-1">
          
          {/* Kolom Kiri: Form Pengaduan */}
          <div className="flex-1">
            <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> Form Laporan Skyvia
            </h3>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-gray-100 rounded-2xl"></div>
                <div className="h-32 bg-gray-100 rounded-2xl"></div>
                <div className="h-14 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : (
              <form onSubmit={kirimWA} className="space-y-5 relative">
                
                {/* CUSTOM DROPDOWN KATEGORI */}
                <div className="relative">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-2 mb-1 block">Kategori Masalah</label>
                  
                  <button 
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-4 bg-white border-2 border-gray-100 hover:border-indigo-200 rounded-[24px] font-black text-sm text-left flex justify-between items-center transition-all shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <span className="text-gray-700">{kategori}</span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div 
                    className={`absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl overflow-hidden transition-all duration-300 origin-top ${
                      isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                  >
                    {kategoriOptions.map((opt, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setKategori(opt)
                          setIsDropdownOpen(false)
                        }}
                        className={`p-4 font-bold text-sm cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                          kategori === opt ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                        }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                  
                  {isDropdownOpen && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)}
                    ></div>
                  )}
                </div>

                {/* Textarea Detail */}
                <div className="relative z-10">
                  <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-2 mb-1 block">Detail Laporan</label>
                  <textarea 
                    rows={5}
                    placeholder="Jelaskan masalah secara detail (lokasi, waktu, kendala yang dialami)..."
                    className="w-full p-5 bg-white border-2 border-gray-100 rounded-[28px] font-bold text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all resize-none text-black placeholder:text-gray-400 hover:border-indigo-200 shadow-sm"
                    required
                    value={laporan}
                    onChange={(e) => setLaporan(e.target.value)}
                  ></textarea>
                </div>

                {/* Tombol Kirim */}
                <button 
                  type="submit" 
                  className="w-full relative overflow-hidden group/btn bg-black text-white p-5 rounded-[28px] shadow-xl active:scale-95 transition-all text-center mt-2 z-10"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Send size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Kirim Laporan (WA)</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                </button>
              </form>
            )}
          </div>

          {/* Kolom Kanan: Info Widget */}
          <div className="w-full md:w-[350px] mt-6 md:mt-0 flex flex-col justify-center gap-4">
            
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[32px] flex items-start gap-4 shadow-inner">
               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 shrink-0">
                 <MessageSquare size={20} />
               </div>
               <div>
                 <h4 className="font-black text-xs uppercase text-indigo-900 mb-1">Fast Response</h4>
                 <p className="text-[10px] font-bold text-indigo-700/80 leading-relaxed uppercase tracking-wider">
                   Laporan Anda akan langsung diteruskan ke WhatsApp Pengurus agar segera ditindaklanjuti.
                 </p>
               </div>
            </div>

            <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-6 rounded-[32px] flex items-start gap-4">
               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                 <AlertTriangle size={20} />
               </div>
               <div>
                 <h4 className="font-black text-xs uppercase text-gray-600 mb-1">Kondisi Darurat?</h4>
                 <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
                   Jika terjadi kondisi gawat darurat (kebakaran/maling), segera gunakan menu <span className="text-black font-black underline cursor-pointer" onClick={() => router.push('/kontak-darurat')}>Kontak Darurat</span>.
                 </p>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}