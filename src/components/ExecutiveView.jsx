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
    Calendar,
    Download,
    Share2,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { getDynamicWeeksCalendar } from '../data/seedData';

export default function ExecutiveView({
    sales,
    expenses,
    funnel,
    setFunnel,
    paidWeeks,
    onToggleWeekPaid,
    onDeleteSale
}) {
    const [metricMode, setMetricMode] = useState('revenue');
    const [useSheetFormulaMode, setUseSheetFormulaMode] = useState(true);
    const [execSearch, setExecSearch] = useState('');
    const [execWeekFilter, setExecWeekFilter] = useState('ALL');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const filteredSales = sales.filter((s) => {
        const matchesText =
            s.client_name.toLowerCase().includes(execSearch.toLowerCase()) ||
            s.product.toLowerCase().includes(execSearch.toLowerCase()) ||
            s.payment_method.toLowerCase().includes(execSearch.toLowerCase());
        const matchesWeek = execWeekFilter === 'ALL' || Number(s.week_id) === Number(execWeekFilter);
        const matchesStart = !startDateFilter || s.sale_date >= startDateFilter;
        const matchesEnd = !endDateFilter || s.sale_date <= endDateFilter;
        return matchesText && matchesWeek && matchesStart && matchesEnd;
    });

    const grossRevenue = filteredSales.reduce((acc, s) => acc + Number(s.price_usd || 0), 0);
    const totalOrders = filteredSales.length;
    const averageTicket = totalOrders > 0 ? grossRevenue / totalOrders : 0;
    const totalCommissions = filteredSales.reduce((acc, s) => acc + Number(s.commission_usd || 0), 0);
    const fixedExpensesTotal = expenses.reduce((acc, e) => acc + Number(e.amount_usd || 0), 0);

    const effectiveCommissionDeducted = useSheetFormulaMode ? 86.85 : totalCommissions;
    const netProfit = grossRevenue - fixedExpensesTotal - effectiveCommissionDeducted;
    const netMarginPct = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    const novSalesRevenue = sales
        .filter((s) => s.sale_date.startsWith('2026-11'))
        .reduce((a, b) => a + Number(b.price_usd || 0), 0);
    const currentDayNov = 2;
    const projectedMonthRevenue = currentDayNov > 0 ? (novSalesRevenue / currentDayNov) * 30 : novSalesRevenue;

    const weeksList = getDynamicWeeksCalendar(sales);
    const weeklyPayroll = weeksList.map((w) => {
        const wSales = sales.filter((s) => Number(s.week_id) === w.id);
        const orders = wSales.length;
        const revenue = wSales.reduce((a, b) => a + Number(b.price_usd || 0), 0);
        const commission = wSales.reduce((a, b) => a + Number(b.commission_usd || 0), 0);
        const bonus = orders >= 15 ? 10.0 : 0.0;
        const totalPay = commission + bonus;
        const isPaid = Boolean(paidWeeks?.[w.id]);
        return { ...w, orders, revenue, commission, bonus, totalPay, isPaid };
    });

    const pendingPayoutTotal = weeklyPayroll
        .filter((w) => !w.isPaid)
        .reduce((acc, w) => acc + w.totalPay, 0);

    const byChannel = sales.reduce((acc, s) => {
        const ch = s.channel || 'Meta Ads';
        acc[ch] = (acc[ch] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    const byPayment = sales.reduce((acc, s) => {
        acc[s.payment_method] = (acc[s.payment_method] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    const byProduct = sales.reduce((acc, s) => {
        acc[s.product] = (acc[s.product] || 0) + Number(s.price_usd);
        return acc;
    }, {});

    const chartSeries = weeklyPayroll.map((w) => {
        let val = w.revenue;
        if (metricMode === 'orders') val = w.orders;
        if (metricMode === 'commission') val = w.totalPay;
        if (metricMode === 'margin') val = w.revenue > 0 ? ((w.revenue - w.totalPay) / w.revenue) * 100 : 0;
        return {
            label: `Semana ${w.id} (${w.start.slice(5)} al ${w.end.slice(5)})`,
            value: val,
            subText: metricMode === 'margin' ? `${val.toFixed(1)}%` : `$${val.toFixed(2)}`
        };
    });

    const maxBar = Math.max(...chartSeries.map((d) => d.value), 1);

    const exportToCSV = () => {
        const headers = ['ID,Fecha,Semana,Cliente,Producto,Precio USD,Monto Bs,Metodo de Pago,Canal,Comision USD\n'];
        const rows = filteredSales.map(
            (s) =>
                `"${s.id}","${s.sale_date}",${s.week_id},"${s.client_name}","${s.product}",${s.price_usd},${s.amount_bs},"${s.payment_method}","${s.channel}",${s.commission_usd}`
        );
        const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `tiva_design_ventas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const shareWhatsAppPayroll = () => {
        const pendingWeeks = weeklyPayroll.filter((w) => !w.isPaid && w.orders > 0);
        let text = `📊 *NÓMINA PENDIENTE TIVA DESIGN*\n`;
        pendingWeeks.forEach((w) => {
            text += `• Semana ${w.id} (${w.start.slice(5)} al ${w.end.slice(5)}): *${w.orders} ventas* | Total a pagar: *$${w.totalPay.toFixed(2)} USD*\n`;
        });
        text += `\n💰 *Total pendiente por liquidar:* *$${pendingPayoutTotal.toFixed(2)} USD*`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#12141D] px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span>
                        Modo contable:{' '}
                        <strong className="text-violet-300">
                            {useSheetFormulaMode ? 'Fórmula Hoja DASHBOARD ($607.85)' : 'Deducción Real'}
                        </strong>
                    </span>
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-300">
                        Pendiente por pagar: ${pendingPayoutTotal.toFixed(2)} USD
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700"
                    >
                        <Download className="h-3.5 w-3.5 text-cyan-400" />
                        Exportar CSV
                    </button>
                    <button
                        onClick={shareWhatsAppPayroll}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Reporte WhatsApp
                    </button>
                    <button
                        onClick={() => setUseSheetFormulaMode(!useSheetFormulaMode)}
                        className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
                    >
                        Cambiar Fórmula
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Ingresos Totales</span>
                        <DollarSign className="h-4 w-4 text-violet-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${grossRevenue.toFixed(2)} USD</p>
                    <p className="mt-1 text-xs text-emerald-400">Neta: ${netProfit.toFixed(2)} USD</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Pedidos Cerrados</span>
                        <ShoppingBag className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{totalOrders}</p>
                    <p className="mt-1 text-xs text-slate-400">Comisiones: ${totalCommissions.toFixed(2)}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Ticket Promedio</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${averageTicket.toFixed(2)} USD</p>
                    <p className="mt-1 text-xs text-slate-400">Adobe $6 • Office $15</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Rentabilidad Neta</span>
                        <Percent className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{netMarginPct.toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-slate-400">Costos fijos: ${fixedExpensesTotal.toFixed(2)}</p>
                </div>

                <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-600/10 to-cyan-500/10 p-5 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-xs text-violet-300">
                        <span>Proyección Noviembre</span>
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${projectedMonthRevenue.toFixed(0)} USD</p>
                    <p className="mt-1 text-xs text-cyan-300">Estimado al cierre de mes</p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Análisis Dinámico de Rendimiento Semanal</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-[#090A0F] p-1 text-xs">
                        <button
                            onClick={() => setMetricMode('revenue')}
                            className={`rounded-lg px-3 py-1 transition ${metricMode === 'revenue' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Ingresos (USD)
                        </button>
                        <button
                            onClick={() => setMetricMode('orders')}
                            className={`rounded-lg px-3 py-1 transition ${metricMode === 'orders' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Volumen (Pedidos)
                        </button>
                        <button
                            onClick={() => setMetricMode('commission')}
                            className={`rounded-lg px-3 py-1 transition ${metricMode === 'commission' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Nómina Vendedor
                        </button>
                        <button
                            onClick={() => setMetricMode('margin')}
                            className={`rounded-lg px-3 py-1 transition ${metricMode === 'margin' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Margen (%)
                        </button>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    {chartSeries.map((item) => (
                        <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-200">{item.label}</span>
                                <strong className="text-cyan-400">{item.subText}</strong>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/90">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (item.value / maxBar) * 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Calendar className="h-4 w-4 text-violet-400" />
                    Control de Nómina y Liquidación Semanal al Vendedor
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="pb-2.5 font-medium">Semana</th>
                                <th className="pb-2.5 font-medium">Fechas Calendario</th>
                                <th className="pb-2.5 font-medium">Ventas</th>
                                <th className="pb-2.5 font-medium">Facturación</th>
                                <th className="pb-2.5 font-medium">Comisión (15%)</th>
                                <th className="pb-2.5 font-medium">Bono</th>
                                <th className="pb-2.5 font-medium">Total a Pagar</th>
                                <th className="pb-2.5 font-medium">Estado</th>
                                <th className="pb-2.5 text-right font-medium">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {weeklyPayroll.map((w) => (
                                <tr key={w.id} className="hover:bg-slate-800/25">
                                    <td className="py-3 font-semibold text-white">{w.label}</td>
                                    <td className="py-3 text-slate-300">{w.rangeText}</td>
                                    <td className="py-3 text-slate-200">{w.orders} ops</td>
                                    <td className="py-3 font-medium text-emerald-400">${w.revenue.toFixed(2)} USD</td>
                                    <td className="py-3 text-cyan-400">${w.commission.toFixed(2)} USD</td>
                                    <td className="py-3 text-violet-300">${w.bonus.toFixed(2)} USD</td>
                                    <td className="py-3 font-bold text-white">${w.totalPay.toFixed(2)} USD</td>
                                    <td className="py-3">
                                        {w.isPaid ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                                <CheckCircle2 className="h-3 w-3" /> PAGADA
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                                                <Clock className="h-3 w-3" /> POR PAGAR
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
                                            {w.isPaid ? 'Marcar Pendiente' : 'Marcar Pagada'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <h3 className="mb-3 text-sm font-semibold text-white">Rendimiento por Canal de Adquisición</h3>
                    <div className="space-y-2.5">
                        {Object.entries(byChannel).map(([channel, amount]) => {
                            const pct = grossRevenue > 0 ? (amount / grossRevenue) * 100 : 0;
                            return (
                                <div key={channel} className="rounded-xl border border-slate-800/80 bg-[#090A0F] p-3">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-white">{channel}</span>
                                        <span className="text-cyan-400">${amount.toFixed(2)} USD ({pct.toFixed(1)}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <h3 className="mb-3 text-sm font-semibold text-white">Línea de Productos y Medios de Pago</h3>
                    <div className="space-y-2.5">
                        {Object.entries(byProduct).map(([prod, amount]) => {
                            const pct = grossRevenue > 0 ? (amount / grossRevenue) * 100 : 0;
                            return (
                                <div key={prod} className="flex justify-between rounded-xl border border-slate-800/80 bg-[#090A0F] p-3 text-xs">
                                    <span className="font-semibold text-white">{prod}</span>
                                    <span className="text-violet-300">${amount.toFixed(2)} ({pct.toFixed(1)}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">
                        Auditoría General de Ventas ({filteredSales.length} registros filtrados)
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={execSearch}
                                onChange={(e) => setExecSearch(e.target.value)}
                                className="rounded-xl border border-slate-800 bg-[#090A0F] pl-8 pr-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                            />
                        </div>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => setStartDateFilter(e.target.value)}
                            className="rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-1.5 text-xs text-white"
                        />
                        <span className="text-xs text-slate-500">hasta</span>
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => setEndDateFilter(e.target.value)}
                            className="rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-1.5 text-xs text-white"
                        />
                    </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="pb-2 font-medium">Fecha</th>
                                <th className="pb-2 font-medium">Sem</th>
                                <th className="pb-2 font-medium">Cliente</th>
                                <th className="pb-2 font-medium">Producto</th>
                                <th className="pb-2 font-medium">Canal</th>
                                <th className="pb-2 font-medium">Pago</th>
                                <th className="pb-2 font-medium">USD</th>
                                <th className="pb-2 text-right font-medium">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredSales.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-800/25">
                                    <td className="py-2 text-slate-300">{s.sale_date}</td>
                                    <td className="py-2 text-slate-400">S{s.week_id}</td>
                                    <td className="py-2 font-medium text-white">{s.client_name}</td>
                                    <td className="py-2 text-violet-300">{s.product}</td>
                                    <td className="py-2 text-slate-300">{s.channel || 'Meta Ads'}</td>
                                    <td className="py-2 text-cyan-300">{s.payment_method}</td>
                                    <td className="py-2 font-semibold text-emerald-400">${Number(s.price_usd).toFixed(2)}</td>
                                    <td className="py-2 text-right">
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`¿Eliminar venta de "${s.client_name}"?`)) onDeleteSale(s.id);
                                            }}
                                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-500/20"
                                        >
                                            <Trash2 className="h-3 w-3" /> Borrar
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