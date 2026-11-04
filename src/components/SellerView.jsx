import React, { useState, useEffect } from 'react';
import {
    PlusCircle,
    Search,
    Award,
    CheckCircle2,
    Clock,
    Calendar,
    Trash2,
    Edit3,
    Save,
    X,
    Lock,
    Calculator,
    ArrowRightLeft,
    Zap
} from 'lucide-react';
import {
    PRODUCT_CATALOG,
    PAYMENT_METHODS,
    SALES_CHANNELS,
    getDynamicWeeksCalendar,
    getCurrentWeekId,
    getWeekIdFromDate
} from '../data/seedData';

export default function SellerView({
    sales,
    paidWeeks,
    exchangeRate = 1000,
    onAddSale,
    onUpdateSale,
    onDeleteSale,
    canDelete = false
}) {
    const currentWeekId = getCurrentWeekId();
    const weeksList = getDynamicWeeksCalendar(sales);
    const todayIso = new Date().toISOString().split('T')[0];

    const [selectedWeekId, setSelectedWeekId] = useState(currentWeekId);
    const [formData, setFormData] = useState({
        sale_date: todayIso >= '2026-11-02' ? todayIso : '2026-11-02',
        week_id: currentWeekId,
        client_name: '',
        product: 'Adobe',
        price_usd: 6,
        amount_bs: Math.round(6 * exchangeRate),
        payment_method: 'Pago Móvil',
        channel: 'Meta Ads'
    });
    const [manualBsOverride, setManualBsOverride] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState({});

    // Estado de la Calculadora Rápida de Cambio (USD <-> Bs)
    const [calcUsd, setCalcUsd] = useState(6);
    const [calcBs, setCalcBs] = useState(Math.round(6 * exchangeRate));

    // Recalcular automáticamente el monto en Bs cuando cambia la Tasa del Día o el Precio USD
    useEffect(() => {
        if (!manualBsOverride) {
            const autoBs = Math.round(Number(formData.price_usd || 0) * Number(exchangeRate || 1000));
            setFormData((prev) => ({ ...prev, amount_bs: autoBs }));
        }
        setCalcBs(Math.round(Number(calcUsd || 0) * Number(exchangeRate || 1000)));
    }, [exchangeRate, formData.price_usd, manualBsOverride, calcUsd]);

    const activeWeekObj =
        weeksList.find((w) => w.id === Number(selectedWeekId)) || weeksList[weeksList.length - 1];
    const isWeekPaid = Boolean(paidWeeks?.[selectedWeekId]);

    const handleSelectWeekTab = (weekObj) => {
        setSelectedWeekId(weekObj.id);
        setFormData((prev) => ({
            ...prev,
            week_id: weekObj.id,
            sale_date: weekObj.start
        }));
    };

    const handleDateChange = (newDate) => {
        const autoWeekId = getWeekIdFromDate(newDate);
        setSelectedWeekId(autoWeekId);
        setFormData((prev) => ({
            ...prev,
            sale_date: newDate,
            week_id: autoWeekId
        }));
    };

    const handleProductChange = (prodName) => {
        const found = PRODUCT_CATALOG.find((p) => p.name === prodName);
        const newPriceUsd = found ? found.defaultPrice : Number(formData.price_usd);
        const autoBs = Math.round(newPriceUsd * Number(exchangeRate || 1000));
        setManualBsOverride(false);
        setFormData((prev) => ({
            ...prev,
            product: prodName,
            price_usd: newPriceUsd,
            amount_bs: autoBs
        }));
    };

    const handlePriceUsdChange = (newUsdValue) => {
        const numUsd = Number(newUsdValue);
        setManualBsOverride(false);
        setFormData((prev) => ({
            ...prev,
            price_usd: newUsdValue,
            amount_bs: Math.round(numUsd * Number(exchangeRate || 1000))
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.client_name.trim()) {
            setError('El nombre del cliente es obligatorio.');
            return;
        }
        if (Number(formData.price_usd) <= 0 || Number(formData.amount_bs) <= 0) {
            setError('El precio en USD y el monto en Bs deben ser mayores a cero.');
            return;
        }
        setError('');
        const price = Number(formData.price_usd);
        const computedWeek = getWeekIdFromDate(formData.sale_date);

        onAddSale({
            ...formData,
            client_name: formData.client_name.trim(),
            price_usd: price,
            amount_bs: Number(formData.amount_bs),
            week_id: computedWeek,
            commission_usd: Number((price * 0.15).toFixed(2)),
            is_template_row: false
        });
        setManualBsOverride(false);
        setFormData((prev) => ({ ...prev, client_name: '' }));
    };

    const currentWeekSales = sales.filter((s) => Number(s.week_id) === Number(selectedWeekId));
    const weekCount = currentWeekSales.length;
    const bonusUnlocked = weekCount >= 15;
    const weekRevenue = currentWeekSales.reduce((acc, s) => acc + Number(s.price_usd || 0), 0);
    const weekCommission = currentWeekSales.reduce((acc, s) => acc + Number(s.commission_usd || 0), 0);
    const totalPayout = weekCommission + (bonusUnlocked ? 10 : 0);

    const filteredSales = currentWeekSales.filter(
        (s) =>
            (s.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.product || '').toLowerCase().includes(search.toLowerCase()) ||
            (s.payment_method || '').toLowerCase().includes(search.toLowerCase())
    );

    const startEdit = (sale) => {
        setEditingId(sale.id);
        setEditDraft({ ...sale });
    };

    const saveEdit = () => {
        if (!editDraft.client_name.trim() || Number(editDraft.price_usd) <= 0) return;
        const price = Number(editDraft.price_usd);
        onUpdateSale({
            ...editDraft,
            price_usd: price,
            amount_bs: Number(editDraft.amount_bs),
            commission_usd: Number((price * 0.15).toFixed(2))
        });
        setEditingId(null);
    };

    const confirmDelete = (sale) => {
        if (!canDelete) return;
        if (window.confirm(`¿Eliminar la venta de "${sale.client_name}" ($${Number(sale.price_usd).toFixed(2)} USD)?`)) {
            onDeleteSale(sale.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Selector de Semanas Operativas */}
            <div className="rounded-2xl border border-emerald-900/70 bg-[#071917]/90 p-4 shadow-xl backdrop-blur-md">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-lime-400" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                            Control de Semanas Operativas (Corte Lunes a Domingo)
                        </h3>
                    </div>
                    <span className="text-xs text-emerald-200/70">
                        Semana activa: <strong className="text-lime-300">{activeWeekObj.rangeText}</strong>
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
                    {weeksList.map((w) => {
                        const paid = Boolean(paidWeeks?.[w.id]);
                        const count = sales.filter((s) => Number(s.week_id) === w.id).length;
                        const isSelected = Number(selectedWeekId) === w.id;
                        return (
                            <button
                                key={w.id}
                                onClick={() => handleSelectWeekTab(w)}
                                className={`flex flex-col justify-between rounded-xl border p-2.5 text-left transition ${isSelected
                                        ? 'border-lime-400 bg-lime-400/15 shadow-lg shadow-lime-500/10'
                                        : 'border-emerald-900/70 bg-[#030C0A]/90 hover:border-emerald-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-white">Semana {w.id}</span>
                                    <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[10px] font-medium text-lime-300">
                                        {count} ops
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[10px] text-emerald-200/60">
                                    {w.start.slice(5)} al {w.end.slice(5)}
                                </p>
                                <div className="mt-2">
                                    {paid ? (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            PAGADA
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-lime-400/20 px-1.5 py-0.5 text-[10px] font-bold text-lime-300">
                                            <Clock className="h-2.5 w-2.5" />
                                            POR PAGAR
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Formulario con Selección Rápida y Autocálculo Bs/USD */}
                <div className="rounded-2xl border border-emerald-900/70 bg-[#071917]/90 p-5 shadow-xl lg:col-span-2">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-base font-bold text-white">
                            <PlusCircle className="h-5 w-5 text-lime-400" />
                            Registrar Venta — Semana {selectedWeekId}
                        </h2>
                        <span className="rounded-lg border border-lime-400/30 bg-lime-400/10 px-2.5 py-1 text-xs font-semibold text-lime-300">
                            Comisión 15%: ${(Number(formData.price_usd || 0) * 0.15).toFixed(2)} USD (
                            {Math.round(Number(formData.price_usd || 0) * 0.15 * exchangeRate).toLocaleString()} Bs)
                        </span>
                    </div>

                    {/* Botones de Selección Rápida de Licencias con Conversión en Vivo */}
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-900/80 bg-[#030C0A] p-2.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-lime-400">
                            <Zap className="h-3.5 w-3.5" /> Selección Rápida:
                        </span>
                        {[
                            { name: 'Adobe', price: 6 },
                            { name: 'Combo Creativo', price: 8 },
                            { name: 'Office', price: 15 },
                            { name: 'Canva Pro', price: 5 },
                            { name: 'ChatGPT Plus', price: 10 }
                        ].map((item) => {
                            const bsVal = Math.round(item.price * exchangeRate);
                            const active = formData.product === item.name && Number(formData.price_usd) === item.price;
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => handleProductChange(item.name)}
                                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${active
                                            ? 'border-lime-400 bg-lime-400 text-[#030C0A] shadow-sm'
                                            : 'border-emerald-800/80 bg-[#071917] text-emerald-100 hover:border-lime-400/50'
                                        }`}
                                >
                                    {item.name} (${item.price}) → <strong>{bsVal.toLocaleString()} Bs</strong>
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs text-emerald-200/70">Fecha de Venta</label>
                            <input
                                type="date"
                                value={formData.sale_date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-emerald-200/70">Semana Asignada</label>
                            <input
                                type="text"
                                readOnly
                                value={`Semana ${formData.week_id} (${activeWeekObj.start.slice(5)} / ${activeWeekObj.end.slice(5)})`}
                                className="w-full rounded-xl border border-emerald-900/60 bg-[#030C0A]/70 px-3 py-2 text-xs font-semibold text-lime-300"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-emerald-200/70">Nombre del Cliente</label>
                            <input
                                type="text"
                                placeholder="Ej. Santiago Pietri Hidalgo"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-emerald-200/70">Producto / Licencia</label>
                            <select
                                value={formData.product}
                                onChange={(e) => handleProductChange(e.target.value)}
                                className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                            >
                                {PRODUCT_CATALOG.map((p) => (
                                    <option key={p.name} value={p.name}>
                                        {p.name} (${p.defaultPrice})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-emerald-200/70">Precio (USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price_usd}
                                onChange={(e) => handlePriceUsdChange(e.target.value)}
                                className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-3 py-2 text-xs font-bold text-white focus:border-lime-400 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-emerald-200/70">Monto en Bs (Auto)</span>
                                <span className="text-[10px] font-bold text-lime-400">Tasa: {exchangeRate}</span>
                            </div>
                            <input
                                type="number"
                                step="1"
                                value={formData.amount_bs}
                                onChange={(e) => {
                                    setManualBsOverride(true);
                                    setFormData({ ...formData, amount_bs: e.target.value });
                                }}
                                className="w-full rounded-xl border border-lime-400/50 bg-[#030C0A] px-3 py-2 text-xs font-extrabold text-lime-300 focus:border-lime-400 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-emerald-200/70">Método de Pago</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                            >
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-emerald-200/70">Canal de Adquisición</label>
                            <select
                                value={formData.channel}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                className="w-full rounded-xl border border-emerald-900 bg-[#030C0A] px-3 py-2 text-xs text-white focus:border-lime-400 focus:outline-none"
                            >
                                {SALES_CHANNELS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end sm:col-span-2">
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-gradient-to-r from-lime-400 to-emerald-400 px-4 py-2.5 text-xs font-extrabold text-[#030C0A] shadow-lg shadow-lime-400/20 transition hover:brightness-105"
                            >
                                Guardar Venta ({Number(formData.amount_bs).toLocaleString()} Bs / ${Number(formData.price_usd).toFixed(2)} USD)
                            </button>
                        </div>
                    </form>
                </div>

                {/* Columna Derecha: Liquidación Semanal + Calculadora Rápida de Cambio */}
                <div className="flex flex-col justify-between gap-4">
                    <div className="rounded-2xl border border-emerald-900/70 bg-[#071917]/90 p-5 shadow-xl">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white">
                                Liquidación Semana {selectedWeekId}
                            </span>
                            {isWeekPaid ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    SEMANA PAGADA
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-lime-400/40 bg-lime-400/15 px-2.5 py-0.5 text-[11px] font-bold text-lime-300">
                                    <Clock className="h-3.5 w-3.5" />
                                    FALTA POR PAGAR
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-[11px] text-emerald-200/70">{activeWeekObj.rangeText}</p>

                        <div className="mt-3 rounded-xl border border-emerald-900/80 bg-[#030C0A] p-3">
                            <span className="text-[11px] text-emerald-200/60">Total a cobrar por el vendedor</span>
                            <div className="mt-0.5 flex items-baseline justify-between">
                                <p className="text-2xl font-extrabold text-lime-400">${totalPayout.toFixed(2)} USD</p>
                                <span className="text-xs font-semibold text-emerald-200/80">
                                    ≈ {Math.round(totalPayout * exchangeRate).toLocaleString()} Bs
                                </span>
                            </div>
                            <div className="mt-2 flex justify-between border-t border-emerald-900/60 pt-2 text-[11px] text-emerald-100/80">
                                <span>Comisión 15% (${weekRevenue.toFixed(2)} ventas):</span>
                                <strong className="text-white">${weekCommission.toFixed(2)} USD</strong>
                            </div>
                            <div className="mt-1 flex justify-between text-[11px] text-emerald-100/80">
                                <span>Bono Semanal (Meta 15 ventas):</span>
                                <strong className={bonusUnlocked ? 'text-lime-400' : 'text-emerald-200/40'}>
                                    ${bonusUnlocked ? '10.00' : '0.00'} USD
                                </strong>
                            </div>
                        </div>

                        <div className="mt-3">
                            <div className="mb-1 flex justify-between text-xs">
                                <span className="text-emerald-100/80">Progreso Meta Bono</span>
                                <span className="font-bold text-lime-300">{weekCount} / 15 ventas</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[#030C0A]">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-400 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (weekCount / 15) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calculadora Bidireccional de Cambio en Vivo */}
                    <div className="rounded-2xl border border-lime-400/30 bg-[#071917]/90 p-4 shadow-xl">
                        <div className="mb-2.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                                <Calculator className="h-4 w-4 text-lime-400" />
                                Calculadora de Cambio Rápida
                            </span>
                            <span className="text-[11px] font-semibold text-lime-300">
                                1 USD = {exchangeRate} Bs
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                            <div>
                                <label className="mb-1 block text-[10px] text-emerald-200/70">Monto en USD ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={calcUsd}
                                    onChange={(e) => {
                                        const u = e.target.value;
                                        setCalcUsd(u);
                                        setCalcBs(Math.round(Number(u || 0) * exchangeRate));
                                    }}
                                    className="w-full rounded-lg border border-emerald-800 bg-[#030C0A] px-2.5 py-1.5 text-xs font-bold text-white focus:border-lime-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-[10px] text-emerald-200/70">Equivalente en Bs</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={calcBs}
                                    onChange={(e) => {
                                        const b = e.target.value;
                                        setCalcBs(b);
                                        setCalcUsd(
                                            exchangeRate > 0 ? Number((Number(b || 0) / exchangeRate).toFixed(2)) : 0
                                        );
                                    }}
                                    className="w-full rounded-lg border border-emerald-800 bg-[#030C0A] px-2.5 py-1.5 text-xs font-extrabold text-lime-400 focus:border-lime-400 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Ventas de la Semana */}
            <div className="rounded-2xl border border-emerald-900/70 bg-[#071917]/90 p-5 shadow-xl">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-sm font-bold text-white">
                            Ventas de la Semana {selectedWeekId} ({filteredSales.length} registros)
                        </h3>
                        <span className="rounded-lg border border-emerald-900 bg-[#030C0A] px-2.5 py-1 text-xs text-lime-300">
                            {activeWeekObj.rangeText}
                        </span>
                        {!canDelete && (
                            <span className="flex items-center gap-1 rounded-full border border-emerald-800 bg-[#030C0A] px-2.5 py-0.5 text-[11px] text-emerald-200/70">
                                <Lock className="h-3 w-3 text-lime-400" />
                                Eliminación restringida a Ejecutivo
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-emerald-500" />
                        <input
                            type="text"
                            placeholder="Buscar cliente en esta semana..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-xl border border-emerald-900 bg-[#030C0A] pl-8 pr-3 py-1.5 text-xs text-white focus:border-lime-400 focus:outline-none"
                        />
                    </div>
                </div>

                {filteredSales.length === 0 ? (
                    <div className="rounded-xl border border-emerald-900/60 bg-[#030C0A] p-8 text-center text-xs text-emerald-200/60">
                        No hay ventas registradas todavía en la <strong>Semana {selectedWeekId}</strong> ({activeWeekObj.rangeText}).
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-emerald-900/70 text-emerald-200/60">
                                    <th className="pb-2.5 font-medium">Fecha</th>
                                    <th className="pb-2.5 font-medium">Semana</th>
                                    <th className="pb-2.5 font-medium">Cliente</th>
                                    <th className="pb-2.5 font-medium">Producto</th>
                                    <th className="pb-2.5 font-medium">Precio USD</th>
                                    <th className="pb-2.5 font-medium">Monto Bs</th>
                                    <th className="pb-2.5 font-medium">Método Pago</th>
                                    <th className="pb-2.5 font-medium">Comisión (15%)</th>
                                    <th className="pb-2.5 text-right font-medium">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-900/40">
                                {filteredSales.map((s) => (
                                    <tr key={s.id} className="hover:bg-emerald-950/40">
                                        <td className="py-2.5 text-emerald-100/80">{s.sale_date}</td>
                                        <td className="py-2.5 text-emerald-200/60">Semana {s.week_id}</td>
                                        <td className="py-2.5 font-semibold text-white">
                                            {editingId === s.id ? (
                                                <input
                                                    value={editDraft.client_name}
                                                    onChange={(e) => setEditDraft({ ...editDraft, client_name: e.target.value })}
                                                    className="rounded border border-emerald-700 bg-[#030C0A] px-2 py-1 text-xs text-white"
                                                />
                                            ) : (
                                                s.client_name
                                            )}
                                        </td>
                                        <td className="py-2.5">
                                            <span
                                                className={`rounded-md px-2 py-0.5 font-semibold ${s.product === 'Office' || s.product === 'Combo Creativo'
                                                        ? 'bg-violet-500/20 text-violet-300'
                                                        : 'bg-lime-400/15 text-lime-300'
                                                    }`}
                                            >
                                                {s.product}
                                            </span>
                                        </td>
                                        <td className="py-2.5 font-bold text-lime-400">${Number(s.price_usd).toFixed(2)}</td>
                                        <td className="py-2.5 text-emerald-100/80">{Number(s.amount_bs).toLocaleString()} Bs</td>
                                        <td className="py-2.5 text-emerald-100/80">{s.payment_method}</td>
                                        <td className="py-2.5 font-semibold text-emerald-300">${Number(s.commission_usd).toFixed(2)}</td>
                                        <td className="py-2.5 text-right">
                                            {editingId === s.id ? (
                                                <div className="flex justify-end gap-1.5">
                                                    <button onClick={saveEdit} className="text-lime-400 hover:text-lime-300">
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-emerald-200/60 hover:text-white">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(s)}
                                                        title="Editar cliente"
                                                        className="text-emerald-200/60 hover:text-lime-400"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => confirmDelete(s)}
                                                            title="Eliminar venta"
                                                            className="text-emerald-200/60 hover:text-rose-400"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
