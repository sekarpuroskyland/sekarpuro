'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Search, RefreshCcw, PlusCircle, LogOut, Phone, Trash2, Edit3, Check, AlertTriangle, Plus, ShieldCheck, UserPlus, Megaphone, TrendingUp, CheckCircle2, UserX, ChevronDown, Layers
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

  // STATE UNTUK FILTER REKAPAN PER BULAN
  const [filterBulan, setFilterBulan] = useState<string>('ALL')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // MODERN NOTIFICATION & MODAL STATES
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' })
  const [confirmModal, setConfirmModal] = useState({ show: false, msg: '', action: () => {} })
  
  // MODAL INPUT
  const [contactModal, setContactModal] = useState({ show: false, nama: '', nomer: '' })
  const [nominalModal, setNominalModal] = useState({ show: false, id: '', blok: '', nama: '', nominal: '' })
  const [pengumumanModal, setPengumumanModal] = useState({ show: false, id: null as string | null, judul: '', isi: '', tanggal_acara: '' })
  const [rapelModal, setRapelModal] = useState({ show: false, warga_id: '', bulan_list: '' })

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

  // --- LOGIKA REKAPAN KEUANGAN ---
  const listBulanUnik = Array.from(new Set(dataTagihan.map(t => t.bulan)))
  const tagihanBulanIni = filterBulan === 'ALL' ? dataTagihan : dataTagihan.filter(t => t.bulan === filterBulan)
  
  const totalUangMasuk = tagihanBulanIni.filter(t => t.status === 'lunas').reduce((sum, t) => sum + t.nominal, 0)
  const wargaLunas = tagihanBulanIni.filter(t => t.status === 'lunas').length
  const wargaBelumLunas = tagihanBulanIni.filter(t => t.status !== 'lunas').length

  const triggerToast = (msg: string, type = 'success') => {
    setToast({ show: true, msg, type })
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000)
  }

  // --- LOGIKA PENGUMUMAN ---
  const simpanPengumuman = async () => {
    if (!pengumumanModal.judul || !pengumumanModal.isi || !pengumumanModal.tanggal_acara) {
      return triggerToast("Isi semua data pengumuman!", "error")
    }
    const payload = { judul: pengumumanModal.judul, isi: pengumumanModal.isi, tanggal_acara: pengumumanModal.tanggal_acara }
    let error
    if (pengumumanModal.id) {
      const res = await supabase.from('pengumuman').update(payload).eq('id', pengumumanModal.id)
      error = res.error
    } else {
      const res = await supabase.from('pengumuman').insert([payload])
      error = res.error
    }

    if (!error) {
      await refreshData()
      triggerToast(pengumumanModal.id ? "Pengumuman diupdate" : "Pengumuman disiarkan")
      setPengumumanModal({ show: false, id: null, judul: '', isi: '', tanggal_acara: '' })
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
    if (!contactModal.nama || !contactModal.nomer) return triggerToast("Isi semua data!", "error")
    const { error } = await supabase.from('kontak_darurat').insert([{ nama: contactModal.nama, nomer: contactModal.nomer, jabatan: 'Petugas' }])
    if (!error) {
      await refreshData()
      triggerToast("Kontak ditambah")
      setContactModal({ show: false, nama: '', nomer: '' })
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

  // --- LOGIKA UBAH NOMINAL ---
  const executeEditNominal = async () => {
    if (!nominalModal.nominal || isNaN(Number(nominalModal.nominal))) return triggerToast("Nominal tidak valid!", "error")
    const { error } = await supabase.from('warga').update({ nominal_iuran: parseInt(nominalModal.nominal) }).eq('id', nominalModal.id)
    if (!error) {
      await refreshData()
      triggerToast("Nominal diupdate")
      setNominalModal({ show: false, id: '', blok: '', nama: '', nominal: '' })
    }
  }

  // --- LOGIKA BAYAR RAPEL ---
  const executeRapel = async () => {
    if (!rapelModal.warga_id || !rapelModal.bulan_list) return triggerToast("Pilih warga dan isi bulan!", "error")
    setIsProcessing(true)
    const arrayBulan = rapelModal.bulan_list.split(',').map(b => b.trim().toUpperCase()).filter(b => b)
    const wargaInfo = dataWarga.find(w => w.id === rapelModal.warga_id)

    if (wargaInfo && arrayBulan.length > 0) {
      const batchTagihan = arrayBulan.map(bln => ({
        warga_id: wargaInfo.id,
        bulan: bln,
        nominal: wargaInfo.nominal_iuran || 75000,
        status: 'lunas'
      }))
      const { error } = await supabase.from('tagihan').insert(batchTagihan)
      if (!error) {
        await refreshData()
        triggerToast(`Sukses bayar rapel ${arrayBulan.length} bulan!`)
        setRapelModal({ show: false, warga_id: '', bulan_list: '' })
      }
    }
    setIsProcessing(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!isMounted) return null;
  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-blue-600 uppercase flex-col gap-4"><RefreshCcw className="animate-spin" /><p className="text-xs">Memverifikasi Admin...</p></div>

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start md:items-center font-sans text-black relative md:p-8">
      
      {/* 1. TOAST */}
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

      {/* 2. CONFIRM MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center animate-in zoom-in">
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
            <h3 className="font-black text-lg uppercase mb-2">Konfirmasi</h3>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-8">{confirmModal.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-black text-[10px] uppercase text-gray-500">Batal</button>
              <button onClick={confirmModal.action} className="flex-1 py-4 bg-red-600 hover:bg-red-700 rounded-2xl font-black text-[10px] uppercase text-white shadow-lg">Eksekusi</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MODAL BAYAR RAPEL */}
      {rapelModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in zoom-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Layers size={24} /></div>
              <div><h3 className="font-black text-lg uppercase text-black mb-1 leading-none">Bayar Rapel</h3><p className="text-[10px] font-bold text-gray-400 uppercase">Input beberapa bulan sekaligus</p></div>
            </div>
            <div className="space-y-4 mb-8">
              <select className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm text-black outline-none focus:border-emerald-500" value={rapelModal.warga_id} onChange={e => setRapelModal({...rapelModal, warga_id: e.target.value})}>
                <option value="">-- Pilih Nama Warga --</option>
                {dataWarga.map(w => <option key={w.id} value={w.id}>Blok {w.blok_rumah} - {w.nama_lengkap}</option>)}
              </select>
              <textarea rows={3} placeholder="JANUARI 2026, FEBRUARI 2026" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-sm uppercase text-black outline-none focus:border-emerald-500" value={rapelModal.bulan_list} onChange={e => setRapelModal({...rapelModal, bulan_list: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRapelModal({ show: false, warga_id: '', bulan_list: '' })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-500">Batal</button>
              <button onClick={executeRapel} className="flex-[1.5] py-4 bg-emerald-500 rounded-2xl font-black text-[10px] uppercase text-white shadow-lg">Proses Rapel</button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL PENGUMUMAN */}
      {pengumumanModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-in zoom-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-50 text-orange-500 rounded-full flex items-center justify-center"><Megaphone size={24} /></div>
              <h3 className="font-black text-lg uppercase text-black">{pengumumanModal.id ? 'Edit Info' : 'Buat Info'}</h3>
            </div>
            <div className="space-y-4 mb-8">
              <input type="text" placeholder="Judul" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-black" value={pengumumanModal.judul} onChange={e => setPengumumanModal({...pengumumanModal, judul: e.target.value})} />
              <textarea rows={4} placeholder="Detail info..." className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-black" value={pengumumanModal.isi} onChange={e => setPengumumanModal({...pengumumanModal, isi: e.target.value})} />
              <input type="date" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-black" value={pengumumanModal.tanggal_acara} onChange={e => setPengumumanModal({...pengumumanModal, tanggal_acara: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPengumumanModal({ show: false, id: null, judul: '', isi: '', tanggal_acara: '' })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-500">Batal</button>
              <button onClick={simpanPengumuman} className="flex-1 py-4 bg-orange-500 rounded-2xl font-black text-[10px] uppercase text-white">Siarkan</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL KONTAK */}
      {contactModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center animate-in zoom-in">
            <UserPlus size={40} className="mx-auto mb-4 text-blue-600" />
            <h3 className="font-black text-lg uppercase mb-6 text-black">Tambah Kontak</h3>
            <div className="space-y-4 mb-8">
              <input type="text" placeholder="Nama" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-black" value={contactModal.nama} onChange={e => setContactModal({...contactModal, nama: e.target.value})} />
              <input type="number" placeholder="Nomor WA (62...)" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-bold text-black" value={contactModal.nomer} onChange={e => setContactModal({...contactModal, nomer: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setContactModal({ show: false, nama: '', nomer: '' })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-500">Batal</button>
              <button onClick={executeTambahKontak} className="flex-1 py-4 bg-blue-600 rounded-2xl font-black text-[10px] uppercase text-white">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL EDIT NOMINAL */}
      {nominalModal.show && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-md bg-black/60">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center animate-in zoom-in">
            <Edit3 size={36} className="mx-auto mb-4 text-indigo-600" />
            <h3 className="font-black text-lg uppercase text-black">Ubah Nominal</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-6">{nominalModal.nama}</p>
            <div className="relative mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">Rp</span>
              <input type="number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-[20px] font-black text-black outline-none focus:border-indigo-500" value={nominalModal.nominal} onChange={e => setNominalModal({...nominalModal, nominal: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setNominalModal({ show: false, id: '', blok: '', nama: '', nominal: '' })} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-[10px] uppercase text-gray-500">Batal</button>
              <button onClick={executeEditNominal} className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase text-white">Update</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTAINER UTAMA */}
      <div className="w-full md:max-w-6xl bg-white md:border border-gray-100 min-h-screen md:min-h-fit md:rounded-[40px] relative pb-10 md:pb-12 md:shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="relative px-6 md:px-12 pt-12 pb-8 bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-900 md:rounded-b-[40px] shadow-lg overflow-hidden flex justify-between items-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative flex items-center gap-4 z-20 text-white">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-white/20 rotate-3 overflow-hidden">
              <Image 
                src="/images/skyvia.png" 
                alt="Skyvia Logo" 
                width={64} 
                height={64} 
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black uppercase italic leading-none drop-shadow-md">Admin Skyvia</h1>
              <p className="text-[9px] md:text-[10px] text-blue-200 font-black uppercase tracking-[0.3em] mt-1 md:mt-2">Control Panel Pusat</p>
            </div>
          </div>

          <button onClick={handleLogout} className="relative z-20 px-5 py-3 bg-red-500/20 hover:bg-red-500/40 text-red-200 backdrop-blur-sm rounded-2xl active:scale-90 transition-all border border-red-500/30 flex items-center gap-2">
            <LogOut size={16} /> <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Keluar</span>
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="px-6 md:px-12 mt-8 flex-1">
          <div className="flex bg-gray-50 p-2 rounded-[24px] shadow-inner mb-8 border border-gray-100 w-full md:w-3/4 mx-auto relative z-10 flex-wrap md:flex-nowrap gap-1">
             <button onClick={() => setTabActive('iuran')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all ${tabActive === 'iuran' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>Iuran</button>
             <button onClick={() => setTabActive('kontak')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all ${tabActive === 'kontak' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>Kontak</button>
             <button onClick={() => setTabActive('warga')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all ${tabActive === 'warga' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>Warga</button>
             <button onClick={() => setTabActive('pengumuman')} className={`flex-[1_0_45%] md:flex-1 py-3 rounded-[18px] font-black text-[10px] uppercase transition-all ${tabActive === 'pengumuman' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-100'}`}>Info Acara</button>
          </div>

          {/* TAB 1: IURAN */}
          {tabActive === 'iuran' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* REKAPAN */}
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Rekap Keuangan</h3></div>
                  <div className="relative">
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between gap-3 bg-gray-50 border-2 border-gray-100 text-black text-xs font-black uppercase rounded-xl px-5 py-3 min-w-[220px]">
                      {filterBulan === 'ALL' ? '-- SEMUA BULAN --' : filterBulan} <ChevronDown size={16} className={`${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-full min-w-[220px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                        <button onClick={() => { setFilterBulan('ALL'); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase ${filterBulan === 'ALL' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>-- SEMUA DATA --</button>
                        {listBulanUnik.map((bln, idx) => (
                          <button key={idx} onClick={() => { setFilterBulan(bln); setIsDropdownOpen(false); }} className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase border-b border-gray-50 last:border-b-0 ${filterBulan === bln ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>{bln}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-emerald-50 rounded-[24px] border border-emerald-100 flex items-center gap-4"><TrendingUp className="text-emerald-500"/><h4 className="text-lg font-black text-emerald-700">Rp {totalUangMasuk.toLocaleString('id-ID')}</h4></div>
                  <div className="p-5 bg-blue-50 rounded-[24px] border border-blue-100 flex items-center gap-4"><CheckCircle2 className="text-blue-500"/><h4 className="text-lg font-black text-blue-700">{wargaLunas} Rumah</h4></div>
                  <div className="p-5 bg-red-50 rounded-[24px] border border-red-100 flex items-center gap-4"><UserX className="text-red-500"/><h4 className="text-lg font-black text-red-700">{wargaBelumLunas} Rumah</h4></div>
                </div>
              </div>

              {/* ACTION MENU */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-white p-6 rounded-[32px] border-2 border-blue-50 relative group"><h2 className="font-black text-[10px] uppercase mb-4 text-blue-600 flex gap-2"><PlusCircle size={16}/> Tagihan Masal</h2><input type="text" placeholder="MEI 2026" className="w-full p-4 bg-gray-50 rounded-2xl mb-4 text-sm text-black" value={bulanBaru} onChange={e => setBulanBaru(e.target.value)} /><button onClick={generateTagihanMasal} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-[10px]">Generate</button></div>
                  <div className="bg-emerald-50/50 p-6 rounded-[32px] border-2 border-emerald-50 relative group"><h2 className="font-black text-[10px] uppercase mb-4 text-emerald-600 flex gap-2"><Layers size={16}/> Bayar Rapel</h2><button onClick={() => setRapelModal({ show: true, warga_id: '', bulan_list: '' })} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Input Rapel</button></div>
                  <div className="bg-red-50/50 p-6 rounded-[32px] border-2 border-red-50 relative group"><h2 className="font-black text-[10px] uppercase mb-4 text-red-600 flex gap-2"><AlertTriangle size={16}/> Hapus Data</h2><input type="text" placeholder="MEI 2026" className="w-full p-4 bg-white rounded-2xl mb-4 text-red-600" value={bulanHapus} onChange={e => setBulanHapus(e.target.value)} /><button onClick={handleHapusMasal} className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Hapus Masal</button></div>
              </div>

              {/* HISTORY */}
              <div>
                <div className="relative mb-4"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="Cari warga..." className="w-full bg-white pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 text-xs text-black" onChange={e => setSearchTerm(e.target.value)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataTagihan.filter(t => t.warga?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                    <div key={t.id} className="bg-white p-5 rounded-[28px] border-2 border-gray-50 flex justify-between items-center">
                      <div><h4 className="font-black text-xs uppercase text-black">{t.warga?.nama_lengkap}</h4><p className="text-[10px] font-black text-blue-600">{t.bulan} • Rp {t.nominal.toLocaleString('id-ID')}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStatus(t.id, t.status === 'lunas' ? 'belum lunas' : 'lunas')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${t.status === 'lunas' ? 'bg-green-600 text-white' : 'bg-red-50 text-red-600'}`}>{t.status}</button>
                        <button onClick={() => handleHapusSingle(t.id)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KONTAK */}
          {tabActive === 'kontak' && (
             <div className="space-y-6 animate-in fade-in max-w-2xl mx-auto">
               <button onClick={() => setContactModal({ show: true, nama: '', nomer: '' })} className="w-full bg-blue-600 text-white p-5 rounded-[28px] font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-xl"><Plus size={18}/> Tambah Kontak</button>
               <div className="grid grid-cols-1 gap-4">
                 {dataKontak.map(k => (
                    <div key={k.id} className="bg-white p-5 rounded-[28px] border-2 border-gray-50 flex justify-between items-center">
                      <div className="flex items-center gap-4"><div className="w-12 h-12 bg-red-50 text-red-600 rounded-[20px] flex items-center justify-center"><Phone size={18}/></div><div><h4 className="font-black text-sm uppercase text-black leading-none mb-1">{k.nama}</h4><p className="text-[10px] text-gray-400 font-bold">{k.nomer}</p></div></div>
                      <button onClick={() => handleHapusKontak(k.id)} className="p-3 text-red-400 hover:bg-red-500 hover:text-white rounded-xl border border-red-100 transition-colors"><Trash2 size={16}/></button>
                    </div>
                 ))}
               </div>
             </div>
          )}

          {/* TAB 3: WARGA */}
          {tabActive === 'warga' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in max-w-3xl mx-auto">
               {dataWarga.map(w => (
                 <div key={w.id} className="bg-white p-5 rounded-[28px] border-2 border-gray-50 flex justify-between items-center">
                   <div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-50 rounded-[20px] flex items-center justify-center font-black text-xs text-gray-500">{w.blok_rumah}</div><div><h4 className="font-black text-sm uppercase text-black leading-none mb-1">{w.nama_lengkap}</h4><p className="text-[10px] font-black text-indigo-600">Rp {w.nominal_iuran?.toLocaleString('id-ID')}</p></div></div>
                   <button onClick={() => setNominalModal({ show: true, id: w.id, blok: w.blok_rumah, nama: w.nama_lengkap, nominal: w.nominal_iuran || '' })} className="p-3 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl border border-indigo-100 transition-colors"><Edit3 size={16}/></button>
                 </div>
               ))}
             </div>
          )}

          {/* TAB 4: PENGUMUMAN (INFO ACARA) */}
          {tabActive === 'pengumuman' && (
             <div className="space-y-6 animate-in fade-in max-w-4xl mx-auto">
               <div className="flex flex-col md:flex-row gap-5 items-center justify-between bg-amber-50 p-6 md:p-8 rounded-[32px] border border-amber-200">
                  <div className="flex items-center gap-4"><div className="w-12 h-12 bg-white text-orange-500 rounded-[20px] flex items-center justify-center shadow-sm"><Megaphone size={20}/></div><div><h3 className="font-black text-sm uppercase text-amber-900 mb-1">Siaran Info Warga</h3><p className="text-[10px] font-bold text-amber-700/80 uppercase">Agenda & Pengumuman</p></div></div>
                  <button onClick={() => setPengumumanModal({ show: true, id: null, judul: '', isi: '', tanggal_acara: '' })} className="bg-orange-500 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg">Buat Baru</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 {dataPengumuman.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-[28px] border-2 border-gray-50 hover:border-orange-100 transition-colors group relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 bg-amber-100 text-orange-700 rounded-lg text-[9px] font-black uppercase">{new Date(p.tanggal_acara).toLocaleDateString('id-ID')}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setPengumumanModal({ show: true, id: p.id, judul: p.judul, isi: p.isi, tanggal_acara: p.tanggal_acara })} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 size={14}/></button>
                            <button onClick={() => hapusPengumuman(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <h4 className="font-black text-base uppercase text-black leading-tight mb-2">{p.judul}</h4>
                        <p className="text-[11px] font-bold text-gray-500 line-clamp-3 leading-relaxed">{p.isi}</p>
                    </div>
                 ))}
               </div>
             </div>
          )}

        </div>
      </div>
    </div>
  )
}