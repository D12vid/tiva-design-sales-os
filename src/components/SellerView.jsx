import React, { useState } from 'react';
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
    Lock
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
        amount_bs: 6000,
        payment_method: 'Pago Móvil',
        channel: 'Meta Ads'
    });
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editDraft, setEditDraft] = useState({});

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
        setFormData((prev) => ({
            ...prev,
            product: prodName,
            price_usd: found ? found.defaultPrice : prev.price_usd,
            amount_bs: found ? found.defaultBs : prev.amount_bs
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
            s.client_name.toLowerCase().includes(search.toLowerCase()) ||
            s.product.toLowerCase().includes(search.toLowerCase()) ||
            s.payment_method.toLowerCase().includes(search.toLowerCase())
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
            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-violet-400" />
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Control de Semanas Operativas (Corte Lunes a Domingo)
                        </h3>
                    </div>
                    <span className="text-xs text-slate-400">
                        Semana seleccionada: <strong className="text-white">{activeWeekObj.rangeText}</strong>
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
                                        ? 'border-violet-500 bg-violet-600/15 shadow-lg shadow-violet-600/10'
                                        : 'border-slate-800 bg-[#090A0F] hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-white">Semana {w.id}</span>
                                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                                        {count} ops
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[10px] text-slate-400">
                                    {w.start.slice(5)} al {w.end.slice(5)}
                                </p>
                                <div className="mt-2">
                                    {paid ? (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                                            <CheckCircle2 className="h-2.5 w-2.5" />
                                            PAGADA
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
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
                <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5 lg:col-span-2">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                            <PlusCircle className="h-5 w-5 text-violet-400" />
                            Registrar Venta — Semana {selectedWeekId}
                        </h2>
                        <span className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
                            Comisión Vendedor: 15% (${(Number(formData.price_usd || 0) * 0.15).toFixed(2)} USD)
                        </span>
                    </div>

                    {error && (
                        <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs text-slate-400">Fecha de Venta</label>
                            <input
                                type="date"
                                value={formData.sale_date}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-400">Semana Asignada</label>
                            <input
                                type="text"
                                readOnly
                                value={`Semana ${formData.week_id} (${activeWeekObj.start.slice(5)} / ${activeWeekObj.end.slice(5)})`}
                                className="w-full rounded-xl border border-slate-800/70 bg-[#090A0F]/60 px-3 py-2 text-xs font-medium text-violet-300"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-slate-400">Nombre del Cliente</label>
                            <input
                                type="text"
                                placeholder="Ej. Santiago Pietri Hidalgo"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-400">Producto / Licencia</label>
                            <select
                                value={formData.product}
                                onChange={(e) => handleProductChange(e.target.value)}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                            >
                                {PRODUCT_CATALOG.map((p) => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-400">Precio (USD)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.price_usd}
                                onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-400">Monto Recibido (Bs)</label>
                            <input
                                type="number"
                                step="1"
                                value={formData.amount_bs}
                                onChange={(e) => setFormData({ ...formData, amount_bs: e.target.value })}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-slate-400">Método de Pago</label>
                            <select
                                value={formData.payment_method}
                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                            >
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs text-slate-400">Canal de Adquisición</label>
                            <select
                                value={formData.channel}
                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                className="w-full rounded-xl border border-slate-800 bg-[#090A0F] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                            >
                                {SALES_CHANNELS.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end sm:col-span-2">
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:opacity-95"
                            >
                                Guardar Venta en Semana {formData.week_id}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">
                                Liquidación Semana {selectedWeekId}
                            </span>
                            {isWeekPaid ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    SEMANA PAGADA
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                                    <Clock className="h-3.5 w-3.5" />
                                    FALTA POR PAGAR
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-[11px] text-slate-400">{activeWeekObj.rangeText}</p>

                        <div className="mt-4 rounded-xl border border-slate-800 bg-[#090A0F] p-3.5">
                            <span className="text-[11px] text-slate-400">Total a cobrar por el vendedor</span>
                            <p className="mt-0.5 text-2xl font-bold text-white">${totalPayout.toFixed(2)} USD</p>
                            <div className="mt-2 flex justify-between border-t border-slate-800/80 pt-2 text-[11px] text-slate-300">
                                <span>Comisión 15% (${weekRevenue.toFixed(2)} ventas):</span>
                                <strong className="text-cyan-400">${weekCommission.toFixed(2)} USD</strong>
                            </div>
                            <div className="mt-1 flex justify-between text-[11px] text-slate-300">
                                <span>Bono Semanal (Meta 15 ventas):</span>
                                <strong className={bonusUnlocked ? 'text-emerald-400' : 'text-slate-500'}>
                                    ${bonusUnlocked ? '10.00' : '0.00'} USD
                                </strong>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="mb-1.5 flex justify-between text-xs">
                                <span className="text-slate-300">Progreso Meta Bono</span>
                                <span className="font-semibold text-violet-300">{weekCount} / 15 ventas</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                                    style={{ width: `${Math.min(100, (weekCount / 15) * 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        className={`mt-4 rounded-xl border p-3 text-xs ${isWeekPaid
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
                            }`}
                    >
                        {isWeekPaid ? (
                            <div className="flex items-center gap-2 font-medium">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                                <span>Esta semana ya fue liquidada y pagada al vendedor.</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 font-medium">
                                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                                <span>Semana pendiente de cierre y liquidación al vendedor.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#12141D] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-sm font-semibold text-white">
                            Ventas de la Semana {selectedWeekId} ({filteredSales.length} registros)
                        </h3>
                        <span className="rounded-lg border border-slate-800 bg-[#090A0F] px-2.5 py-1 text-xs text-slate-300">
                            {activeWeekObj.rangeText}
                        </span>
                        {!canDelete && (
                            <span className="flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-0.5 text-[11px] text-slate-400">
                                <Lock className="h-3 w-3 text-amber-400" />
                                Eliminación restringida a Ejecutivo
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar cliente en esta semana..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-xl border border-slate-800 bg-[#090A0F] pl-8 pr-3 py-1.5 text-xs text-white focus:border-violet-500 focus:outline-none"
                        />
                    </div>
                </div>

                {filteredSales.length === 0 ? (
                    <div className="rounded-xl border border-slate-800/70 bg-[#090A0F] p-8 text-center text-xs text-slate-400">
                        No hay ventas registradas todavía en la <strong>Semana {selectedWeekId}</strong> ({activeWeekObj.rangeText}).
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-800 text-slate-400">
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
                            <tbody className="divide-y divide-slate-800/60">
                                {filteredSales.map((s) => (
                                    <tr key={s.id} className="hover:bg-slate-800/25">
                                        <td className="py-2.5 text-slate-300">{s.sale_date}</td>
                                        <td className="py-2.5 text-slate-400">Semana {s.week_id}</td>
                                        <td className="py-2.5 font-medium text-white">
                                            {editingId === s.id ? (
                                                <input
                                                    value={editDraft.client_name}
                                                    onChange={(e) => setEditDraft({ ...editDraft, client_name: e.target.value })}
                                                    className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                                />
                                            ) : (
                                                s.client_name
                                            )}
                                        </td>
                                        <td className="py-2.5">
                                            <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-violet-300">
                                                {s.product}
                                            </span>
                                        </td>
                                        <td className="py-2.5 font-semibold text-emerald-400">${Number(s.price_usd).toFixed(2)}</td>
                                        <td className="py-2.5 text-slate-300">{Number(s.amount_bs).toLocaleString()} Bs</td>
                                        <td className="py-2.5 text-slate-300">{s.payment_method}</td>
                                        <td className="py-2.5 font-medium text-cyan-400">${Number(s.commission_usd).toFixed(2)}</td>
                                        <td className="py-2.5 text-right">
                                            {editingId === s.id ? (
                                                <div className="flex justify-end gap-1.5">
                                                    <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300">
                                                        <Save className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-200">
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEdit(s)}
                                                        title="Editar cliente"
                                                        className="text-slate-400 hover:text-violet-400"
                                                    >
                                                        <Edit3 className="h-3.5 w-3.5" />
                                                    </button>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => confirmDelete(s)}
                                                            title="Eliminar venta"
                                                            className="text-slate-400 hover:text-rose-400"
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