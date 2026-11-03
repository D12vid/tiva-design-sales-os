import React from 'react';
import { ShieldCheck, UserCheck, Database, Lock, Unlock, Sparkles } from 'lucide-react';

export default function Navbar({
    activeRole,
    onSelectRole,
    isExecutiveUnlocked,
    onLockExecutive,
    auditCleanMode,
    setAuditCleanMode,
    isLiveDb
}) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090A0F]/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-600/25">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold tracking-tight text-white">TIVA DESIGN</span>
                            <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-300">
                                Sales & BI OS
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">@tivadesign_ • Licencias & Servicios Digitales</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex rounded-xl border border-slate-800 bg-[#12141D] p-1">
                        <button
                            onClick={() => onSelectRole('vendedor')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${activeRole === 'vendedor'
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            <UserCheck className="h-3.5 w-3.5" />
                            Panel Vendedor
                        </button>
                        <button
                            onClick={() => onSelectRole('ejecutivo')}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${activeRole === 'ejecutivo'
                                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {isExecutiveUnlocked ? (
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                            ) : (
                                <Lock className="h-3.5 w-3.5 text-amber-400" />
                            )}
                            Ejecutivo de Ventas
                        </button>
                    </div>

                    {activeRole === 'ejecutivo' && isExecutiveUnlocked && (
                        <>
                            <button
                                onClick={() => setAuditCleanMode(!auditCleanMode)}
                                className="rounded-xl border border-slate-800 bg-[#12141D] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-violet-500/50"
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

                    <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#12141D] px-3 py-1.5 text-xs">
                        <Database className={`h-3.5 w-3.5 ${isLiveDb ? 'text-emerald-400' : 'text-amber-400'}`} />
                        <span className="text-slate-300">{isLiveDb ? 'Supabase Live' : 'Realtime Local'}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
