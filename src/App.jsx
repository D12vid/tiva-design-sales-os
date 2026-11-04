import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldAlert } from 'lucide-react';
import Navbar from './components/Navbar';
import SellerView from './components/SellerView';
import ExecutiveView from './components/ExecutiveView';
import { INITIAL_SALES, INITIAL_EXPENSES, INITIAL_PAID_WEEKS } from './data/seedData';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || '2026';

export default function App() {
    const [activeRole, setActiveRole] = useState('vendedor');
    const [isExecutiveUnlocked, setIsExecutiveUnlocked] = useState(() => {
        return sessionStorage.getItem('tiva_exec_unlocked') === 'true';
    });
    const [showPinModal, setShowPinModal] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');

    const [auditCleanMode, setAuditCleanMode] = useState(false);
    const [sales, setSales] = useState(() => {
        const saved = localStorage.getItem('tiva_sales_v2');
        return saved ? JSON.parse(saved) : INITIAL_SALES;
    });
    const [expenses, setExpenses] = useState(() => {
        const saved = localStorage.getItem('tiva_expenses_v2');
        return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    });
    const [paidWeeks, setPaidWeeks] = useState(() => {
        const saved = localStorage.getItem('tiva_paid_weeks_v2');
        return saved ? JSON.parse(saved) : INITIAL_PAID_WEEKS;
    });
    const [funnel, setFunnel] = useState(() => {
        const saved = localStorage.getItem('tiva_funnel_v2');
        return saved ? JSON.parse(saved) : { visitors: 2450, leads: 480, exchange_rate: 1000 };
    });

    useEffect(() => {
        localStorage.setItem('tiva_sales_v2', JSON.stringify(sales));
    }, [sales]);

    useEffect(() => {
        localStorage.setItem('tiva_expenses_v2', JSON.stringify(expenses));
    }, [expenses]);

    useEffect(() => {
        localStorage.setItem('tiva_paid_weeks_v2', JSON.stringify(paidWeeks));
    }, [paidWeeks]);

    useEffect(() => {
        localStorage.setItem('tiva_funnel_v2', JSON.stringify(funnel));
    }, [funnel]);

    useEffect(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const fetchAllData = async () => {
            const { data: salesData } = await supabase
                .from('sales')
                .select('*')
                .order('sale_date', { ascending: false });
            if (salesData && salesData.length > 0) setSales(salesData);

            const { data: expensesData } = await supabase
                .from('expenses')
                .select('*')
                .order('created_at', { ascending: true });
            if (expensesData && expensesData.length > 0) setExpenses(expensesData);

            const { data: payoutsData } = await supabase.from('weekly_payouts').select('*');
            if (payoutsData && payoutsData.length > 0) {
                const mapped = { ...INITIAL_PAID_WEEKS };
                payoutsData.forEach((row) => {
                    mapped[row.week_id] = row.is_paid;
                });
                setPaidWeeks(mapped);
            }

            const { data: funnelData } = await supabase
                .from('funnel_settings')
                .select('*')
                .eq('id', 1)
                .maybeSingle();
            if (funnelData && funnelData.exchange_rate) {
                setFunnel((prev) => ({
                    ...prev,
                    visitors: Number(funnelData.visitors || prev.visitors),
                    leads: Number(funnelData.leads || prev.leads),
                    exchange_rate: Number(funnelData.exchange_rate)
                }));
            }
        };
        fetchAllData();

        const channel = supabase
            .channel('realtime:tiva_os')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, fetchAllData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, fetchAllData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_payouts' }, fetchAllData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'funnel_settings' }, fetchAllData)
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

    const handleUpdateExchangeRate = async (newRate) => {
        const numericRate = Number(newRate);
        if (!numericRate || numericRate <= 0) return;

        setFunnel((prev) => ({ ...prev, exchange_rate: numericRate }));

        if (isSupabaseConfigured && supabase) {
            await supabase.from('funnel_settings').upsert({
                id: 1,
                visitors: funnel.visitors,
                leads: funnel.leads,
                exchange_rate: numericRate,
                updated_at: new Date().toISOString()
            });
        }
    };

    const handleToggleWeekPaid = async (weekId) => {
        const nextState = !paidWeeks[weekId];
        setPaidWeeks((prev) => ({ ...prev, [weekId]: nextState }));
        if (isSupabaseConfigured && supabase) {
            await supabase.from('weekly_payouts').upsert({
                week_id: weekId,
                is_paid: nextState,
                paid_at: nextState ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            });
        }
    };

    // CRUD Ventas
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
            const { id, created_at, ...payload } = updated;
            await supabase.from('sales').update(payload).eq('id', id);
        }
    };

    const handleDeleteSale = async (id) => {
        setSales((prev) => prev.filter((item) => item.id !== id));
        if (isSupabaseConfigured && supabase) {
            await supabase.from('sales').delete().eq('id', id);
        }
    };

    // CRUD Gastos Operativos Fijos
    const handleAddExpense = async (newExpense) => {
        const tempId = `exp-${Date.now()}`;
        const optimistic = { ...newExpense, id: tempId };
        setExpenses((prev) => [...prev, optimistic]);

        if (isSupabaseConfigured && supabase) {
            const { data } = await supabase
                .from('expenses')
                .insert([
                    {
                        concept: newExpense.concept,
                        frequency: newExpense.frequency,
                        amount_usd: Number(newExpense.amount_usd),
                        notes: newExpense.notes || ''
                    }
                ])
                .select();
            if (data && data[0]) {
                setExpenses((prev) => prev.map((e) => (e.id === tempId ? data[0] : e)));
            }
        }
    };

    const handleUpdateExpense = async (updatedExp) => {
        setExpenses((prev) => prev.map((e) => (e.id === updatedExp.id ? updatedExp : e)));
        if (isSupabaseConfigured && supabase) {
            await supabase
                .from('expenses')
                .update({
                    concept: updatedExp.concept,
                    frequency: updatedExp.frequency,
                    amount_usd: Number(updatedExp.amount_usd),
                    notes: updatedExp.notes || ''
                })
                .eq('id', updatedExp.id);
        }
    };

    const handleDeleteExpense = async (id) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        if (isSupabaseConfigured && supabase) {
            await supabase.from('expenses').delete().eq('id', id);
        }
    };

    const displayedSales = auditCleanMode ? sales.filter((s) => !s.is_template_row) : sales;

    return (
        <div className="tiva-grain min-h-screen text-slate-100">
            <Navbar
                activeRole={activeRole}
                onSelectRole={handleSelectRole}
                isExecutiveUnlocked={isExecutiveUnlocked}
                onLockExecutive={handleLockExecutive}
                auditCleanMode={auditCleanMode}
                setAuditCleanMode={setAuditCleanMode}
                isLiveDb={isSupabaseConfigured}
                exchangeRate={funnel.exchange_rate}
                onUpdateExchangeRate={handleUpdateExchangeRate}
            />

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {activeRole === 'ejecutivo' && isExecutiveUnlocked ? (
                    <ExecutiveView
                        sales={displayedSales}
                        expenses={expenses}
                        funnel={funnel}
                        setFunnel={setFunnel}
                        paidWeeks={paidWeeks}
                        onToggleWeekPaid={handleToggleWeekPaid}
                        onDeleteSale={handleDeleteSale}
                        onAddExpense={handleAddExpense}
                        onUpdateExpense={handleUpdateExpense}
                        onDeleteExpense={handleDeleteExpense}
                    />
                ) : (
                    <SellerView
                        sales={displayedSales}
                        paidWeeks={paidWeeks}
                        exchangeRate={funnel.exchange_rate}
                        onAddSale={handleAddSale}
                        onUpdateSale={handleUpdateSale}
                        onDeleteSale={handleDeleteSale}
                        canDelete={isExecutiveUnlocked}
                    />
                )}
            </main>

            {showPinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl border border-emerald-900/80 bg-[#071917] p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Acceso Ejecutivo</h3>
                                    <p className="text-[11px] text-emerald-200/70">Ingresa el PIN de administrador</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPinModal(false)}
                                className="rounded-lg p-1 text-emerald-200/60 hover:bg-emerald-900/40 hover:text-white"
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
                                    className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-4 py-2.5 text-center text-lg tracking-[0.4em] text-lime-400 focus:border-lime-400 focus:outline-none"
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
                                    className="w-1/2 rounded-xl border border-emerald-900 bg-[#030C0A] py-2 text-xs font-medium text-emerald-100 hover:bg-emerald-950"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-1/2 rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 py-2 text-xs font-extrabold text-[#030C0A] shadow-lg shadow-lime-400/20 hover:brightness-105"
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
