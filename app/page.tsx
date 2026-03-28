'use client'
import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, Loader2, UserPlus, KeyRound, Check, AlertTriangle } from 'lucide-react'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // STATE UNTUK TOAST & MODAL LUPA PASSWORD
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  const triggerToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      
      if (authError) throw authError
      
      if (data.user) {
        triggerToast('Login Berhasil!', 'success')
        if (data.user.email === 'admin@sekar.com') {
          router.push('/admin') 
        } else {
          router.push('/dashboard') 
        }
      }
    } catch (err: any) {
      triggerToast(err.message === 'Invalid login credentials' ? 'Email atau Password salah!' : err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // LOGIKA RESET PASSWORD SUPABASE
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return triggerToast('Masukkan email dulu bos!', 'error')
    setIsResetting(true)

    // Supabase ngirim email reset otomatis
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/update-password`, // Diarahkan ke halaman bikin password baru nanti
    })

    if (error) {
      triggerToast('Gagal mengirim link reset', 'error')
    } else {
      triggerToast('Link reset terkirim ke email!', 'success')
      setShowResetModal(false)
      setResetEmail('')
    }
    setIsResetting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center font-sans p-6 text-black relative">
      
      {/* TOAST MODERN (Pengganti Alert Merah Jadul) */}
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

      {/* MODAL LUPA PASSWORD */}
      {showResetModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <KeyRound size={36} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2 text-black">Reset Password</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 leading-relaxed">
              Masukkan email akun Anda. Kami akan mengirimkan link untuk membuat password baru.
            </p>
            
            <form onSubmit={handleResetPassword} className="text-left mb-8">
              <div className="relative mb-6">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                <input 
                  type="email" 
                  placeholder="Email terdaftar..." 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-black" 
                  value={resetEmail} 
                  onChange={e => setResetEmail(e.target.value)} 
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 transition-colors">Batal</button>
                <button type="submit" disabled={isResetting} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-colors flex justify-center items-center">
                  {isResetting ? <Loader2 className="animate-spin w-4 h-4" /> : 'Kirim Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KOTAK LOGIN UTAMA */}
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 relative z-10">
        
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[20px] mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-600/30 rotate-3">
             <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-black">Skyland Digital</h1>
          <p className="text-gray-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">Resident Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="email" 
              placeholder="Email Warga" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white font-bold transition-all text-black shadow-sm" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white font-bold transition-all text-black shadow-sm" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            {/* TOMBOL LUPA PASSWORD */}
            <div className="text-right mt-2 mr-2">
              <button 
                type="button" 
                onClick={() => setShowResetModal(true)}
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline outline-none"
              >
                Lupa Password?
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full relative overflow-hidden group bg-black text-white py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-gray-400 disabled:scale-100 mt-2"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Masuk Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </button>
        </form>

        <div className="relative my-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Atau</span>
        </div>

        {/* TOMBOL KE REGISTER */}
        <button 
          onClick={() => router.push('/register')}
          className="w-full border-2 border-gray-100 text-gray-500 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
        >
          <UserPlus size={16} /> Daftar Akun Warga
        </button>

      </div>
    </div>
  )
}