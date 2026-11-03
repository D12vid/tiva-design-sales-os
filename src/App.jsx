import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldAlert } from 'lucide-react';
import Navbar from './components/Navbar';
import SellerView from './components/SellerView';
import ExecutiveView from './components/ExecutiveView';
import { INITIAL_SALES, INITIAL_EXPENSES } from './data/seedData';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026';

export default function App() {
    // Inicia por defecto en 'vendedor' para que el trabajador solo vea su panel al entrar
    const [activeRole, setActiveRole] = useState('vendedor');
    const [isExecutiveUnlocked, setIsExecutiveUnlocked] = useState(() => {
        return sessionStorage.getItem('tiva_exec_unlocked') === 'true';
    });
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');

    const [auditCleanMode, setAuditCleanMode] = useState(false);
    const [sales, setSales] = useState(() => {
        const saved = localStorage.getItem('tiva_sales_v1');
        return saved ? JSON.parse(saved) : INITIAL_SALES;
    });
    const [expenses] = useState(INITIAL_EXPENSES);
    const [funnel, setFunnel] = useState({ visitors: 2450, leads: 480, exchange_rate: 60 });

    useEffect(() => {
        localStorage.setItem('tiva_sales_v1', JSON.stringify(sales));
    }, [sales]);

    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const fetchInitial = async () => {
            const { data } = await supabase.from('sales').select('*').order('sale_date', { ascending: false });
            if (data && data.length > 0) setSales(data);
        };
        fetchInitial();

        const channel = supabase
            .channel('realtime:sales')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
                fetchInitial();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleSelectRole = (role) => {
        if (role === 'vendedor') {
            setActiveRole('vendedor');
            return;
        }
        if (isExecutiveUnlocked) {
            setActiveRole('ejecutivo');
        } else {
            setPinInput('');
            setPinError('');
            setShowPinModal(true);
        }
    };

    const handleVerifyPin = (e) => {
        e.preventDefault();
        if (pinInput.trim() === ADMIN_PIN) {
            setIsExecutiveUnlocked(true);
            sessionStorage.setItem('tiva_exec_unlocked', 'true');
            setActiveRole('ejecutivo');
            setShowPinModal(false);
            setPinInput('');
            setPinError('');
        } else {
            setPinError('PIN incorrecto. Acceso exclusivo para dirección de Tiva Design.');
        }
    };

    const handleLockExecutive = () => {
        setIsExecutiveUnlocked(false);
        sessionStorage.removeItem('tiva_exec_unlocked');
        setActiveRole('vendedor');
    };

    const handleAddSale = async (newSale) => {
        const created = { ...newSale, id: `sale-${Date.now()}` };
        setSales((prev) => [created, ...prev]);
        if (isSupabaseConfigured && supabase) {
            await supabase.from('sales').insert([newSale]);
        }
    };

    const handleUpdateSale = async (updated) => {
        setSales((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        if (isSupabaseConfigured && supabase) {
            await supabase.from('sales').update(updated).eq('id', updated.id);
        }
    };

    const handleDeleteSale = async (id) => {
        setSales((prev) => prev.filter((item) => item.id !== id));
        if (isSupabaseConfigured && supabase) {
            await supabase.from('sales').delete().eq('id', id);
        }
    };

    const displayedSales = auditCleanMode ? sales.filter((s) => !s.is_template_row) : sales;

    return (
        <div className="min-h-screen bg-[#090A0F] text-slate-100">
            <Navbar
                activeRole={activeRole}
                onSelectRole={handleSelectRole}
                isExecutiveUnlocked={isExecutiveUnlocked}
                onLockExecutive={handleLockExecutive}
                auditCleanMode={auditCleanMode}
                setAuditCleanMode={setAuditCleanMode}
                isLiveDb={isSupabaseConfigured}
            />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {activeRole === 'ejecutivo' && isExecutiveUnlocked ? (
                    <ExecutiveView
                        sales={displayedSales}
                        expenses={expenses}
                        funnel={funnel}
                        setFunnel={setFunnel}
                    />
                ) : (
                    <SellerView
                        sales={displayedSales}
                        onAddSale={handleAddSale}
                        onUpdateSale={handleUpdateSale}
                        onDeleteSale={handleDeleteSale}
                    />
                )}
            </main>

            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#12141D] p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Acceso Ejecutivo</h3>
                                    <p className="text-[11px] text-slate-400">Ingresa el PIN de administrador</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPinModal(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleVerifyPin} className="mt-5 space-y-4">
                            <div>
                                <input
                                    type="password"
                                    autoFocus
                                    placeholder="••••"
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value)}
                                    className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-4 py-2.5 text-center text-lg tracking-[0.4em] text-white focus:border-violet-500 focus:outline-none"
                                    required
                                />
                            </div>

                            {pinError && (
                                <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                                    <ShieldAlert className="h-4 w-4 shrink-0" />
                                    <span>{pinError}</span>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPinModal(false)}
                                    className="w-1/2 rounded-xl border border-slate-800 bg-[#090A0F] py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 hover:opacity-95"
                                >
                                    Desbloquear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
