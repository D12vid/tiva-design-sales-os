import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Database, Lock, Unlock, RefreshCw, Check } from 'lucide-react';

export function TivaLogo({ className = 'h-11 w-11' }) {
    return (
        <div
            className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-lime-400/40 bg-[#083335] shadow-lg shadow-lime-500/15 ${className}`}
            title="Tiva Design — @tivadesign_"
        >
            <svg viewBox="0 0 120 120" className="h-full w-full p-1.5">
                <rect width="120" height="120" rx="18" fill="#083335" />
                <path d="M 16 44 Q 62 32 104 45 L 103 53 Q 62 42 16 52 Z" fill="#F3F4F6" />
                <rect x="24" y="47" width="12" height="35" rx="1.5" fill="#F3F4F6" />
                <rect x="44" y="54" width="10" height="28" rx="1.5" fill="#F3F4F6" />
                <path d="M 59 54 L 69 54 L 73.5 72 L 78 54 L 88 54 L 78.5 82 L 68.5 82 Z" fill="#F3F4F6" />
                <path
                    d="M 91 58 Q 98 53 106 58 L 106 82 L 97 82 L 97 79 Q 93 83 89 80 Q 85 76 89 70 Q 93 66 98 67 L 98 62 Q 94 60 91 63 Z M 97 72 Q 93 72 93 75 Q 93 77 97 76 Z"
                    fill="#F3F4F6"
                />
            </svg>
        </div>
    );
}

export default function Navbar({
    activeRole,
    onSelectRole,
    isExecutiveUnlocked,
    onLockExecutive,
    auditCleanMode,
    setAuditCleanMode,
    isLiveDb,
    exchangeRate = 1000,
    onUpdateExchangeRate = () => { }
}) {
    const [rateDraft, setRateDraft] = useState(exchangeRate);
    const [savedNotice, setSavedNotice] = useState(false);

    useEffect(() => {
        setRateDraft(exchangeRate);
    }, [exchangeRate]);

    const handleSaveRate = (e) => {
        e.preventDefault();
        const numeric = Number(rateDraft);
        if (numeric > 0) {
            onUpdateExchangeRate(numeric);
            setSavedNotice(true);
            setTimeout(() => setSavedNotice(false), 1800);
        }
    };

    return (
        <header className="sticky top-0 z-30 border-b border-emerald-900/60 bg-[#030C0A]/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-3.5">
                    <TivaLogo className="h-11 w-11" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold tracking-tight text-white">
                                TIVA <span className="text-lime-400">DESIGN</span>
                            </span>
                            <span className="rounded-full border border-lime-400/35 bg-lime-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-lime-300">
                                Sales & BI OS
                            </span>
                        </div>
                        <p className="text-xs text-emerald-200/70">
                            @tivadesign_ • Software • ADS • Diseño Gráfico
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Campo Superior de Tasa del Día Bs/USD en Tiempo Real */}
                    <form
                        onSubmit={handleSaveRate}
                        className="flex items-center gap-2 rounded-xl border border-lime-400/35 bg-[#071917] px-3 py-1.5 shadow-sm"
                        title={
                            isExecutiveUnlocked
                                ? 'Edita la tasa del día y presiona Enter o el check para sincronizar con el vendedor'
                                : 'Tasa oficial activa (Desbloquea Ejecutivo para modificarla)'
                        }
                    >
                        <RefreshCw className="h-3.5 w-3.5 text-lime-400" />
                        <span className="text-[11px] font-semibold text-emerald-100/80">Tasa del Día:</span>
                        <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={rateDraft}
                            onChange={(e) => {
                                setRateDraft(e.target.value);
                                const val = Number(e.target.value);
                                if (val > 0) onUpdateExchangeRate(val);
                            }}
                            className="w-20 rounded-lg border border-emerald-800 bg-[#030C0A] px-2 py-0.5 text-center text-xs font-extrabold text-lime-400 focus:border-lime-400 focus:outline-none"
                        />
                        <span className="text-[11px] font-bold text-emerald-200/70">Bs/$</span>
                        <button
                            type="submit"
                            className="rounded-md bg-lime-400/20 p-1 text-lime-300 hover:bg-lime-400/30"
                            title="Guardar tasa en Supabase"
                        >
                            <Check className="h-3 w-3" />
                        </button>
                        {savedNotice && (
                            <span className="text-[10px] font-bold text-emerald-400">¡Sincronizada!</span>
                        )}
                    </form>

                    {/* Selector de Rol */}
                    <div className="flex rounded-xl border border-emerald-900/80 bg-[#071917] p-1">
                        <button
                            onClick={() => onSelectRole('vendedor')}
                            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${activeRole === 'vendedor'
                                ? 'bg-lime-400 text-[#030C0A] shadow-md shadow-lime-400/20'
                                : 'text-emerald-100/70 hover:text-white'
                                }`}
                        >
                            <UserCheck className="h-3.5 w-3.5" />
                            Panel Vendedor
                        </button>
                        <button
                            onClick={() => onSelectRole('ejecutivo')}
                            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${activeRole === 'ejecutivo'
                                ? 'bg-gradient-to-r from-lime-400 to-emerald-400 text-[#030C0A] shadow-md shadow-lime-400/25'
                                : 'text-emerald-100/70 hover:text-white'
                                }`}
                        >
                            {isExecutiveUnlocked ? (
                                <ShieldCheck className="h-3.5 w-3.5" />
                            ) : (
                                <Lock className="h-3.5 w-3.5 text-lime-400" />
                            )}
                            Ejecutivo de Ventas
                        </button>
                    </div>

                    {activeRole === 'ejecutivo' && isExecutiveUnlocked && (
                        <>
                            <button
                                onClick={() => setAuditCleanMode(!auditCleanMode)}
                                className="rounded-xl border border-emerald-800/80 bg-[#071917] px-3 py-1.5 text-xs font-medium text-emerald-100 hover:border-lime-400/60"
                            >
                                {auditCleanMode ? 'Vista Depurada (116 ops)' : 'Hoja Original (121 ops)'}
                            </button>

                            <button
                                onClick={onLockExecutive}
                                title="Bloquear panel ejecutivo"
                                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
                            >
                                <Unlock className="h-3.5 w-3.5" />
                                Bloquear
                            </button>
                        </>
                    )}

                    <div className="flex items-center gap-1.5 rounded-xl border border-emerald-900/80 bg-[#071917] px-3 py-1.5 text-xs">
                        <Database className={`h-3.5 w-3.5 ${isLiveDb ? 'text-lime-400' : 'text-amber-400'}`} />
                        <span className="font-medium text-emerald-100">
                            {isLiveDb ? 'Supabase Live' : 'Realtime Local'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
