import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, CheckCircle, Clock, Trash2, ExternalLink } from 'lucide-react';

interface ErrorLog {
    id: string;
    created_at: string;
    message: string;
    stack: string;
    component_stack: string;
    url: string;
    user_agent: string;
    user_id: string;
    status: 'open' | 'fixed' | 'ignored';
    severity: 'error' | 'warning' | 'info';
}

const ErrorLogs: React.FC = () => {
    const [logs, setLogs] = useState<ErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'fixed'>('open');
    const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        let query = supabase
            .from('error_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data } = await query;
        if (data) setLogs(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const updateStatus = async (id: string, status: 'open' | 'fixed' | 'ignored') => {
        const { error } = await supabase
            .from('error_logs')
            .update({ status })
            .eq('id', id);

        if (!error) {
            setLogs(prev => prev.map(log => log.id === id ? { ...log, status } : log));
            if (selectedLog?.id === id) setSelectedLog(prev => prev ? { ...prev, status } : null);
        }
    };

    const deleteLog = async (id: string) => {
        if (!confirm('Are you sure you want to delete this log?')) return;

        const { error } = await supabase
            .from('error_logs')
            .delete()
            .eq('id', id);

        if (!error) {
            setLogs(prev => prev.filter(log => log.id !== id));
            if (selectedLog?.id === id) setSelectedLog(null);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
            {/* List Side */}
            <div className="w-full md:w-1/3 flex flex-col bg-white rounded-xl border border-gold/10 overflow-hidden">
                <div className="p-4 border-b border-gold/10 bg-cream/30 flex justify-between items-center">
                    <h2 className="font-serif text-lg text-charcoal">System Logs</h2>
                    <div className="flex gap-2 text-xs items-center">
                        <button
                            onClick={() => { throw new Error("This is a manually triggered test error for email verification."); }}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                        >
                            Test Error
                        </button>
                        <button onClick={fetchLogs} className="text-gold hover:text-gold-dark transition-colors p-1" title="Refresh">
                            <Clock size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="p-2 border-b border-gold/5 flex gap-1 justify-center bg-white/50">
                    <button
                        onClick={() => setFilter('open')}
                        className={`px-3 py-1 rounded-full border ${filter === 'open' ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold' : 'border-transparent text-charcoal/50 hover:bg-black/5'}`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setFilter('fixed')}
                        className={`px-3 py-1 rounded-full border ${filter === 'fixed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'border-transparent text-charcoal/50 hover:bg-black/5'}`}
                    >
                        Fixed
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-full border ${filter === 'all' ? 'bg-charcoal/5 border-charcoal/10 text-charcoal font-bold' : 'border-transparent text-charcoal/50 hover:bg-black/5'}`}
                    >
                        All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        <div className="p-8 text-center text-charcoal/40 text-sm animate-pulse">Loading logs...</div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center text-charcoal/40 text-sm">No logs found.</div>
                    ) : (
                        logs.map(log => (
                            <div
                                key={log.id}
                                onClick={() => setSelectedLog(log)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedLog?.id === log.id
                                    ? 'bg-gold/5 border-gold/30 shadow-sm'
                                    : 'bg-white border-transparent hover:border-gold/10 hover:bg-cream/20'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${log.severity === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {log.severity}
                                    </span>
                                    <span className="text-[10px] text-charcoal/40">
                                        {new Date(log.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-charcoal truncate" title={log.message}>
                                    {log.message}
                                </p>
                                <p className="text-[10px] text-charcoal/40 truncate mt-1 font-mono">
                                    {log.url.split(window.location.origin)[1] || log.url}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail Side */}
            <div className="flex-1 bg-white rounded-xl border border-gold/10 overflow-hidden flex flex-col">
                {selectedLog ? (
                    <>
                        <div className="p-6 border-b border-gold/10 flex justify-between items-start">
                            <div>
                                <h3 className="font-serif text-2xl text-charcoal mb-2">{selectedLog.message}</h3>
                                <div className="flex items-center gap-4 text-xs text-charcoal/50">
                                    <span className="flex items-center gap-1.5 bg-charcoal/5 px-2 py-1 rounded">
                                        <Clock size={12} />
                                        {new Date(selectedLog.created_at).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-charcoal/5 px-2 py-1 rounded truncate max-w-[200px]" title={selectedLog.url}>
                                        <ExternalLink size={12} />
                                        {selectedLog.url}
                                    </span>
                                    {selectedLog.user_id && (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono">
                                            User ID: {selectedLog.user_id.slice(0, 8)}...
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedLog.status === 'open' ? (
                                    <button
                                        onClick={() => updateStatus(selectedLog.id, 'fixed')}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-bold"
                                    >
                                        <CheckCircle size={14} /> Mark Fixed
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => updateStatus(selectedLog.id, 'open')}
                                        className="flex items-center gap-2 px-4 py-2 bg-charcoal/5 text-charcoal rounded-lg hover:bg-charcoal/10 transition-colors text-sm font-bold"
                                    >
                                        Reopen Issue
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteLog(selectedLog.id)}
                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete Log"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Stack Trace */}
                            <div>
                                <h4 className="text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Stack Trace</h4>
                                <div className="bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-slate-700 shadow-inner">
                                    {selectedLog.stack || 'No stack trace available.'}
                                </div>
                            </div>

                            {/* Component Trace */}
                            <div>
                                <h4 className="text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Component Stack</h4>
                                <div className="bg-charcoal/5 text-charcoal/70 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed border border-charcoal/10">
                                    {selectedLog.component_stack || 'No component stack available.'}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h4 className="text-sm font-bold text-charcoal mb-2 uppercase tracking-wide">Metadata</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-3 bg-charcoal/5 rounded-lg border border-charcoal/10">
                                        <span className="block text-[10px] uppercase text-charcoal/40 font-bold mb-1">User Agent</span>
                                        <span className="text-xs text-charcoal font-mono break-all">{selectedLog.user_agent}</span>
                                    </div>
                                    <div className="p-3 bg-charcoal/5 rounded-lg border border-charcoal/10">
                                        <span className="block text-[10px] uppercase text-charcoal/40 font-bold mb-1">Log ID</span>
                                        <span className="text-xs text-charcoal font-mono">{selectedLog.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-charcoal/30">
                        <AlertTriangle size={48} className="mb-4 opacity-50" />
                        <p>Select a log to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorLogs;
