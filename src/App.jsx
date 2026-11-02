import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SellerView from './components/SellerView';
import ExecutiveView from './components/ExecutiveView';
import { INITIAL_SALES, INITIAL_EXPENSES } from './data/seedData';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
    const [activeRole, setActiveRole] = useState('ejecutivo');
    const [auditCleanMode, setAuditCleanMode] = useState(false);
    const [sales, setSales] = useState(() => {
        const saved = localStorage.getItem('tiva_sales_v1');
        return saved ? JSON.parse(saved) : INITIAL_SALES;
    });
    const [expenses] = useState(INITIAL_EXPENSES);
    const [funnel, setFunnel] = useState({ visitors: 2450, leads: 480, exchange_rate: 60 });
    const [currentUser, setCurrentUser] = useState({ email: 'admin@tivadesign.com' });

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
                setActiveRole={setActiveRole}
                auditCleanMode={auditCleanMode}
                setAuditCleanMode={setAuditCleanMode}
                isLiveDb={isSupabaseConfigured}
                currentUser={currentUser}
                onOpenAuth={() => {
                    const email = window.prompt('Ingresa tu correo corporativo Tiva Design:', currentUser.email);
                    if (email) setCurrentUser({ email });
                }}
            />
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {activeRole === 'vendedor' ? (
                    <SellerView
                        sales={displayedSales}
                        onAddSale={handleAddSale}
                        onUpdateSale={handleUpdateSale}
                        onDeleteSale={handleDeleteSale}
                    />
                ) : (
                    <ExecutiveView
                        sales={displayedSales}
                        expenses={expenses}
                        funnel={funnel}
                        setFunnel={setFunnel}
                    />
                )}
            </main>
        </div>
    );
}
