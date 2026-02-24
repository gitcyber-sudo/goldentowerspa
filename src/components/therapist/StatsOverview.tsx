import React from 'react';
import { Wallet } from 'lucide-react';

interface StatsOverviewProps {
    totalCommissions: number;
    totalTips: number;
    sessionCount: number;
    todayCount: number;
    pendingCount: number;
    completedCount: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
    totalCommissions,
    totalTips,
    sessionCount,
    todayCount,
    pendingCount,
    completedCount
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-1 gap-4 mb-8">
            {/* Primary Earnings Card - Consolidated with Tips */}
            <div className="dashboard-stat md:col-span-2 bg-gradient-to-br from-charcoal to-charcoal-light rounded-3xl p-6 border border-gold/30 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/20 transition-all duration-700" />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
                            <Wallet className="text-gold" size={24} />
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-gold tracking-[0.2em] mb-1">Total Period Earnings</p>
                            <div className="flex items-center gap-1 justify-end">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Updates</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6 mb-2">
                        <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">₱{(totalCommissions + totalTips).toLocaleString()}</h2>
                        <div className="flex items-center gap-3 pb-1">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Commission</span>
                                <span className="text-xs font-bold text-white/80">₱{totalCommissions.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="flex flex-col font-medium">
                                <span className="text-[9px] uppercase font-bold text-gold tracking-widest">Tips Earned</span>
                                <span className="text-xs font-bold text-gold">₱{totalTips.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-white/40 text-[10px] font-medium leading-relaxed italic border-t border-white/5 pt-4 mt-2">
                        Derived from <span className="text-gold font-bold">{sessionCount} completed sessions</span> in the selected timeframe.
                    </p>
                </div>
            </div>

            {/* Summary Stats Card */}
            <div className="dashboard-stat bg-white rounded-3xl p-6 border border-gold/10 shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gold/[0.02] pointer-events-none" />
                <div className="grid grid-cols-3 gap-2 h-full relative z-10">
                    <div className="flex flex-col items-center justify-center p-3 bg-cream/30 rounded-2xl border border-gold/5">
                        <span className="text-xl font-serif text-charcoal">{todayCount}</span>
                        <span className="text-[8px] uppercase font-bold text-charcoal/40 tracking-widest">Today</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-gold/5 rounded-2xl border border-gold/5">
                        <span className="text-xl font-serif text-gold">{pendingCount}</span>
                        <span className="text-[8px] uppercase font-bold text-gold/60 tracking-widest">Pending</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <span className="text-xl font-serif text-emerald-600">{completedCount}</span>
                        <span className="text-[8px] uppercase font-bold text-emerald-600/60 tracking-widest">Done</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsOverview;
