import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Package,
    Plus,
    Minus,
    History,
    AlertTriangle,
    Search,
    Filter,
    ArrowUpDown,
    Edit2,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import type { InventoryItem, InventoryLog } from '../../types';
import { format } from 'date-fns';

const InventoryTab: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [logs, setLogs] = useState<InventoryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLogId, setShowLogId] = useState<string | null>(null);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [showIntelligence, setShowIntelligence] = useState(false);

    // New Item Form
    const [newItem, setNewItem] = useState({
        name: '',
        unit: 'pcs',
        current_stock: 0,
        alert_threshold: 10,
        category: 'supplies'
    });
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    // Restock State
    const [restockingItem, setRestockingItem] = useState<InventoryItem | null>(null);
    const [restockForm, setRestockForm] = useState({
        quantity: '',
        cost: '',
        notes: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data: itemData } = await supabase
                .from('inventory_items')
                .select('*')
                .is('deleted_at', null)
                .order('name');

            if (itemData) setItems(itemData);

            const { data: logData } = await supabase
                .from('inventory_logs')
                .select('*, inventory_items(name)')
                .order('created_at', { ascending: false })
                .limit(20);

            if (logData) setLogs(logData as any);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = async (itemId: string, amount: number, type: 'consumed' | 'restocked', cost?: number, notes?: string) => {
        try {
            const item = items.find(i => i.id === itemId);
            if (!item) return;

            const newStock = item.current_stock + amount;

            // 1. Update item stock and unit price
            const updatePayload: any = {
                current_stock: newStock,
                updated_at: new Date().toISOString()
            };

            // Calculate unit price if it's a restock with cost
            if (type === 'restocked' && cost && cost > 0) {
                updatePayload.unit_price = cost / amount;
            }

            const { error: updateError } = await supabase
                .from('inventory_items')
                .update(updatePayload)
                .eq('id', itemId);

            if (updateError) throw updateError;

            // 2. Log the change
            const { error: logError } = await supabase
                .from('inventory_logs')
                .insert([{
                    item_id: itemId,
                    change_amount: amount,
                    type,
                    notes: notes || `${type === 'restocked' ? 'Restocked' : 'Consumed'} via dashboard`
                }]);

            if (logError) throw logError;

            // 3. Optional: Create expense if restocked with cost
            if (type === 'restocked' && cost && cost > 0) {
                const { error: expenseError } = await supabase
                    .from('expenses')
                    .insert([{
                        amount: cost,
                        category: 'supplies',
                        description: `Restock: ${item.name} (+${amount} ${item.unit})`,
                        date: format(new Date(), 'yyyy-MM-dd')
                    }]);

                if (expenseError) throw expenseError;
            }

            fetchInventory();
            setRestockingItem(null);
            setRestockForm({ quantity: '', cost: '', notes: '' });
        } catch (error) {
            console.error('Error adjusting stock:', error);
            alert('Failed to update stock');
        }
    };

    const handleRestockSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!restockingItem) return;

        const qty = parseFloat(restockForm.quantity);
        const cost = parseFloat(restockForm.cost) || 0;

        if (isNaN(qty) || qty <= 0) {
            alert('Please enter a valid quantity');
            return;
        }

        handleAdjustStock(restockingItem.id, qty, 'restocked', cost, restockForm.notes);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalCategory = isCustomCategory ? customCategory : newItem.category;
            if (!finalCategory) {
                alert('Please select or enter a category');
                return;
            }

            const { error } = await supabase
                .from('inventory_items')
                .insert([{
                    ...newItem,
                    category: finalCategory
                }]);

            if (error) throw error;
            setIsAddingItem(false);
            setNewItem({ name: '', unit: 'pcs', current_stock: 0, alert_threshold: 10, category: 'supplies' });
            setCustomCategory('');
            setIsCustomCategory(false);
            fetchInventory();
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            const { error } = await supabase
                .from('inventory_items')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;
            fetchInventory();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const lowStockItems = items.filter(i => i.current_stock <= i.alert_threshold);

    // Intelligence Metrics
    const totalStorageValue = items.reduce((sum, item) => sum + (item.current_stock * (item.unit_price || 0)), 0);
    const valueByCategory = items.reduce((acc: Record<string, number>, item) => {
        const val = item.current_stock * (item.unit_price || 0);
        acc[item.category] = (acc[item.category] || 0) + val;
        return acc;
    }, {});

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif text-charcoal">Spa Logistics & Assets</h2>
                    <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-widest font-bold">Comprehensive inventory & supply chain management</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowIntelligence(true)}
                        className="flex items-center gap-2 bg-white border border-gold/20 text-charcoal px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold/5 transition-all"
                    >
                        <ArrowUpDown size={16} />
                        Intelligence
                    </button>
                    <button
                        onClick={() => setIsAddingItem(true)}
                        className="flex items-center gap-2 bg-charcoal text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-lg hover:shadow-gold/20"
                    >
                        <Plus size={16} />
                        Enroll Asset
                    </button>
                </div>
            </div>

            {/* Quick Stats & Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <Package className="text-gold" size={24} />
                        <span className="text-2xl font-serif text-charcoal">{items.length}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black">Total Assets</p>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm transition-colors ${lowStockItems.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gold/10'}`}>
                    <div className="flex items-center justify-between mb-2">
                        <AlertTriangle className={lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-500'} size={24} />
                        <span className="text-2xl font-serif text-charcoal">{lowStockItems.length}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black">Stock Alerts</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                        <span className="text-2xl font-serif text-charcoal">₱{totalStorageValue.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black">Estimated Worth</p>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20 group-focus-within:text-gold transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full h-full bg-white border border-gold/10 rounded-2xl pl-12 pr-6 py-3.5 text-sm focus:outline-none focus:border-gold transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Vault Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-[2rem] border border-gold/10 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gold/5 bg-cream/20">
                                        <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-charcoal/30">Asset Details</th>
                                        <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-charcoal/30">Stock Level</th>
                                        <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-charcoal/30">Category</th>
                                        <th className="px-6 py-5 text-right text-[10px] uppercase tracking-widest font-black text-charcoal/30">Control</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={4} className="p-10 text-center italic text-charcoal/30">Synchronizing vaults...</td></tr>
                                    ) : filteredItems.length === 0 ? (
                                        <tr><td colSpan={4} className="p-10 text-center italic text-charcoal/30">No assets found matching your criteria.</td></tr>
                                    ) : filteredItems.map(item => (
                                        <tr key={item.id} className="group hover:bg-cream/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.current_stock <= item.alert_threshold ? 'bg-amber-100 text-amber-600' : 'bg-charcoal/5 text-charcoal/40'}`}>
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-charcoal group-hover:text-gold transition-colors">{item.name}</p>
                                                        <p className="text-[10px] text-charcoal/40 uppercase tracking-tighter">{item.unit_price ? `₱${item.unit_price.toLocaleString()} per ${item.unit}` : `Per ${item.unit}`}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className={`text-lg font-serif ${item.current_stock <= item.alert_threshold ? 'text-amber-600 font-bold' : 'text-charcoal'}`}>
                                                            {item.current_stock}
                                                        </span>
                                                        {item.current_stock <= item.alert_threshold && (
                                                            <span className="text-[8px] uppercase text-amber-500 font-black tracking-widest mt-0.5">Below Threshold</span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleAdjustStock(item.id, -1, 'consumed')}
                                                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                                                            title="Log Consumption (-1)"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => setRestockingItem(item)}
                                                            className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 flex items-center gap-1.5 hover:bg-emerald-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                                                            title="Restock Asset"
                                                        >
                                                            <Plus size={12} /> Restock
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full bg-charcoal/5 text-charcoal/50 text-[10px] font-bold uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 text-charcoal/20 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Activity Logs & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-charcoal rounded-2xl p-7 text-white relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <h3 className="font-serif text-lg text-gold mb-1">Audit Trail</h3>
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-6">Live Operations Ledger</p>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <p className="text-xs text-white/20 italic text-center py-4">No recent activity logged.</p>
                                ) : logs.map((log, i) => (
                                    <div key={log.id} className="flex gap-3 relative">
                                        {i !== logs.length - 1 && <div className="absolute left-1.5 top-5 bottom-0 w-px bg-white/10" />}
                                        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 z-10 border-2 border-charcoal ${log.type === 'restocked' ? 'bg-emerald-400' :
                                            log.type === 'consumed' ? 'bg-rose-400' : 'bg-gold'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-white/90">
                                                {log.change_amount > 0 ? '+' : ''}{log.change_amount} {(log as any).inventory_items?.name}
                                            </p>
                                            <div className="flex justify-between items-center mt-0.5">
                                                <p className="text-[10px] text-white/30 uppercase tracking-tighter capitalize">{log.type}</p>
                                                <p className="text-[10px] text-white/30">{format(new Date(log.created_at), 'MMM d, h:mm a')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setShowIntelligence(true)}
                                className="w-full mt-8 py-3.5 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase tracking-[0.2em] font-black text-gold hover:bg-white/10 transition-all shadow-lg"
                            >
                                Storage Value Assessment
                            </button>
                        </div>
                    </div>

                    {/* Low Stock Highlight Card */}
                    {lowStockItems.length > 0 && (
                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-7 text-white shadow-lg overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <AlertTriangle size={80} />
                            </div>
                            <h4 className="font-serif text-xl mb-1 italic">Shortage Alert</h4>
                            <p className="text-sm opacity-80 mb-4">{lowStockItems.length} items require immediate attention.</p>
                            <div className="space-y-2">
                                {lowStockItems.slice(0, 3).map(item => (
                                    <div key={item.id} className="flex justify-between text-xs bg-black/10 p-2.5 rounded-xl border border-white/5">
                                        <span className="font-medium">{item.name}</span>
                                        <span className="font-bold">{item.current_stock} {item.unit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Layer */}
            {isAddingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsAddingItem(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-charcoal p-8 text-white">
                            <h3 className="font-serif text-2xl text-gold">Enroll New Asset</h3>
                            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Logistics Onboarding</p>
                        </div>
                        <form onSubmit={handleAddItem} className="p-8 space-y-5">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Asset Identity</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                    placeholder="e.g. Lavender Massage Oil (1L)"
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Classification</label>
                                    <select
                                        className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                        value={isCustomCategory ? 'custom' : newItem.category}
                                        onChange={e => setIsCustomCategory(e.target.value === 'custom')}
                                    >
                                        <option value="supplies">Oils & Creams</option>
                                        <option value="linens">Linens & Towels</option>
                                        <option value="essentials">Essentials</option>
                                        <option value="medical">Medical/First Aid</option>
                                        <option value="custom">+ New Category...</option>
                                    </select>
                                    {isCustomCategory && (
                                        <input
                                            type="text"
                                            required
                                            className="w-full mt-2 bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold animate-in fade-in slide-in-from-top-1 transition-all"
                                            placeholder="Segment Name"
                                            value={customCategory}
                                            onChange={e => setCustomCategory(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Metrics Unit</label>
                                    <input
                                        type="text"
                                        className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                        placeholder="pcs, bottles, kg..."
                                        value={newItem.unit}
                                        onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Opening Stock</label>
                                    <input
                                        type="number"
                                        className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                        value={newItem.current_stock}
                                        onChange={e => setNewItem({ ...newItem, current_stock: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Alert Buffer</label>
                                    <input
                                        type="number"
                                        className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                        value={newItem.alert_threshold}
                                        onChange={e => setNewItem({ ...newItem, alert_threshold: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsAddingItem(false)} className="flex-1 px-4 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors">Discard</button>
                                <button type="submit" className="flex-1 bg-charcoal text-white px-4 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-charcoal/10">Register Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {restockingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setRestockingItem(null)} />
                    <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-emerald-600 p-8 text-white">
                            <h3 className="font-serif text-2xl">Restock Operation</h3>
                            <p className="text-xs text-white/70 mt-1 uppercase tracking-widest font-bold">{restockingItem.name}</p>
                        </div>
                        <form onSubmit={handleRestockSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Quantity ({restockingItem.unit})</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                        placeholder="0"
                                        value={restockForm.quantity}
                                        onChange={e => setRestockForm({ ...restockForm, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Total Logistics Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/30 text-xs font-bold">₱</span>
                                        <input
                                            type="number"
                                            className="w-full bg-cream/30 border border-gold/10 rounded-2xl pl-8 pr-5 py-3.5 text-sm focus:outline-none focus:border-gold transition-all"
                                            placeholder="0.00"
                                            value={restockForm.cost}
                                            onChange={e => setRestockForm({ ...restockForm, cost: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-[8px] text-emerald-600 mt-2 uppercase font-black tracking-tighter">Adds to supply expenses automatically</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Shipment Notes</label>
                                <textarea
                                    className="w-full bg-cream/30 border border-gold/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-gold h-24 resize-none transition-all"
                                    placeholder="Supplier name or delivery batch ID..."
                                    value={restockForm.notes}
                                    onChange={e => setRestockForm({ ...restockForm, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setRestockingItem(null)} className="flex-1 px-4 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors">Abort</button>
                                <button type="submit" className="flex-1 bg-emerald-600 text-white px-4 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100">Apply Logistics</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showIntelligence && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/80 backdrop-blur-md" onClick={() => setShowIntelligence(false)} />
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-charcoal p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Package size={120} />
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-serif text-3xl text-gold mb-2">Storage Value Assessment</h3>
                                <p className="text-xs text-white/40 uppercase tracking-[0.2em] font-black">Financial Assets & Inventory Worth</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="bg-cream/30 border border-gold/10 p-6 rounded-2xl flex justify-between items-center shadow-inner">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black mb-1">Total On-Hand Value</p>
                                    <h4 className="text-4xl font-serif text-charcoal">₱{totalStorageValue.toLocaleString()}</h4>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black mb-1">Items Tracked</p>
                                    <h4 className="text-xl font-serif text-charcoal">{items.filter(i => (i.unit_price || 0) > 0).length} valued assets</h4>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h5 className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black mb-4 flex items-center gap-2">
                                        <div className="w-1 h-3 bg-gold rounded-full" />
                                        Value by Category
                                    </h5>
                                    <div className="space-y-4">
                                        {Object.entries(valueByCategory)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([cat, val]) => (
                                                <div key={cat} className="flex flex-col gap-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="capitalize font-bold text-charcoal/60">{cat}</span>
                                                        <span className="font-serif text-charcoal">₱{val.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gold transition-all duration-1000"
                                                            style={{ width: `${totalStorageValue > 0 ? (val / totalStorageValue) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-[10px] uppercase tracking-widest text-charcoal/40 font-black mb-4 flex items-center gap-2">
                                        <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                                        Highest Value Assets
                                    </h5>
                                    <div className="space-y-3">
                                        {items
                                            .map(item => ({ ...item, totalValue: item.current_stock * (item.unit_price || 0) }))
                                            .sort((a, b) => b.totalValue - a.totalValue)
                                            .slice(0, 5)
                                            .map(item => (
                                                <div key={item.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-cream/50 transition-colors border border-transparent hover:border-gold/10">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-charcoal truncate">{item.name}</p>
                                                        <p className="text-[9px] text-charcoal/30 uppercase tracking-tighter">{item.current_stock} {item.unit} x ₱{item.unit_price?.toLocaleString()}</p>
                                                    </div>
                                                    <p className="text-sm font-serif text-charcoal ml-3">₱{item.totalValue.toLocaleString()}</p>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowIntelligence(false)}
                                className="w-full py-4 bg-charcoal text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all shadow-xl shadow-charcoal/20"
                            >
                                Dismiss Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryTab;
