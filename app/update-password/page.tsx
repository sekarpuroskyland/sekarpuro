'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, Check, AlertTriangle, KeyRound, ArrowRight } from 'lucide-react'

export default function UpdatePassword() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const triggerToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi dasar
    if (password.length < 6) {
      return triggerToast('Password minimal 6 karakter!', 'error')
    }
    if (password !== confirmPassword) {
      return triggerToast('Password konfirmasi tidak sama!', 'error')
    }

    setLoading(true)
    try {
      // Fungsi sakti Supabase untuk update password user yang lagi buka link reset
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      triggerToast('Password berhasil diubah!', 'success')
      
      // Kasih jeda 2 detik biar warganya baca toast-nya, trus lempar ke halaman Login
      setTimeout(() => {
        router.push('/')
      }, 2000)

    } catch (err: any) {
      triggerToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center font-sans p-6 text-black relative">
      
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

      {/* KOTAK UPDATE PASSWORD */}
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 relative z-10 animate-in zoom-in duration-500">
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-[20px] mx-auto mb-4 flex items-center justify-center shadow-lg shadow-indigo-600/30 rotate-3">
             <KeyRound className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase leading-none text-black">Password Baru</h1>
          <p className="text-gray-400 text-[10px] font-bold mt-3 uppercase tracking-[0.2em] leading-relaxed">
            Silakan masukkan password baru untuk akun Anda. Pastikan mudah diingat.
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password Baru" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all text-black shadow-sm" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              autoFocus
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Ulangi Password Baru" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white font-bold transition-all text-black shadow-sm" 
              required 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full relative overflow-hidden group bg-black text-white py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-gray-400 disabled:scale-100 mt-6"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Simpan Password <Check className="w-4 h-4 group-hover:scale-125 transition-transform" /></>}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>

        </form>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => router.push('/')}
            className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
          >
            Batal & Kembali ke Login
          </button>
        </div>

      </div>
    </div>
  )
}