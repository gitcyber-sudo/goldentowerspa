import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Receipt,
    Plus,
    Trash2,
    TrendingDown,
    PieChart,
    Pencil,
    Check,
    X,
    Tag
} from 'lucide-react';
import type { Expense } from '../../types';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Color palette cycling by index
const COLOR_PALETTE = [
    'bg-blue-100 text-blue-600',
    'bg-purple-100 text-purple-600',
    'bg-amber-100 text-amber-600',
    'bg-emerald-100 text-emerald-600',
    'bg-rose-100 text-rose-600',
    'bg-indigo-100 text-indigo-600',
    'bg-slate-100 text-slate-600',
    'bg-teal-100 text-teal-600',
];

interface ExpenseCategory {
    id: string;
    label: string;
    sort_order: number;
}

const ExpensesTab: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));

    // Category management state
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState('');
    const [newCatLabel, setNewCatLabel] = useState('');
    const [catLoading, setCatLoading] = useState(false);

    const [newExpense, setNewExpense] = useState({
        amount: '',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    const fetchCategories = useCallback(async () => {
        const { data } = await supabase
            .from('expense_categories')
            .select('*')
            .order('sort_order', { ascending: true });
        if (data) {
            setCategories(data);
            // Set default category for new expense if not yet set
            setNewExpense(prev => ({ ...prev, category: prev.category || data[0]?.id || '' }));
        }
    }, []);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const start = startOfMonth(new Date(filterMonth));
            const end = endOfMonth(new Date(filterMonth));

            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .is('deleted_at', null)
                .gte('date', format(start, 'yyyy-MM-dd'))
                .lte('date', format(end, 'yyyy-MM-dd'))
                .order('date', { ascending: false });

            if (error) throw error;
            if (data) setExpenses(data);
        } catch (err) {
            console.error('Error fetching expenses:', err);
        } finally {
            setLoading(false);
        }
    }, [filterMonth]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const catLabel = categories.find(c => c.id === newExpense.category)?.label || newExpense.category;
            const { error } = await supabase
                .from('expenses')
                .insert([{
                    amount: parseFloat(newExpense.amount),
                    category: catLabel,
                    description: newExpense.description,
                    date: newExpense.date
                }]);

            if (error) throw error;
            setIsAdding(false);
            setNewExpense({
                amount: '',
                category: categories[0]?.id || '',
                description: '',
                date: format(new Date(), 'yyyy-MM-dd')
            });
            fetchExpenses();
        } catch (err) {
            console.error('Error adding expense:', err);
            alert('Failed to log expense');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Discard this expense record?')) return;
        try {
            const { error } = await supabase
                .from('expenses')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            fetchExpenses();
        } catch (err) {
            console.error('Error deleting expense:', err);
        }
    };

    // ── Category Management ──────────────────────────────────

    const handleAddCategory = async () => {
        if (!newCatLabel.trim()) return;
        setCatLoading(true);
        try {
            const { error } = await supabase
                .from('expense_categories')
                .insert([{ label: newCatLabel.trim(), sort_order: categories.length }]);
            if (error) throw error;
            setNewCatLabel('');
            await fetchCategories();
        } catch (err) {
            console.error('Error adding category:', err);
        } finally {
            setCatLoading(false);
        }
    };

    const handleRenameCategory = async (id: string) => {
        if (!editingLabel.trim()) return;
        setCatLoading(true);
        try {
            const { error } = await supabase
                .from('expense_categories')
                .update({ label: editingLabel.trim() })
                .eq('id', id);
            if (error) throw error;
            setEditingCatId(null);
            setEditingLabel('');
            await fetchCategories();
        } catch (err) {
            console.error('Error renaming category:', err);
        } finally {
            setCatLoading(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Remove this category? Existing expenses using it will still show the label.')) return;
        setCatLoading(true);
        try {
            const { error } = await supabase
                .from('expense_categories')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
        } finally {
            setCatLoading(false);
        }
    };

    // ────────────────────────────────────────────────────────

    const totalMonthly = expenses.reduce((sum, e) => sum + e.amount, 0);

    const getCatColor = (index: number) => COLOR_PALETTE[index % COLOR_PALETTE.length];

    // Match expense category by label (stored as text in the expenses table)
    const getCatByLabel = (label: string) => {
        const idx = categories.findIndex(c => c.label === label);
        return { label: label || 'Unknown', color: getCatColor(idx >= 0 ? idx : 0) };
    };

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-serif text-charcoal">Expense & Profit Hub</h2>
                    <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-widest font-bold">Track operational costs and financial health</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        className="bg-white border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                        value={filterMonth}
                        onChange={e => setFilterMonth(e.target.value)}
                    />
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-charcoal text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg"
                    >
                        <Plus size={16} />
                        Log Expense
                    </button>
                </div>
            </div>

            {/* Monthly Summary Card */}
            <div className="bg-charcoal rounded-2xl p-8 text-white mb-8 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <PieChart size={160} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-black text-gold mb-2">Total Monthly Spend</p>
                        <h3 className="text-4xl font-serif">₱{totalMonthly.toLocaleString()}</h3>
                        <p className="text-xs text-white/40 mt-2 italic">For the period of {format(new Date(filterMonth), 'MMMM yyyy')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold mb-1">Items Logged</p>
                            <p className="text-xl font-serif text-gold">{expenses.length}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                            <p className="text-[8px] uppercase tracking-widest text-white/30 font-bold mb-1">Daily Avg</p>
                            <p className="text-xl font-serif text-gold">₱{Math.round(totalMonthly / 30).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Expense List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#Fdfbf7] border-b border-gold/10">
                                <tr className="text-[10px] uppercase font-bold text-charcoal/50 tracking-widest">
                                    <th className="px-5 py-4">Date & Description</th>
                                    <th className="px-5 py-4">Category</th>
                                    <th className="px-5 py-4">Amount</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/5">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-10 text-center italic text-charcoal/30">Reviewing ledgers...</td></tr>
                                ) : expenses.length === 0 ? (
                                    <tr><td colSpan={4} className="p-10 text-center italic text-charcoal/30">No expenses recorded for this period.</td></tr>
                                ) : expenses.map(expense => {
                                    const { label, color } = getCatByLabel(expense.category);
                                    return (
                                        <tr key={expense.id} className="hover:bg-cream/20 transition-colors group">
                                            <td className="px-5 py-5">
                                                <div>
                                                    <p className="text-xs font-bold text-charcoal/40 uppercase tracking-tighter mb-0.5">
                                                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                                                    </p>
                                                    <p className="font-semibold text-charcoal">{expense.description || 'No description provided'}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${color}`}>
                                                    {label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-5">
                                                <span className="text-lg font-serif text-charcoal">₱{expense.amount.toLocaleString()}</span>
                                            </td>
                                            <td className="px-5 py-5 text-right">
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-charcoal/20 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Category Breakdown */}
                    <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm">
                        <h3 className="font-serif text-lg text-charcoal mb-4">Category Breakdown</h3>
                        <div className="space-y-4">
                            {categories.map((cat, i) => {
                                const catTotal = expenses.filter(e => e.category === cat.label).reduce((sum, e) => sum + e.amount, 0);
                                const percentage = totalMonthly > 0 ? (catTotal / totalMonthly) * 100 : 0;
                                if (catTotal === 0) return null;
                                const color = getCatColor(i);
                                return (
                                    <div key={cat.id}>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-charcoal/60">{cat.label}</p>
                                            <p className="text-xs font-bold text-charcoal">₱{catTotal.toLocaleString()}</p>
                                        </div>
                                        <div className="w-full h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${color.split(' ')[1]} transition-all duration-1000`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {expenses.length === 0 && <p className="text-xs text-charcoal/30 italic">No data for this period.</p>}
                        </div>
                    </div>

                    {/* Manage Categories */}
                    <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag size={16} className="text-gold" />
                            <h3 className="font-serif text-lg text-charcoal">Manage Categories</h3>
                        </div>

                        <div className="space-y-1 mb-4">
                            {categories.map(cat => (
                                <div key={cat.id} className="flex items-center gap-2 group py-1.5 px-2 rounded-xl hover:bg-cream/30 transition-colors">
                                    {editingCatId === cat.id ? (
                                        <>
                                            <input
                                                autoFocus
                                                value={editingLabel}
                                                onChange={e => setEditingLabel(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleRenameCategory(cat.id);
                                                    if (e.key === 'Escape') setEditingCatId(null);
                                                }}
                                                className="flex-1 text-xs bg-cream/50 border border-gold/20 rounded-lg px-2 py-1.5 focus:outline-none focus:border-gold"
                                            />
                                            <button onClick={() => handleRenameCategory(cat.id)} disabled={catLoading} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                                                <Check size={14} />
                                            </button>
                                            <button onClick={() => setEditingCatId(null)} className="p-1 text-charcoal/30 hover:bg-charcoal/5 rounded-lg transition-colors">
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-xs text-charcoal font-medium">{cat.label}</span>
                                            <button
                                                onClick={() => { setEditingCatId(cat.id); setEditingLabel(cat.label); }}
                                                className="p-1 opacity-0 group-hover:opacity-100 text-gold hover:bg-gold/10 rounded-lg transition-all"
                                                title="Rename"
                                            >
                                                <Pencil size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                disabled={catLoading}
                                                className="p-1 opacity-0 group-hover:opacity-100 text-charcoal/30 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Add new category */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gold/10">
                            <input
                                type="text"
                                value={newCatLabel}
                                onChange={e => setNewCatLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
                                placeholder="New category name..."
                                className="flex-1 text-xs bg-cream/30 border border-gold/10 rounded-xl px-3 py-2 focus:outline-none focus:border-gold"
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={catLoading || !newCatLabel.trim()}
                                className="p-2 bg-gold text-white rounded-xl hover:bg-gold/80 transition-colors disabled:opacity-40"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Savings Strategy */}
                    <div className="bg-gold/5 border border-gold/10 rounded-2xl p-6">
                        <div className="flex items-center gap-2 text-gold mb-3">
                            <TrendingDown size={20} />
                            <h4 className="font-serif text-charcoal">Savings Strategy</h4>
                        </div>
                        {expenses.length > 0 ? (
                            <p className="text-xs text-charcoal/60 leading-relaxed">
                                Reducing your highest cost category by 10% would save you{' '}
                                <span className="font-bold text-charcoal">₱{Math.round(totalMonthly * 0.1).toLocaleString()}</span> next month.
                            </p>
                        ) : (
                            <p className="text-xs text-charcoal/40 italic">Log expenses to see insights.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Expense Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsAdding(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                        <div className="bg-charcoal p-6 text-white flex-shrink-0">
                            <h3 className="font-serif text-xl text-gold">Log Daily Expense</h3>
                            <p className="text-xs text-white/40 mt-1">Record a new operational cost for your ledger.</p>
                        </div>
                        <form onSubmit={handleAddExpense} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-1.5">Amount (₱)</label>
                                <input
                                    required
                                    type="number"
                                    step="0.01"
                                    className="w-full bg-cream/30 border border-gold/10 rounded-xl px-4 py-2.5 text-lg font-serif focus:outline-none focus:border-gold"
                                    placeholder="0.00"
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-1.5">Category</label>
                                <select
                                    className="w-full bg-cream/30 border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                                    value={newExpense.category}
                                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-1.5">Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-cream/30 border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold"
                                    value={newExpense.date}
                                    onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-1.5">Description (Who/What)</label>
                                <textarea
                                    className="w-full bg-cream/30 border border-gold/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold h-20 resize-none"
                                    placeholder="e.g. Meralco bill for Ground Floor, Payment to laundry service..."
                                    value={newExpense.description}
                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors">Abort</button>
                                <button type="submit" className="flex-1 bg-charcoal text-white px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-gold transition-all">Record Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesTab;
