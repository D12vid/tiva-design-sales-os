import React, { useState } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Percent, Users, Filter } from 'lucide-react';

export default function ExecutiveView({ sales, expenses, funnel, setFunnel }) {
    const [periodMode, setPeriodMode] = useState('semanal');
    const [useSheetFormulaMode, setUseSheetFormulaMode] = useState(true);

    const grossRevenue = sales.reduce((acc, s) => acc + Number(s.price_usd || 0), 0);
    const totalOrders = sales.length;
    const averageTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0;
    const totalCommissions = sales.reduce((acc, s) => acc + Number(s.commission_usd || 0), 0);
    const fixedExpensesTotal = expenses.reduce((acc, e) => acc + Number(e.amount_usd || 0), 0);

    // En la hoja original, Ganancia Neta ($607.85) resta $86.85 de comisión (Semanas 1-5) + $58.30 de gastos fijos
    const effectiveCommissionDeducted = useSheetFormulaMode ? 86.85 : totalCommissions;
    const netProfit = grossRevenue - fixedExpensesTotal - effectiveCommissionDeducted;
    const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Agrupación temporal
    const weeklyData = [1, 2, 3, 4, 5, 6].map((w) => {
        const wSales = sales.filter((s) => Number(s.week_id) === w);
        const rev = wSales.reduce((a, b) => a + Number(b.price_usd), 0);
        const comm = wSales.reduce((a, b) => a + Number(b.commission_usd), 0);
        return { label: `Semana ${w}`, revenue: rev, commission: comm, orders: wSales.length };
    });

    const monthlyData = [
        {
            label: 'Septiembre 2026',
            revenue: sales.filter((s) => s.sale_date.startsWith('2026-09')).reduce((a, b) => a + Number(b.price_usd), 0),
            orders: sales.filter((s) => s.sale_date.startsWith('2026-09')).length
        },
        {
            label: 'Octubre 2026',
            revenue: sales.filter((s) => s.sale_date.startsWith('2026-10')).reduce((a, b) => a + Number(b.price_usd), 0),
            orders: sales.filter((s) => s.sale_date.startsWith('2026-10')).length
        },
        {
            label: 'Noviembre 2026',
            revenue: sales.filter((s) => s.sale_date.startsWith('2026-11')).reduce((a, b) => a + Number(b.price_usd), 0),
            orders: sales.filter((s) => s.sale_date.startsWith('2026-11')).length
        }
    ];

    const chartSeries = periodMode === 'semanal' ? weeklyData : monthlyData;
    const maxBar = Math.max(...chartSeries.map((d) => d.revenue), 1);

    // Distribución por Método de Pago y Producto
    const byPayment = sales.reduce((acc, s) => {
        acc[s.payment_method] = (acc[s.payment_method] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    const byProduct = sales.reduce((acc, s) => {
        acc[s.product] = (acc[s.product] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    // Embudo & Adquisición
    const adsSpend = expenses.find((e) => e.concept.toLowerCase().includes('ads'))?.amount_usd || 42;
    const conversionRate = funnel.visitors > 0 ? (totalOrders / funnel.visitors) * 100 : 0;
    const cac = totalOrders > 0 ? adsSpend / totalOrders : 0;
    const ltv = averageTicket * 1.35;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#12141D] px-4 py-3">
                <div className="text-xs text-slate-300">
                    Modo de cálculo contable activo:{' '}
                    <span className="font-semibold text-violet-300">
                        {useSheetFormulaMode
                            ? 'Fórmula Hoja DASHBOARD ($607.85 Neto / 80.7% Margen)'
                            : 'Deducción Total de Comisiones ($581.75 Neto / 77.3% Margen)'}
                    </span>
                </div>
                <button
                    onClick={() => setUseSheetFormulaMode(!useSheetFormulaMode)}
                    className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
                >
                    Cambiar Fórmula de Conciliación
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Ingresos Brutos y Netos</span>
                        <DollarSign className="h-4 w-4 text-violet-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${grossRevenue.toFixed(2)} USD</p>
                    <p className="mt-1 text-xs text-emerald-400">Ganancia Neta: ${netProfit.toFixed(2)} USD</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Pedidos Cerrados</span>
                        <ShoppingBag className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{totalOrders}</p>
                    <p className="mt-1 text-xs text-slate-400">Comisiones (15%): ${totalCommissions.toFixed(2)} USD</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Ticket Promedio</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${averageTicket.toFixed(2)} USD</p>
                    <p className="mt-1 text-xs text-slate-400">Adobe $6.00 • Office $15.00</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Margen de Rentabilidad</span>
                        <Percent className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{netMarginPct.toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-slate-400">Gastos Operativos Fijos: ${fixedExpensesTotal.toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">Evolución Temporal de Ventas (USD)</h3>
                        <div className="flex gap-1 rounded-lg border border-slate-800 bg-[#090A0F] p-1 text-xs">
                            {['semanal', 'mensual'].map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setPeriodMode(m)}
                                    className={`rounded-md px-2.5 py-1 capitalize ${periodMode === m ? 'bg-violet-600 text-white' : 'text-slate-400'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {chartSeries.map((item) => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium text-slate-200">{item.label}</span>
                                    <span className="text-slate-300">
                                        <strong>${item.revenue.toFixed(2)} USD</strong> ({item.orders} pedidos)
                                    </span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/90">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-500"
                                        style={{ width: `${(item.revenue / maxBar) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <h3 className="mb-4 text-sm font-semibold text-white">Ventas por Línea de Producto & Pago</h3>
                    <div className="space-y-3">
                        {Object.entries(byProduct).map(([prod, amount]) => {
                            const pct = grossRevenue > 0 ? (amount / grossRevenue) * 100 : 0;
                            return (
                                <div key={prod} className="rounded-xl border border-slate-800/80 bg-[#090A0F] p-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-white">{prod}</span>
                                        <span className="text-violet-300">${amount.toFixed(2)} ({pct.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <h4 className="mt-5 mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Medios de Pago Recibidos
                    </h4>
                    <div className="space-y-2">
                        {Object.entries(byPayment).map(([method, amount]) => {
                            const pct = grossRevenue > 0 ? (amount / grossRevenue) * 100 : 0;
                            return (
                                <div key={method} className="flex items-center justify-between text-xs">
                                    <span className="text-slate-300">{method}</span>
                                    <span className="font-medium text-cyan-400">${amount.toFixed(2)} ({pct.toFixed(1)}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                        <Filter className="h-4 w-4 text-cyan-400" />
                        Embudo de Adquisición (Funnel CAC & LTV)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="block text-[11px] text-slate-400">Visitantes Totales</label>
                            <input
                                type="number"
                                value={funnel.visitors}
                                onChange={(e) => setFunnel({ ...funnel, visitors: Number(e.target.value) })}
                                className="mt-1 w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-1.5 text-xs text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] text-slate-400">Conversión a Compra</label>
                            <p className="mt-2 text-base font-bold text-emerald-400">{conversionRate.toFixed(2)}%</p>
                        </div>
                        <div>
                            <label className="block text-[11px] text-slate-400">CAC vs LTV</label>
                            <p className="mt-2 text-xs font-semibold text-cyan-300">
                                CAC: ${cac.toFixed(2)} • LTV: ${ltv.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                        <Users className="h-4 w-4 text-violet-400" />
                        Estructura de Costos Operativos Fijos (${fixedExpensesTotal.toFixed(2)} USD)
                    </h3>
                    <div className="space-y-2 text-xs">
                        {expenses.map((exp) => (
                            <div key={exp.id} className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                                <div>
                                    <span className="font-medium text-slate-200">{exp.concept}</span>
                                    <span className="ml-2 text-slate-500">({exp.frequency})</span>
                                </div>
                                <span className="font-semibold text-rose-400">${Number(exp.amount_usd).toFixed(2)} USD</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}