import React, { useState } from 'react';
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    Percent,
    Trash2,
    Search,
    CheckCircle2,
    Clock,
    Calendar,
    Download,
    Share2,
    BarChart3,
    Sparkles,
    Sliders,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    PlusCircle,
    Edit3,
    Save,
    X,
    Receipt
} from 'lucide-react';
import { getDynamicWeeksCalendar } from '../data/seedData';

export default function ExecutiveView({
    sales = [],
    expenses = [],
    funnel = { visitors: 2450, leads: 480 },
    setFunnel = () => { },
    paidWeeks = {},
    onToggleWeekPaid = () => { },
    onDeleteSale = () => { },
    onAddExpense = () => { },
    onUpdateExpense = () => { },
    onDeleteExpense = () => { }
}) {
    const [metricMode, setMetricMode] = useState('revenue');
    const [chartStyle, setChartStyle] = useState('area');
    const [useSheetFormulaMode, setUseSheetFormulaMode] = useState(true);
    const [execSearch, setExecSearch] = useState('');
    const [execWeekFilter, setExecWeekFilter] = useState('ALL');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    // Estado del Formulario de Nuevo Gasto Fijo
    const [expForm, setExpForm] = useState({
        concept: '',
        frequency: 'Semanal',
        amount_usd: '',
        notes: ''
    });
    const [expError, setExpError] = useState('');
    const [editingExpId, setEditingExpId] = useState(null);
    const [editingExpDraft, setEditingExpDraft] = useState({});

    // Controles del Simulador Dinámico de Proyecciones (What-If)
    const [simVolumePct, setSimVolumePct] = useState(0);
    const [simTicketPct, setSimTicketPct] = useState(0);
    const [simWeeklyAds, setSimWeeklyAds] = useState(42);

    const filteredSales = sales.filter((s) => {
        const matchesText =
            (s.client_name || '').toLowerCase().includes(execSearch.toLowerCase()) ||
            (s.product || '').toLowerCase().includes(execSearch.toLowerCase()) ||
            (s.payment_method || '').toLowerCase().includes(execSearch.toLowerCase());
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

    const weeksList = getDynamicWeeksCalendar(sales);
    const weeklyPayroll = weeksList.map((w, idx) => {
        const wSales = sales.filter((s) => Number(s.week_id) === w.id);
        const orders = wSales.length;
        const revenue = wSales.reduce((a, b) => a + Number(b.price_usd || 0), 0);
        const commission = wSales.reduce((a, b) => a + Number(b.commission_usd || 0), 0);
        const bonus = orders >= 15 ? 10.0 : 0.0;
        const totalPay = commission + bonus;
        const isPaid = Boolean(paidWeeks?.[w.id]);
        return { ...w, orders, revenue, commission, bonus, totalPay, isPaid, index: idx };
    });

    const activeHistoricalWeeks = weeklyPayroll.filter((w) => w.orders > 0);
    const avgWeeklyRev =
        activeHistoricalWeeks.length > 0
            ? activeHistoricalWeeks.reduce((a, b) => a + b.revenue, 0) / activeHistoricalWeeks.length
            : 125.5;
    const avgWeeklyOrders =
        activeHistoricalWeeks.length > 0
            ? activeHistoricalWeeks.reduce((a, b) => a + b.orders, 0) / activeHistoricalWeeks.length
            : 20.17;

    const simWeeklyOrders = Math.max(1, Math.round(avgWeeklyOrders * (1 + simVolumePct / 100)));
    const simWeeklyRevenue = avgWeeklyRev * (1 + simVolumePct / 100) * (1 + simTicketPct / 100);
    const simWeeklyCommission = simWeeklyRevenue * 0.15;
    const simWeeklyBonus = simWeeklyOrders >= 15 ? 10.0 : 0.0;
    const simWeeklyPayroll = simWeeklyCommission + simWeeklyBonus;
    const simWeeklyNet = simWeeklyRevenue - simWeeklyPayroll - simWeeklyAds;

    const projected4WeeksRevenue = simWeeklyRevenue * 4;
    const projected4WeeksNet = simWeeklyNet * 4;
    const projectedRoas = simWeeklyAds > 0 ? simWeeklyRevenue / simWeeklyAds : 0;

    const pendingPayoutTotal = weeklyPayroll
        .filter((w) => !w.isPaid)
        .reduce((acc, w) => acc + w.totalPay, 0);

    // Handlers de Gastos Operativos Fijos
    const handleCreateExpense = (e) => {
        e.preventDefault();
        if (!expForm.concept.trim()) {
            setExpError('Ingresa el nombre o concepto del gasto.');
            return;
        }
        if (expForm.amount_usd === '' || Number(expForm.amount_usd) < 0) {
            setExpError('Ingresa un monto en USD válido.');
            return;
        }
        setExpError('');
        onAddExpense({
            concept: expForm.concept.trim(),
            frequency: expForm.frequency,
            amount_usd: Number(expForm.amount_usd),
            notes: expForm.notes.trim()
        });
        setExpForm({ concept: '', frequency: 'Semanal', amount_usd: '', notes: '' });
    };

    const startEditExpense = (exp) => {
        setEditingExpId(exp.id);
        setEditingExpDraft({ ...exp });
    };

    const saveEditExpense = () => {
        if (!editingExpDraft.concept?.trim() || Number(editingExpDraft.amount_usd) < 0) return;
        onUpdateExpense({
            ...editingExpDraft,
            concept: editingExpDraft.concept.trim(),
            amount_usd: Number(editingExpDraft.amount_usd)
        });
        setEditingExpId(null);
    };

    const confirmDeleteExpense = (exp) => {
        if (window.confirm(`¿Eliminar el gasto fijo "${exp.concept}" ($${Number(exp.amount_usd).toFixed(2)} USD)?`)) {
            onDeleteExpense(exp.id);
        }
    };

    // Nodos del gráfico combinado
    const historicalChartNodes = weeklyPayroll.slice(0, 6).map((w, i, arr) => {
        const prevRev = i > 0 ? arr[i - 1].revenue : w.revenue;
        const wowPct = i > 0 && prevRev > 0 ? ((w.revenue - prevRev) / prevRev) * 100 : 0;
        let val = w.revenue;
        if (metricMode === 'orders') val = w.orders;
        if (metricMode === 'commission') val = w.totalPay;
        if (metricMode === 'margin') val = w.revenue > 0 ? ((w.revenue - w.totalPay) / w.revenue) * 100 : 0;
        return {
            id: `H-${w.id}`,
            shortLabel: `S${w.id}`,
            fullLabel: `Semana ${w.id} (${w.start.slice(5)} al ${w.end.slice(5)})`,
            value: val,
            wowPct,
            isProjected: false,
            displayValue:
                metricMode === 'orders'
                    ? `${val} ops`
                    : metricMode === 'margin'
                        ? `${val.toFixed(1)}%`
                        : `$${val.toFixed(2)}`
        };
    });

    const projectedChartNodes = [8, 9, 10, 11].map((wNum, idx) => {
        const factor = 1 + idx * 0.03;
        let val = simWeeklyRevenue * factor;
        if (metricMode === 'orders') val = Math.round(simWeeklyOrders * factor);
        if (metricMode === 'commission') val = simWeeklyPayroll * factor;
        if (metricMode === 'margin')
            val = simWeeklyRevenue > 0 ? ((simWeeklyRevenue - simWeeklyPayroll) / simWeeklyRevenue) * 100 : 0;
        return {
            id: `P-${wNum}`,
            shortLabel: `S${wNum} (Proy)`,
            fullLabel: `Semana ${wNum} Proyectada`,
            value: val,
            wowPct: simVolumePct,
            isProjected: true,
            displayValue:
                metricMode === 'orders'
                    ? `${val} ops`
                    : metricMode === 'margin'
                        ? `${val.toFixed(1)}%`
                        : `$${val.toFixed(2)}`
        };
    });

    const combinedChartData = [...historicalChartNodes, ...projectedChartNodes];
    const maxChartVal = Math.max(...combinedChartData.map((d) => d.value), 1);

    const svgWidth = 800;
    const svgHeight = 210;
    const padX = 42;
    const padY = 26;
    const plotW = svgWidth - padX * 2;
    const plotH = svgHeight - padY * 2;

    const svgPoints = combinedChartData.map((d, i) => {
        const x = padX + (i / Math.max(1, combinedChartData.length - 1)) * plotW;
        const y = padY + plotH - (d.value / maxChartVal) * plotH;
        return { x, y, ...d };
    });

    const polylinePoints = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const areaPoints = `${svgPoints[0]?.x || padX},${padY + plotH} ${polylinePoints} ${svgPoints[svgPoints.length - 1]?.x || svgWidth - padX
        },${padY + plotH}`;

    const byProduct = filteredSales.reduce((acc, s) => {
        const pr = s.product || 'Adobe';
        acc[pr] = (acc[pr] || 0) + Number(s.price_usd || 0);
        return acc;
    }, {});

    const byPayment = filteredSales.reduce((acc, s) => {
        const pm = s.payment_method || 'Pago Móvil';
        acc[pm] = (acc[pm] || 0) + Number(s.price_usd || 0);
        return acc;
    }, {});

    const palette = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

    const buildDonutSegments = (dataObj) => {
        const entries = Object.entries(dataObj).sort((a, b) => b[1] - a[1]);
        const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;
        let cumulativePct = 0;
        return entries.map(([name, amount], idx) => {
            const pct = (amount / total) * 100;
            const strokeDasharray = `${pct} ${100 - pct}`;
            const strokeDashoffset = 25 - cumulativePct;
            cumulativePct += pct;
            return {
                name,
                amount,
                pct,
                color: palette[idx % palette.length],
                strokeDasharray,
                strokeDashoffset
            };
        });
    };

    const productSegments = buildDonutSegments(byProduct);
    const paymentSegments = buildDonutSegments(byPayment);

    const exportToCSV = () => {
        const headers = ['ID,Fecha,Semana,Cliente,Producto,Precio USD,Monto Bs,Metodo de Pago,Canal,Comision USD\n'];
        const rows = filteredSales.map(
            (s) =>
                `"${s.id}","${s.sale_date}",${s.week_id},"${s.client_name}","${s.product}",${s.price_usd},${s.amount_bs},"${s.payment_method}","${s.channel || 'Meta Ads'}",${s.commission_usd}`
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
        let text = `📊 *REPORTE EJECUTIVO & NÓMINA — TIVA DESIGN*\n`;
        text += `• Facturación Acumulada: *$${grossRevenue.toFixed(2)} USD* (${totalOrders} ventas)\n`;
        text += `• Gastos Operativos Fijos: *$${fixedExpensesTotal.toFixed(2)} USD*\n`;
        text += `• Ganancia Neta: *$${netProfit.toFixed(2)} USD* (${netMarginPct.toFixed(1)}%)\n\n`;
        if (pendingWeeks.length > 0) {
            pendingWeeks.forEach((w) => {
                text += `• Semana ${w.id} (${w.start.slice(5)} al ${w.end.slice(5)}): *${w.orders} ventas* → Pagar: *$${w.totalPay.toFixed(2)} USD*\n`;
            });
        } else {
            text += `• Semana 8 en curso (desde Lun 02 Nov): *$${pendingPayoutTotal.toFixed(2)} USD acumulados*\n`;
        }
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Barra Superior de Acciones Ejecutivas */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#12141D] px-4 py-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                    <span>
                        Conciliación:{' '}
                        <strong className="text-violet-300">
                            {useSheetFormulaMode ? 'Fórmula Hoja DASHBOARD' : 'Deducción Total de Comisiones'}
                        </strong>
                    </span>
                    <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-medium text-amber-300">
                        Por liquidar desde Lun 02 Nov: ${pendingPayoutTotal.toFixed(2)} USD
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
                        Enviar Resumen WhatsApp
                    </button>
                    <button
                        onClick={() => setUseSheetFormulaMode(!useSheetFormulaMode)}
                        className="rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
                    >
                        Alternar Fórmula
                    </button>
                </div>
            </div>

            {/* 5 Tarjetas KPI */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Ingresos Brutos</span>
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
                    <p className="mt-2 text-2xl font-bold text-white">{totalOrders} ventas</p>
                    <p className="mt-1 text-xs text-slate-400">Media: {avgWeeklyOrders.toFixed(1)} pedidos/sem</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Promedio Semanal</span>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${avgWeeklyRev.toFixed(2)} USD</p>
                    <p className="mt-1 text-xs text-slate-400">Ticket medio: ${averageTicket.toFixed(2)} USD</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Margen Neto</span>
                        <Percent className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">{netMarginPct.toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-rose-400">Gastos fijos: ${fixedExpensesTotal.toFixed(2)} USD</p>
                </div>

                <div className="rounded-2xl border border-violet-500/40 bg-gradient-to-br from-violet-600/15 to-cyan-500/10 p-5 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-xs text-violet-300">
                        <span>Proyección Mensual (4 Sem)</span>
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-white">${projected4WeeksRevenue.toFixed(2)} USD</p>
                    <p className="mt-1 text-xs text-cyan-300">
                        Neto estimado: ${projected4WeeksNet.toFixed(2)} USD
                    </p>
                </div>
            </div>

            {/* Gráfico Combinado SVG: Histórico S1-S6 + Proyección Dinámica S8-S11 */}
            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                            <BarChart3 className="h-5 w-5 text-violet-400" />
                            Curva de Evolución Histórica (S1–S6) + Proyección Dinámica (S8–S11)
                        </h3>
                        <p className="text-xs text-slate-400">
                            Cierres reales en violeta y proyección interactiva de noviembre en cian
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex rounded-xl border border-slate-800 bg-[#090A0F] p-1 text-xs">
                            <button
                                onClick={() => setChartStyle('area')}
                                className={`rounded-lg px-2.5 py-1 ${chartStyle === 'area' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Curva SVG
                            </button>
                            <button
                                onClick={() => setChartStyle('bars')}
                                className={`rounded-lg px-2.5 py-1 ${chartStyle === 'bars' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Barras Comparativas
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-[#090A0F] p-1 text-xs">
                            {[
                                { id: 'revenue', label: 'Ingresos ($)' },
                                { id: 'orders', label: 'Pedidos (#)' },
                                { id: 'commission', label: 'Nómina ($)' },
                                { id: 'margin', label: 'Margen (%)' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => setMetricMode(m.id)}
                                    className={`rounded-lg px-2.5 py-1 transition ${metricMode === m.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {chartStyle === 'area' ? (
                    <div className="overflow-x-auto">
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-56 w-full min-w-[640px]">
                            <defs>
                                <linearGradient id="tivaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.45" />
                                    <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>

                            {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                                const y = padY + plotH * (1 - ratio);
                                return (
                                    <g key={idx}>
                                        <line
                                            x1={padX}
                                            y1={y}
                                            x2={svgWidth - padX}
                                            y2={y}
                                            stroke="#1F2433"
                                            strokeDasharray="4 4"
                                        />
                                        <text x={6} y={y + 4} fill="#64748B" fontSize="10">
                                            {(maxChartVal * ratio).toFixed(0)}
                                        </text>
                                    </g>
                                );
                            })}

                            <polygon points={areaPoints} fill="url(#tivaAreaGrad)" />
                            <polyline
                                fill="none"
                                stroke="#8B5CF6"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={polylinePoints}
                            />

                            {svgPoints.map((pt) => (
                                <g key={pt.id}>
                                    <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r="5"
                                        fill={pt.isProjected ? '#06B6D4' : '#A855F7'}
                                        stroke="#090A0F"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={pt.x}
                                        y={pt.y - 10}
                                        textAnchor="middle"
                                        fill={pt.isProjected ? '#67E8F9' : '#E2E8F0'}
                                        fontSize="10"
                                        fontWeight="bold"
                                    >
                                        {pt.displayValue}
                                    </text>
                                    <text
                                        x={pt.x}
                                        y={svgHeight - 6}
                                        textAnchor="middle"
                                        fill={pt.isProjected ? '#38BDF8' : '#94A3B8'}
                                        fontSize="10"
                                    >
                                        {pt.shortLabel}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>
                ) : (
                    <div className="space-y-3 pt-2">
                        {combinedChartData.map((item) => (
                            <div key={item.id} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-200">{item.fullLabel}</span>
                                        {item.isProjected ? (
                                            <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">
                                                PROYECCIÓN
                                            </span>
                                        ) : (
                                            item.wowPct !== 0 && (
                                                <span
                                                    className={`inline-flex items-center text-[10px] font-semibold ${item.wowPct > 0 ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}
                                                >
                                                    {item.wowPct > 0 ? (
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    ) : (
                                                        <ArrowDownRight className="h-3 w-3" />
                                                    )}
                                                    {item.wowPct > 0 ? `+${item.wowPct.toFixed(1)}%` : `${item.wowPct.toFixed(1)}%`} WoW
                                                </span>
                                            )
                                        )}
                                    </div>
                                    <strong className={item.isProjected ? 'text-cyan-300' : 'text-violet-300'}>
                                        {item.displayValue}
                                    </strong>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800/90">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${item.isProjected
                                                ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                                                : 'bg-gradient-to-r from-violet-600 to-cyan-500'
                                            }`}
                                        style={{ width: `${Math.min(100, (item.value / maxChartVal) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Simulador Interactivo de Proyecciones + Anillos de Distribución */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-violet-500/30 bg-[#12141D] p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Sliders className="h-4 w-4 text-cyan-400" />
                                Simulador Dinámico de Proyecciones (Noviembre y Diciembre)
                            </h3>
                            <p className="text-xs text-slate-400">
                                Ajusta las variables para simular el cierre semanal y mensual de Tiva Design
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setSimVolumePct(0);
                                setSimTicketPct(0);
                                setSimWeeklyAds(42);
                            }}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:text-white"
                        >
                            Restaurar Base
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-800 bg-[#090A0F] p-3.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Variación de Pedidos</span>
                                <strong className="text-violet-300">
                                    {simVolumePct >= 0 ? `+${simVolumePct}%` : `${simVolumePct}%`}
                                </strong>
                            </div>
                            <input
                                type="range"
                                min="-50"
                                max="100"
                                step="5"
                                value={simVolumePct}
                                onChange={(e) => setSimVolumePct(Number(e.target.value))}
                                className="mt-2 w-full accent-violet-500"
                            />
                            <p className="mt-1 text-[11px] text-slate-400">
                                Meta simulada: <strong className="text-white">{simWeeklyOrders} ventas/semana</strong>
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-[#090A0F] p-3.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Ajuste Ticket / Upsell</span>
                                <strong className="text-cyan-300">
                                    {simTicketPct >= 0 ? `+${simTicketPct}%` : `${simTicketPct}%`}
                                </strong>
                            </div>
                            <input
                                type="range"
                                min="-20"
                                max="50"
                                step="5"
                                value={simTicketPct}
                                onChange={(e) => setSimTicketPct(Number(e.target.value))}
                                className="mt-2 w-full accent-cyan-500"
                            />
                            <p className="mt-1 text-[11px] text-slate-400">
                                Ticket simulado:{' '}
                                <strong className="text-white">
                                    ${(averageTicket * (1 + simTicketPct / 100)).toFixed(2)} USD
                                </strong>
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-800 bg-[#090A0F] p-3.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-400">Gasto Meta Ads / Sem</span>
                                <strong className="text-emerald-400">${simWeeklyAds} USD</strong>
                            </div>
                            <input
                                type="range"
                                min="15"
                                max="120"
                                step="3"
                                value={simWeeklyAds}
                                onChange={(e) => setSimWeeklyAds(Number(e.target.value))}
                                className="mt-2 w-full accent-emerald-500"
                            />
                            <p className="mt-1 text-[11px] text-slate-400">
                                ROAS estimado: <strong className="text-white">{projectedRoas.toFixed(1)}x</strong>
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-800/90 bg-[#090A0F] p-4 sm:grid-cols-4">
                        <div>
                            <span className="text-[11px] text-slate-400">Ingreso Semanal Proy.</span>
                            <p className="mt-0.5 text-lg font-bold text-white">${simWeeklyRevenue.toFixed(2)} USD</p>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400">Pago a Vendedor / Sem</span>
                            <p className="mt-0.5 text-lg font-bold text-cyan-400">${simWeeklyPayroll.toFixed(2)} USD</p>
                            <span className="text-[10px] text-slate-400">
                                {simWeeklyBonus > 0 ? 'Incluye Bono $10' : 'Sin Bono (<15 ops)'}
                            </span>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400">Utilidad Neta Semanal</span>
                            <p className="mt-0.5 text-lg font-bold text-emerald-400">${simWeeklyNet.toFixed(2)} USD</p>
                        </div>
                        <div>
                            <span className="text-[11px] text-slate-400">Proyección 4 Semanas</span>
                            <p className="mt-0.5 text-lg font-bold text-violet-300">
                                ${projected4WeeksRevenue.toFixed(2)} USD
                            </p>
                        </div>
                    </div>
                </div>

                {/* Gráficos Donut SVG */}
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                        <PieChart className="h-4 w-4 text-violet-400" />
                        Distribución por Producto y Pago
                    </h3>

                    <div className="flex items-center gap-4">
                        <svg viewBox="0 0 42 42" className="h-28 w-28 shrink-0">
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#1E293B" strokeWidth="5" />
                            {productSegments.map((seg) => (
                                <circle
                                    key={seg.name}
                                    cx="21"
                                    cy="21"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth="5"
                                    strokeDasharray={seg.strokeDasharray}
                                    strokeDashoffset={seg.strokeDashoffset}
                                />
                            ))}
                            <text x="21" y="22.5" textAnchor="middle" fill="#FFFFFF" fontSize="6" fontWeight="bold">
                                {totalOrders} ops
                            </text>
                        </svg>

                        <div className="flex-1 space-y-2 text-xs">
                            {productSegments.map((seg) => (
                                <div key={seg.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                                        <span className="font-medium text-slate-200">{seg.name}</span>
                                    </div>
                                    <span className="text-slate-300">
                                        ${seg.amount.toFixed(0)} ({seg.pct.toFixed(1)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 border-t border-slate-800 pt-4">
                        <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Participación por Método de Pago
                        </h4>
                        <div className="space-y-2">
                            {paymentSegments.map((seg) => (
                                <div key={seg.name} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-300">{seg.name}</span>
                                        <span className="font-medium text-cyan-300">
                                            ${seg.amount.toFixed(2)} ({seg.pct.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* NUEVO MÓDULO: Gestor Editable de Gastos Operativos Fijos en Vivo (Supabase) */}
            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                            <Receipt className="h-4 w-4 text-rose-400" />
                            Gestor de Gastos Operativos Fijos en Vivo (Total: ${fixedExpensesTotal.toFixed(2)} USD)
                        </h3>
                        <p className="text-xs text-slate-400">
                            Añade, edita o elimina costos operativos en tiempo real dentro de Supabase; el P&L y el margen neto se recalculan al instante
                        </p>
                    </div>
                </div>

                {expError && (
                    <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                        {expError}
                    </div>
                )}

                {/* Formulario para Añadir Nuevo Gasto Fijo */}
                <form
                    onSubmit={handleCreateExpense}
                    className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-slate-800/90 bg-[#090A0F] p-3.5 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <div>
                        <label className="mb-1 block text-[11px] text-slate-400">Concepto del Gasto</label>
                        <input
                            type="text"
                            placeholder="Ej. Publicidad Meta Ads"
                            value={expForm.concept}
                            onChange={(e) => setExpForm({ ...expForm, concept: e.target.value })}
                            className="w-full rounded-lg border border-slate-800 bg-[#12141D] px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] text-slate-400">Frecuencia</label>
                        <select
                            value={expForm.frequency}
                            onChange={(e) => setExpForm({ ...expForm, frequency: e.target.value })}
                            className="w-full rounded-lg border border-slate-800 bg-[#12141D] px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                        >
                            <option value="Semanal">Semanal</option>
                            <option value="Mensual">Mensual</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Anual">Anual</option>
                            <option value="Único">Pago Único</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] text-slate-400">Monto (USD)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Ej. 42.00"
                            value={expForm.amount_usd}
                            onChange={(e) => setExpForm({ ...expForm, amount_usd: e.target.value })}
                            className="w-full rounded-lg border border-slate-800 bg-[#12141D] px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-[11px] text-slate-400">Detalle / Observaciones</label>
                        <input
                            type="text"
                            placeholder="Ej. Campaña semanal Instagram"
                            value={expForm.notes}
                            onChange={(e) => setExpForm({ ...expForm, notes: e.target.value })}
                            className="w-full rounded-lg border border-slate-800 bg-[#12141D] px-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-md hover:opacity-95"
                        >
                            <PlusCircle className="h-3.5 w-3.5" />
                            Añadir Gasto Fijo
                        </button>
                    </div>
                </form>

                {/* Tabla Editable de Gastos Fijos */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                                <th className="pb-2.5 font-medium">Concepto</th>
                                <th className="pb-2.5 font-medium">Frecuencia</th>
                                <th className="pb-2.5 font-medium">Monto (USD)</th>
                                <th className="pb-2.5 font-medium">Observaciones</th>
                                <th className="pb-2.5 text-right font-medium">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {expenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-slate-800/25">
                                    <td className="py-2.5 font-medium text-white">
                                        {editingExpId === exp.id ? (
                                            <input
                                                value={editingExpDraft.concept || ''}
                                                onChange={(e) =>
                                                    setEditingExpDraft({ ...editingExpDraft, concept: e.target.value })
                                                }
                                                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                            />
                                        ) : (
                                            exp.concept
                                        )}
                                    </td>
                                    <td className="py-2.5 text-slate-300">
                                        {editingExpId === exp.id ? (
                                            <select
                                                value={editingExpDraft.frequency || 'Semanal'}
                                                onChange={(e) =>
                                                    setEditingExpDraft({ ...editingExpDraft, frequency: e.target.value })
                                                }
                                                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                            >
                                                <option value="Semanal">Semanal</option>
                                                <option value="Mensual">Mensual</option>
                                                <option value="Trimestral">Trimestral</option>
                                                <option value="Anual">Anual</option>
                                                <option value="Único">Pago Único</option>
                                            </select>
                                        ) : (
                                            <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                                                {exp.frequency}
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 font-semibold text-rose-400">
                                        {editingExpId === exp.id ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editingExpDraft.amount_usd ?? 0}
                                                onChange={(e) =>
                                                    setEditingExpDraft({ ...editingExpDraft, amount_usd: e.target.value })
                                                }
                                                className="w-24 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                            />
                                        ) : (
                                            `$${Number(exp.amount_usd).toFixed(2)} USD`
                                        )}
                                    </td>
                                    <td className="py-2.5 text-slate-400">
                                        {editingExpId === exp.id ? (
                                            <input
                                                value={editingExpDraft.notes || ''}
                                                onChange={(e) =>
                                                    setEditingExpDraft({ ...editingExpDraft, notes: e.target.value })
                                                }
                                                className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                            />
                                        ) : (
                                            exp.notes || '—'
                                        )}
                                    </td>
                                    <td className="py-2.5 text-right">
                                        {editingExpId === exp.id ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={saveEditExpense}
                                                    title="Guardar cambios en Supabase"
                                                    className="rounded bg-emerald-500/20 p-1 text-emerald-400 hover:bg-emerald-500/30"
                                                >
                                                    <Save className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setEditingExpId(null)}
                                                    className="rounded bg-slate-800 p-1 text-slate-400 hover:text-white"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => startEditExpense(exp)}
                                                    title="Editar gasto fijo"
                                                    className="text-slate-400 hover:text-violet-400"
                                                >
                                                    <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => confirmDeleteExpense(exp)}
                                                    title="Eliminar gasto fijo"
                                                    className="text-slate-400 hover:text-rose-400"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Control de Nómina y Liquidación Semanal al Vendedor */}
            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                    <Calendar className="h-4 w-4 text-violet-400" />
                    Control de Nómina y Liquidación Semanal al Vendedor (Lunes a Domingo)
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

            {/* Auditoría General de Ventas con Filtros */}
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