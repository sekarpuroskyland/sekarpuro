'use client'
import { useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Mail, Lock, Home, Phone, ArrowRight, Loader2, LogIn, Check, AlertTriangle } from 'lucide-react'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ nama: '', email: '', password: '', blok: '', no_hp: '' })
  
  // STATE MODERN TOAST
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })

  const triggerToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // 1. Buat akun di Auth Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password 
      })
      if (authError) throw authError
      
      // 2. Masukin data profil ke tabel Warga
      if (authData.user) {
        const { error: dbError } = await supabase.from('warga').insert([{ 
          email: formData.email, 
          nama_lengkap: formData.nama, 
          blok_rumah: formData.blok, 
          no_hp: formData.no_hp 
        }])
        
        if (dbError) throw dbError
        
        triggerToast('Pendaftaran Berhasil! Silakan Login.', 'success')
        
        // Kasih jeda dikit biar warga baca notifnya, terus lempar ke halaman Login
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8 overflow-x-hidden">
      
      {/* TOAST MODERN */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[999] animate-in fade-in zoom-in slide-in-from-top-10 duration-500 w-max">
          <div className={`${toast.type === 'success' ? 'bg-black' : 'bg-red-600'} text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md`}>
            <div className={`${toast.type === 'success' ? 'bg-green-500' : 'bg-white/20'} p-2 rounded-full shadow-lg`}>
              {toast.type === 'success' ? <Check className="text-white w-4 h-4" strokeWidth={4} /> : <AlertTriangle className="text-white w-4 h-4" strokeWidth={4} />}
            </div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* KOTAK REGISTER UTAMA */}
      <div className="w-full max-w-md bg-white md:rounded-[40px] shadow-2xl p-8 md:p-10 border-x md:border border-gray-100 min-h-screen md:min-h-fit relative z-10 animate-in fade-in duration-500">
        
        <div className="mb-10 text-center pt-4 md:pt-0">
          {/* LOGO SKYVIA - TEGAK LURUS SESUAI PERINTAH KING */}
          <div className="w-20 h-20 bg-white border border-gray-100 rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-lg p-2 transition-transform hover:scale-105">
             <Image 
               src="/images/skyvia.png" 
               alt="Skyvia Logo" 
               width={64} 
               height={64} 
               className="object-contain"
             />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-black">Gabung Warga</h1>
          <p className="text-gray-400 text-[10px] font-black mt-3 uppercase tracking-[0.3em]">Portal Skyvia Digital</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all text-black shadow-sm placeholder:text-gray-300" 
              required 
              value={formData.nama}
              onChange={(e) => setFormData({...formData, nama: e.target.value})} 
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Aktif" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all text-black shadow-sm placeholder:text-gray-300" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Blok (A1)" 
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all text-black shadow-sm placeholder:text-gray-300 uppercase" 
                required 
                value={formData.blok}
                onChange={(e) => setFormData({...formData, blok: e.target.value})} 
              />
            </div>
            <div className="relative flex-[1.5]">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input 
                type="number" 
                placeholder="No. WhatsApp" 
                className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all text-black shadow-sm placeholder:text-gray-300" 
                required 
                value={formData.no_hp}
                onChange={(e) => setFormData({...formData, no_hp: e.target.value})} 
              />
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Buat Password" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] outline-none focus:border-blue-500 focus:bg-white font-bold text-sm transition-all text-black shadow-sm placeholder:text-gray-300" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full relative overflow-hidden group bg-black text-white py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-gray-400 disabled:scale-100 mt-6"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Daftar Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </form>

        <div className="relative my-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Atau</span>
        </div>

        <button 
          type="button"
          onClick={() => router.push('/')}
          className="w-full border-2 border-gray-100 text-gray-500 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <LogIn size={16} /> Sudah Ada Akun? Login
        </button>

      </div>
    </div>
  )
}