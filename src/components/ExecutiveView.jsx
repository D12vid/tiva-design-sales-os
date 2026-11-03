import React, { useState } from 'react';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Percent,
    Users,
    Filter,
    Trash2,
    Search,
    CheckCircle2,
    Clock,
    Calendar
} from 'lucide-react';
import { WEEKS_CALENDAR } from '../data/seedData';

export default function ExecutiveView({
    sales,
    expenses,
    funnel,
    setFunnel,
    paidWeeks,
    onToggleWeekPaid,
    onDeleteSale
}) {
    const [periodMode, setPeriodMode] = useState('semanal');
    const [useSheetFormulaMode, setUseSheetFormulaMode] = useState(true);
    const [execSearch, setExecSearch] = useState('');
    const [execWeekFilter, setExecWeekFilter] = useState('ALL');

    const grossRevenue = sales.reduce((acc, s) => acc + Number(s.price_usd || 0), 0);
    const totalOrders = sales.length;
    const averageTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0;
    const totalCommissions = sales.reduce((acc, s) => acc + Number(s.commission_usd || 0), 0);
    const fixedExpensesTotal = expenses.reduce((acc, e) => acc + Number(e.amount_usd || 0), 0);

    const effectiveCommissionDeducted = useSheetFormulaMode ? 86.85 : totalCommissions;
    const netProfit = grossRevenue - fixedExpensesTotal - effectiveCommissionDeducted;
    const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Desglose por Semana Calendario (Semanas 1 a 8)
    const weeklyPayroll = WEEKS_CALENDAR.slice(0, 8).map((w) => {
        const wSales = sales.filter((s) => Number(s.week_id) === w.id);
        const orders = wSales.length;
        const revenue = wSales.reduce((a, b) => a + Number(b.price_usd || 0), 0);
        const commission = wSales.reduce((a, b) => a + Number(b.commission_usd || 0), 0);
        const bonus = orders >= 15 ? 10.0 : 0.0;
        const totalPay = commission + bonus;
        const isPaid = Boolean(paidWeeks?.[w.id]);
        return {
            ...w,
            orders,
            revenue,
            commission,
            bonus,
            totalPay,
            isPaid
        };
    });

    const pendingPayoutTotal = weeklyPayroll
        .filter((w) => !w.isPaid)
        .reduce((acc, w) => acc + w.totalPay, 0);

    const monthlyData = [
        {
            label: 'Septiembre 2026 (14 al 30 Sep)',
            revenue: sales.filter((s) => s.sale_date.startsWith('2026-09')).reduce((a, b) => a + Number(b.price_usd), 0),
            orders: sales.filter((s) => s.sale_date.startsWith('2026-09')).length
        },
        {
            label: 'Octubre 2026 (01 al 31 Oct)',
            revenue: sales.filter((s) => s.sale_date.startsWith('2026-10')).reduce((a, b) => a + Number(b.price_usd), 0),
            orders: sales.filter((s) => s.sale_date.startsWith('2026-10')).length
        },
        {
            label: 'Noviembre 2026 (Desde Lun 02 Nov)',
            revenue: sales.filter((s) => s.sale_date.startsWith('2026-11')).reduce((a, b) => a + Number(b.price_usd), 0),
            orders: sales.filter((s) => s.sale_date.startsWith('2026-11')).length
        }
    ];

    const chartSeries =
        periodMode === 'semanal'
            ? weeklyPayroll.map((w) => ({
                label: `Semana ${w.id} (${w.start.slice(5)} al ${w.end.slice(5)})`,
                revenue: w.revenue,
                orders: w.orders
            }))
            : monthlyData;

    const maxBar = Math.max(...chartSeries.map((d) => d.revenue), 1);

    const byPayment = sales.reduce((acc, s) => {
        acc[s.payment_method] = (acc[s.payment_method] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    const byProduct = sales.reduce((acc, s) => {
        acc[s.product] = (acc[s.product] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    const adsSpend = expenses.find((e) => e.concept.toLowerCase().includes('ads'))?.amount_usd || 42;
    const conversionRate = funnel.visitors > 0 ? (totalOrders / funnel.visitors) * 100 : 0;
    const cac = totalOrders > 0 ? adsSpend / totalOrders : 0;
    const ltv = averageTicket * 1.35;

    const filteredExecSales = sales.filter((s) => {
        const matchesText =
            s.client_name.toLowerCase().includes(execSearch.toLowerCase()) ||
            s.product.toLowerCase().includes(execSearch.toLowerCase());
        const matchesWeek = execWeekFilter === 'ALL' || Number(s.week_id) === Number(execWeekFilter);
        return matchesText && matchesWeek;
    });

    const handleExecDelete = (sale) => {
        if (
            window.confirm(
                `¿Confirmas eliminar permanentemente la venta de "${sale.client_name}" ($${Number(sale.price_usd).toFixed(2)} USD)?`
            )
        ) {
            onDeleteSale(sale.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Barra de Modo de Conciliación y Alerta de Pago Semanal */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#12141D] px-4 py-3">
                <div className="text-xs text-slate-300">
                    Modo contable:{' '}
                    <span className="font-semibold text-violet-300">
                        {useSheetFormulaMode
                            ? 'Fórmula Hoja DASHBOARD ($607.85 Neto / 80.7% Margen)'
                            : 'Deducción Total de Comisiones ($581.75 Neto / 77.3% Margen)'}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                        Pendiente por pagar ( desde Lun 02 Nov ): ${pendingPayoutTotal.toFixed(2)} USD
                    </span>
                    <button
                        onClick={() => setUseSheetFormulaMode(!useSheetFormulaMode)}
                        className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
                    >
                        Cambiar Fórmula
                    </button>
                </div>
            </div>

            {/* KPIs Principales */}
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

            {/* Control de Liquidación y Pagos Semanales al Vendedor */}
            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Calendar className="h-4 w-4 text-violet-400" />
                            Control de Nómina y Liquidación Semanal al Vendedor (Lunes a Domingo)
                        </h3>
                        <p className="text-xs text-slate-400">
                            Semanas 1 a 7 pagadas • Solo falta por pagar desde el Lunes 2 de Noviembre de 2026 (Semana 8)
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="pb-2.5 font-medium">Semana</th>
                                <th className="pb-2.5 font-medium">Fechas Calendario</th>
                                <th className="pb-2.5 font-medium">Ventas Cerradas</th>
                                <th className="pb-2.5 font-medium">Facturación Bruta</th>
                                <th className="pb-2.5 font-medium">Comisión (15%)</th>
                                <th className="pb-2.5 font-medium">Bono (&ge;15 ops)</th>
                                <th className="pb-2.5 font-medium">Total a Pagar</th>
                                <th className="pb-2.5 font-medium">Estado de Pago</th>
                                <th className="pb-2.5 text-right font-medium">Acción Ejecutivo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {weeklyPayroll.map((w) => (
                                <tr key={w.id} className="hover:bg-slate-800/25">
                                    <td className="py-3 font-semibold text-white">{w.label}</td>
                                    <td className="py-3 text-slate-300">{w.rangeText}</td>
                                    <td className="py-3 text-slate-200">{w.orders} ventas</td>
                                    <td className="py-3 font-medium text-emerald-400">${w.revenue.toFixed(2)} USD</td>
                                    <td className="py-3 text-cyan-400">${w.commission.toFixed(2)} USD</td>
                                    <td className="py-3 text-violet-300">${w.bonus.toFixed(2)} USD</td>
                                    <td className="py-3 font-bold text-white">${w.totalPay.toFixed(2)} USD</td>
                                    <td className="py-3">
                                        {w.isPaid ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                                <CheckCircle2 className="h-3 w-3" />
                                                SEMANA PAGADA
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                                                <Clock className="h-3 w-3" />
                                                FALTA POR PAGAR
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 text-right">
                                        <button
                                            onClick={() => onToggleWeekPaid(w.id)}
                                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${w.isPaid
                                                ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-500'
                                                }`}
                                        >
                                            {w.isPaid ? 'Marcar Pendiente' : 'Marcar como Pagada'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gráficos de Evolución y Distribución */}
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

            {/* Funnel & Costos Fijos */}
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

            {/* Auditoría Ejecutiva y Eliminación de Registros */}
            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">
                        Auditoría de Ventas y Eliminación ({filteredExecSales.length} registros)
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar cliente o producto..."
                                value={execSearch}
                                onChange={(e) => setExecSearch(e.target.value)}
                                className="rounded-xl border border-slate-800 bg-[#090A0F] pl-8 pr-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                            />
                        </div>
                        <select
                            value={execWeekFilter}
                            onChange={(e) => setExecWeekFilter(e.target.value)}
                            className="rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-1.5 text-xs text-white"
                        >
                            <option value="ALL">Todas las semanas</option>
                            {WEEKS_CALENDAR.slice(0, 8).map((w) => (
                                <option key={w.id} value={w.id}>
                                    Semana {w.id} ({w.start.slice(5)} al {w.end.slice(5)})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="pb-2 font-medium">Fecha</th>
                                <th className="pb-2 font-medium">Semana</th>
                                <th className="pb-2 font-medium">Cliente</th>
                                <th className="pb-2 font-medium">Producto</th>
                                <th className="pb-2 font-medium">Precio USD</th>
                                <th className="pb-2 font-medium">Comisión</th>
                                <th className="pb-2 text-right font-medium">Eliminar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredExecSales.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/25">
                                    <td className="py-2 text-slate-300">{s.sale_date}</td>
                                    <td className="py-2 text-slate-400">Semana {s.week_id}</td>
                                    <td className="py-2 font-medium text-white">{s.client_name}</td>
                                    <td className="py-2 text-violet-300">{s.product}</td>
                                    <td className="py-2 text-emerald-400">${Number(s.price_usd).toFixed(2)}</td>
                                    <td className="py-2 text-cyan-400">${Number(s.commission_usd).toFixed(2)}</td>
                                    <td className="py-2 text-right">
                                        <button
                                            onClick={() => handleExecDelete(s)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}