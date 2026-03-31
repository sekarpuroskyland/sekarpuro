'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { 
  Search, RefreshCcw, PlusCircle, LogOut, Phone, Trash2, Edit3, Check, AlertTriangle, Plus, ShieldCheck, UserPlus, Megaphone
} from 'lucide-react'

export default function AdminPanel() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [dataTagihan, setDataTagihan] = useState<any[]>([])
  const [dataWarga, setDataWarga] = useState<any[]>([])
  const [dataKontak, setDataKontak] = useState<any[]>([])
  const [dataPengumuman, setDataPengumuman] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  
  const [bulanBaru, setBulanBaru] = useState('')
  const [bulanHapus, setBulanHapus] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tabActive, setTabActive] = useState('iuran')

  // MODERN NOTIFICATION & MODAL STATES
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [confirmModal, setConfirmModal] = useState({ show: false, msg: '', action: () => {} })
  
  // MODAL INPUT
  const [contactModal, setContactModal] = useState({ show: false, nama: '', nomer: '' })
  const [nominalModal, setNominalModal] = useState({ show: false, id: '', blok: '', nama: '', nominal: '' })
  // MODAL PENGUMUMAN BARU
  const [pengumumanModal, setPengumumanModal] = useState({ show: false, id: null as string | null, judul: '', isi: '', tanggal_acara: '' })

  useEffect(() => {
    setIsMounted(true)
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || session.user.email !== 'admin@sekar.com') {
        router.push('/')
        return
      }
      await refreshData()
      setLoading(false)
    }
    init()
  }, [router])

  const refreshData = async () => {
    const [tagihan, warga, kontak, pengumuman] = await Promise.all([
      supabase.from('tagihan').select('*, warga(*)').order('created_at', { ascending: false }),
      supabase.from('warga').select('*').neq('email', 'admin@sekar.com').order('blok_rumah', { ascending: true }),
      supabase.from('kontak_darurat').select('*').order('created_at', { ascending: false }),
      supabase.from('pengumuman').select('*').order('tanggal_acara', { ascending: false })
    ])
    
    const filteredTagihan = tagihan.data?.filter(t => t.warga?.email !== 'admin@sekar.com') || []
    
    setDataTagihan(filteredTagihan)
    setDataWarga(warga.data || [])
    setDataKontak(kontak.data || [])
    setDataPengumuman(pengumuman.data || [])
  }

  const triggerToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  // --- LOGIKA PENGUMUMAN ---
  const simpanPengumuman = async () => {
    if (!pengumumanModal.judul || !pengumumanModal.isi || !pengumumanModal.tanggal_acara) {
      return triggerToast("Isi semua data pengumuman!", "error")
    }

    const payload = {
      judul: pengumumanModal.judul,
      isi: pengumumanModal.isi,
      tanggal_acara: pengumumanModal.tanggal_acara
    }

    let error
    if (pengumumanModal.id) {
      // UPDATE
      const res = await supabase.from('pengumuman').update(payload).eq('id', pengumumanModal.id)
      error = res.error
    } else {
      // INSERT BARU
      const res = await supabase.from('pengumuman').insert([payload])
      error = res.error
    }

    if (!error) {
      await refreshData()
      triggerToast(pengumumanModal.id ? "Pengumuman diupdate" : "Pengumuman disiarkan", "success")
      setPengumumanModal({ show: false, id: null, judul: '', isi: '', tanggal_acara: '' })
    } else {
      triggerToast("Gagal! Cek tabel 'pengumuman' di Supabase", "error")
    }
  }

  const hapusPengumuman = (id: string) => {
    setConfirmModal({
      show: true,
      msg: "Hapus pengumuman ini secara permanen?",
      action: async () => {
        await supabase.from('pengumuman').delete().eq('id', id)
        await refreshData()
        triggerToast("Pengumuman dihapus")
        setConfirmModal({ ...confirmModal, show: false })
      }
    })
  }

  // --- LOGIKA IURAN ---
  const generateTagihanMasal = async () => {
    if (!bulanBaru) return triggerToast("⚠️ Isi bulannya dulu bos!", "error")
    setIsProcessing(true)
    const { data: listWarga } = await supabase.from('warga').select('id, nominal_iuran').neq('email', 'admin@sekar.com')
    if (listWarga && listWarga.length > 0) {
      const batch = listWarga.map(w => ({
        warga_id: w.id,
        bulan: bulanBaru.toUpperCase(),
        nominal: w.nominal_iuran || 75000,
        status: 'belum lunas'
      }))
      await supabase.from('tagihan').insert(batch)
      setBulanBaru('')
      await refreshData()
      triggerToast("Tagihan masal berhasil dibuat!")
    } else {
      triggerToast("Tidak ada data warga!", "error")
    }
    setIsProcessing(false)
  }

  const handleHapusMasal = () => {
    if (!bulanHapus) return triggerToast("⚠️ Ketik bulan yg mau dihapus!", "error")
    setConfirmModal({
      show: true,
      msg: `Hapus permanen semua tagihan bulan ${bulanHapus.toUpperCase()}?`,
      action: async () => {
        setIsProcessing(true)
        await supabase.from('tagihan').delete().eq('bulan', bulanHapus.toUpperCase())
        setBulanHapus('')
        await refreshData()
        triggerToast(`Tagihan ${bulanHapus} dibersihkan`)
        setIsProcessing(false)
        setConfirmModal({ ...confirmModal, show: false })
      }
    })
  }

  const handleHapusSingle = (id: string) => {
    setConfirmModal({
      show: true,
      msg: "Hapus data tagihan ini?",
      action: async () => {
        await supabase.from('tagihan').delete().eq('id', id)
        await refreshData()
        triggerToast("Data dihapus")
        setConfirmModal({ ...confirmModal, show: false })
      }
    })
  }

  const updateStatus = async (id: string, stat: string) => {
    await supabase.from('tagihan').update({ status: stat }).eq('id', id)
    await refreshData()
    triggerToast(`Status: ${stat}`)
  }

  // --- LOGIKA KONTAK ---
  const executeTambahKontak = async () => {
    if (!contactModal.nama || !contactModal.nomer) return triggerToast("Isi semua data kontak!", "error")
    
    const { error } = await supabase.from('kontak_darurat').insert([{ 
      nama: contactModal.nama, 
      nomer: contactModal.nomer, 
      jabatan: 'Petugas' 
    }])
    
    if (!error) {
      await refreshData()
      triggerToast("Kontak berhasil ditambah")
      setContactModal({ show: false, nama: '', nomer: '' })
    } else {
      triggerToast("Gagal menambah kontak", "error")
    }
  }

  const handleHapusKontak = (id: string) => {
    setConfirmModal({
      show: true,
      msg: "Hapus kontak ini?",
      action: async () => {
        await supabase.from('kontak_darurat').delete().eq('id', id)
        await refreshData()
        triggerToast("Kontak dihapus")
        setConfirmModal({ ...confirmModal, show: false })
      }
    })
  }

  // --- LOGIKA UBAH NOMINAL WARGA ---
  const executeEditNominal = async () => {
    if (!nominalModal.nominal || isNaN(Number(nominalModal.nominal))) return triggerToast("Nominal tidak valid!", "error")
    
    const { error } = await supabase.from('warga')
      .update({ nominal_iuran: parseInt(nominalModal.nominal) })
      .eq('id', nominalModal.id)
    
    if (!error) {
      await refreshData()
      triggerToast("Nominal berhasil diupdate")
      setNominalModal({ show: false, id: '', blok: '', nama: '', nominal: '' })
    } else {
      triggerToast("Gagal update nominal", "error")
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!isMounted) return null;
  
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-blue-600 uppercase tracking-widest flex-col gap-4">
      <RefreshCcw className="w-10 h-10 animate-spin" />
      <p className="text-xs">Memverifikasi Admin...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {/* 1. CUSTOM TOAST ALERT (Z-INDEX NAIK JADI 9999 BIAR NEMBUS MODAL) */}
      {toast.show && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in zoom-in slide-in-from-top-10 duration-500 w-max">
          <div className={`${toast.type === 'success' ? 'bg-black' : 'bg-red-600'} text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md`}>
            <div className={`${toast.type === 'success' ? 'bg-green-500' : 'bg-white/20'} p-2 rounded-full shadow-lg`}>
              {toast.type === 'success' ? <Check className="text-white w-4 h-4" strokeWidth={4} /> : <AlertTriangle className="text-white w-4 h-4" strokeWidth={4} />}
            </div>
            <p className="font-black text-[10px] uppercase tracking-[0.2em]">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* 2. CUSTOM CONFIRM MODAL (DELETE) */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="font-black text-lg uppercase mb-2">Konfirmasi</h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-8">{confirmModal.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 transition-colors">Batal</button>
              <button onClick={confirmModal.action} className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-colors">Eksekusi</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL PENGUMUMAN */}
      {pengumumanModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 text-orange-500 rounded-full flex items-center justify-center">
                <Megaphone size={24} />
              </div>
              <h3 className="font-black text-lg uppercase text-black">{pengumumanModal.id ? 'Edit Pengumuman' : 'Buat Pengumuman'}</h3>
            </div>
            
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Judul Info / Acara</label>
                <input 
                  type="text" 
                  placeholder="Misal: Kerja Bakti Rutin" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm outline-none focus:border-amber-500 focus:bg-white transition-all text-black" 
                  value={pengumumanModal.judul} 
                  onChange={e => setPengumumanModal({...pengumumanModal, judul: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Detail Pengumuman</label>
                <textarea 
                  rows={4}
                  placeholder="Penjelasan detail acaranya..." 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm outline-none focus:border-amber-500 focus:bg-white transition-all resize-none text-black" 
                  value={pengumumanModal.isi} 
                  onChange={e => setPengumumanModal({...pengumumanModal, isi: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Tanggal Pelaksanaan</label>
                <input 
                  type="date" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm outline-none focus:border-amber-500 focus:bg-white transition-all text-black" 
                  value={pengumumanModal.tanggal_acara} 
                  onChange={e => setPengumumanModal({...pengumumanModal, tanggal_acara: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setPengumumanModal({ show: false, id: null, judul: '', isi: '', tanggal_acara: '' })} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 transition-colors">Batal</button>
              <button onClick={simpanPengumuman} className="flex-[1.5] py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-orange-500/30 transition-colors">Siarkan Info</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL TAMBAH KONTAK */}
      {contactModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus size={36} />
            </div>
            <h3 className="font-black text-lg uppercase mb-6 text-black">Tambah Kontak Baru</h3>
            
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nama / Jabatan</label>
                <input 
                  type="text" 
                  placeholder="Misal: Satpam Blok A" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-black" 
                  value={contactModal.nama} 
                  onChange={e => setContactModal({...contactModal, nama: e.target.value})} 
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 mb-1 block">Nomor WhatsApp</label>
                <input 
                  type="number" 
                  placeholder="Misal: 628123456789" 
                  className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all text-black" 
                  value={contactModal.nomer} 
                  onChange={e => setContactModal({...contactModal, nomer: e.target.value})} 
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setContactModal({ show: false, nama: '', nomer: '' })} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 transition-colors">Batal</button>
              <button onClick={executeTambahKontak} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL EDIT NOMINAL */}
      {nominalModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Edit3 size={36} />
            </div>
            <h3 className="font-black text-lg uppercase mb-1 text-black">Ubah Nominal</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Blok {nominalModal.blok} • {nominalModal.nama}</p>
            
            <div className="mb-8 text-left relative">
              <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-2 mb-1 block">Nominal Iuran Baru</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">Rp</span>
                <input 
                  type="number" 
                  placeholder="Misal: 150000" 
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-black text-base outline-none focus:border-indigo-500 focus:bg-white transition-all text-black" 
                  value={nominalModal.nominal} 
                  onChange={e => setNominalModal({...nominalModal, nominal: e.target.value})} 
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setNominalModal({ show: false, id: '', blok: '', nama: '', nominal: '' })} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500 transition-colors">Batal</button>
              <button onClick={executeEditNominal} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg transition-colors">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Container Lebar di Desktop */}
      <div className="w-full md:max-w-6xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-12 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Mewah Tema Biru Tua (Admin) */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 md:rounded-b-[40px] shadow-lg overflow-hidden flex justify-between items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative flex items-center gap-4 z-20 text-white">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/20 rotate-3">
              <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-blue-200" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Admin Skyland</h1>
              <p className="text-[9px] md:text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Control Panel Pusat</p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="relative z-20 px-5 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-200 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-red-500/30 flex items-center gap-2"
          >
            <LogOut size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Keluar</span>
          </button>
        </div>

        {/* Area Konten Utama */}
        <div className="px-6 md:px-12 mt-8 flex-1">
          
          {/* Tab Navigasi Keren */}
          <div className="flex bg-gray-50 p-2 rounded-[24px] shadow-inner mb-8 border border-gray-100 w-full md:w-3/4 mx-auto relative z-10 flex-wrap md:flex-nowrap gap-1">
             <button onClick={() => setTabActive('iuran')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all ${tabActive === 'iuran' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>Iuran</button>
             <button onClick={() => setTabActive('kontak')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all ${tabActive === 'kontak' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>Kontak</button>
             <button onClick={() => setTabActive('warga')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all ${tabActive === 'warga' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>Warga</button>
             <button onClick={() => setTabActive('pengumuman')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase tracking-widest transition-all ${tabActive === 'pengumuman' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>Info Acara</button>
          </div>

          {/* ISI TAB 1: IURAN */}
          {tabActive === 'iuran' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border-2 border-blue-50 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full blur-xl group-hover:bg-blue-100 transition-colors"></div>
                      <h2 className="font-black text-[10px] uppercase mb-4 flex items-center gap-2 text-blue-600 tracking-widest relative z-10"><PlusCircle size={16}/> Tagihan Masal</h2>
                      <input type="text" placeholder="CONTOH: MEI 2026" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl font-black text-sm uppercase outline-none focus:border-blue-500 focus:bg-white transition-all mb-4 relative z-10 placeholder:text-gray-300 text-black" value={bulanBaru} onChange={e => setBulanBaru(e.target.value)} />
                      <button onClick={generateTagihanMasal} disabled={isProcessing} className="w-full bg-black hover:bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all relative z-10 disabled:opacity-50">Generate Tagihan</button>
                  </div>
                  
                  <div className="bg-red-50/50 p-6 md:p-8 rounded-[32px] shadow-sm border-2 border-red-50 relative overflow-hidden group">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-100 rounded-full blur-xl group-hover:bg-red-200 transition-colors"></div>
                      <h2 className="font-black text-[10px] uppercase mb-4 flex items-center gap-2 text-red-600 tracking-widest relative z-10"><AlertTriangle size={16}/> Hapus Per Bulan</h2>
                      <input type="text" placeholder="CONTOH: MEI 2026" className="w-full p-4 bg-white border-2 border-red-100 rounded-2xl font-black text-sm uppercase outline-none focus:border-red-500 transition-all mb-4 text-red-600 relative z-10 placeholder:text-red-200" value={bulanHapus} onChange={e => setBulanHapus(e.target.value)} />
                      <button onClick={handleHapusMasal} disabled={isProcessing} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all relative z-10 disabled:opacity-50">Hapus Masal</button>
                  </div>
              </div>

              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
                   <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> History Tagihan
                   </h3>
                   <div className="relative md:w-64">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Cari nama warga..." className="w-full bg-gray-50 pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 text-xs font-bold outline-none focus:border-blue-500 text-black transition-colors" onChange={e => setSearchTerm(e.target.value)} />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataTagihan.filter(t => t.warga?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                    <div key={t.id} className="bg-white p-5 rounded-[28px] shadow-sm border-2 border-gray-50 flex justify-between items-center hover:border-blue-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-[20px] flex items-center justify-center font-black text-xs uppercase shadow-inner">{t.warga?.blok_rumah}</div>
                        <div>
                          <h4 className="font-black text-xs md:text-sm uppercase text-black leading-none mb-1">{t.warga?.nama_lengkap}</h4>
                          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{t.bulan} • Rp {t.nominal.toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(t.id, t.status === 'lunas' ? 'belum lunas' : 'lunas')} className={`px-4 md:px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${t.status === 'lunas' ? 'bg-green-600 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>{t.status}</button>
                        <button onClick={() => handleHapusSingle(t.id)} className="p-2.5 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl shadow-sm transition-colors border border-gray-100 hover:border-red-500"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                  {dataTagihan.length === 0 && (
                     <div className="col-span-1 md:col-span-2 text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Belum ada data tagihan</p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ISI TAB 2: KONTAK */}
          {tabActive === 'kontak' && (
             <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
               <button 
                  onClick={() => setContactModal({ show: true, nama: '', nomer: '' })} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-[28px] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Plus size={18}/> Tambah Kontak Baru
               </button>
               <div className="grid grid-cols-1 gap-4">
                 {dataKontak.length > 0 ? dataKontak.map(k => (
                    <div key={k.id} className="bg-white p-5 rounded-[28px] shadow-sm border-2 border-gray-50 flex justify-between items-center hover:border-red-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-[20px] flex items-center justify-center shadow-inner"><Phone size={18}/></div>
                        <div>
                          <h4 className="font-black text-sm uppercase text-black leading-none mb-1">{k.nama}</h4>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{k.jabatan} • {k.nomer}</p>
                        </div>
                      </div>
                      <button onClick={() => handleHapusKontak(k.id)} className="p-3 bg-white text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"><Trash2 size={16}/></button>
                    </div>
                 )) : (
                   <div className="text-center py-16 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                      <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Belum ada kontak darurat terdaftar</p>
                   </div>
                 )}
               </div>
             </div>
          )}

          {/* ISI TAB 3: NOMINAL WARGA */}
          {tabActive === 'warga' && (
             <div className="space-y-5 animate-in fade-in duration-500 max-w-3xl mx-auto">
               <div className="bg-indigo-50 p-6 rounded-[28px] mb-2 border border-indigo-100 flex items-start gap-4 shadow-inner">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shrink-0"><Edit3 size={18}/></div>
                  <div>
                    <h3 className="text-xs font-black uppercase text-indigo-900 mb-1">Pengaturan Nominal Iuran</h3>
                    <p className="text-[10px] font-bold text-indigo-700/80 leading-relaxed uppercase tracking-wider">Gunakan menu ini untuk mengubah nominal iuran spesifik setiap warga (misal: ada warga yang nominal iurannya beda karena ukuran rumah).</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {dataWarga.map(w => (
                   <div key={w.id} className="bg-white p-5 rounded-[28px] shadow-sm border-2 border-gray-50 flex justify-between items-center hover:border-indigo-100 transition-colors group">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-50 rounded-[20px] flex items-center justify-center font-black text-xs text-gray-500 uppercase shadow-inner group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{w.blok_rumah}</div>
                       <div>
                          <h4 className="font-black text-sm uppercase text-black leading-none mb-1">{w.nama_lengkap}</h4>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Iuran: Rp {w.nominal_iuran?.toLocaleString('id-ID')}</p>
                       </div>
                     </div>
                     
                     <button 
                       onClick={() => setNominalModal({ show: true, id: w.id, blok: w.blok_rumah, nama: w.nama_lengkap, nominal: w.nominal_iuran || '' })} 
                       className="p-3 bg-white text-indigo-400 rounded-xl shadow-sm border border-indigo-100 active:scale-90 transition-all hover:bg-indigo-600 hover:text-white"
                     >
                       <Edit3 size={16}/>
                     </button>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* ISI TAB BARU 4: PENGUMUMAN Warga */}
          {tabActive === 'pengumuman' && (
             <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
               
               <div className="flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between bg-amber-50 p-6 md:p-8 rounded-[32px] border border-amber-200 shadow-inner">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white text-orange-500 rounded-[20px] flex items-center justify-center shadow-sm shrink-0 rotate-3">
                      <Megaphone size={20}/>
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase text-amber-900 mb-1">Siaran Info Warga</h3>
                      <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-wider">Buat agenda kegiatan atau informasi penting yang akan muncul di Dashboard seluruh warga.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPengumumanModal({ show: true, id: null, judul: '', isi: '', tanggal_acara: '' })} 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all shrink-0"
                  >
                    <Plus size={16}/> Buat Baru
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {dataPengumuman.length > 0 ? dataPengumuman.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[28px] shadow-sm border-2 border-gray-50 flex flex-col justify-between hover:border-orange-100 transition-colors group relative overflow-hidden">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-amber-100 text-orange-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {new Date(p.tanggal_acara).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setPengumumanModal({ show: true, id: p.id, judul: p.judul, isi: p.isi, tanggal_acara: p.tanggal_acara })} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={14}/></button>
                            <button onClick={() => hapusPengumuman(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <h4 className="font-black text-base uppercase text-black leading-tight mb-2">{p.judul}</h4>
                        <p className="text-[11px] font-bold text-gray-500 leading-relaxed line-clamp-3">{p.isi}</p>
                      </div>
                    </div>
                 )) : (
                   <div className="col-span-1 md:col-span-2 text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                      <p className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Belum ada pengumuman yang disiarkan</p>
                   </div>
                 )}
               </div>

             </div>
          )}

        </div>
      </div>
    </div>
  )
}