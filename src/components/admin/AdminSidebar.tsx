import React from 'react';
import { X, LayoutDashboard, ClipboardList, Users, UserSearch, Eye, TrendingUp, LogOut, AlertTriangle, Wallet, Package, Receipt, Tags, ChevronRight, ChevronDown } from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSignOut: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onSignOut }) => {
    const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(['Operations']));

    // Auto-expand category when active tab changes
    React.useEffect(() => {
        const categories: Record<string, string[]> = {
            'Operations': ['bookings', 'services', 'inventory', 'expenses'],
            'People Control': ['therapists', 'clients'],
            'System': ['website-analytics', 'errors']
        };

        for (const [catName, tabs] of Object.entries(categories)) {
            if (tabs.includes(activeTab)) {
                setExpandedCategories(prev => new Set(prev).add(catName));
                break;
            }
        }
    }, [activeTab]);

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) next.delete(category);
            else next.add(category);
            return next;
        });
    };

    const renderSidebarItem = (id: string, icon: React.ReactNode, label: string) => (
        <button
            onClick={() => { setActiveTab(id); setIsOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-gold/10 text-gold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    const renderCategory = (name: string, items: { id: string, icon: React.ReactNode, label: string }[]) => {
        const isExpanded = expandedCategories.has(name);
        const hasActiveChild = items.some(item => item.id === activeTab);

        return (
            <div className="space-y-1">
                <button
                    onClick={() => toggleCategory(name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-white/5 ${hasActiveChild ? 'text-gold/80' : 'text-white/30'}`}
                >
                    <span className="text-[10px] uppercase font-black tracking-[0.2em]">{name}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isExpanded && (
                    <div className="pl-2 space-y-1 border-l border-white/5 ml-4">
                        {items.map(item => (
                            <React.Fragment key={item.id}>
                                {renderSidebarItem(item.id, item.icon, item.label)}
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-charcoal text-white flex flex-col z-50 transform transition-transform duration-300 h-screen ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 lg:p-8 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-serif text-xl lg:text-2xl text-gold">Golden Tower</h2>
                    <button className="lg:hidden text-white/60" onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 lg:p-6 space-y-1 overflow-y-auto custom-scrollbar">
                    {/* Priority Section - Always Visible */}
                    <div className="pb-4 space-y-1">
                        {renderSidebarItem('dashboard', <LayoutDashboard />, 'Dashboard')}
                        {renderSidebarItem('revenue', <TrendingUp />, 'Revenue')}
                        {renderSidebarItem('commissions', <Wallet />, 'Commissions')}
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-4">
                        {renderCategory('Operations', [
                            { id: 'bookings', icon: <ClipboardList />, label: 'Bookings' },
                            { id: 'services', icon: <Tags />, label: 'Services & Pricing' },
                            { id: 'inventory', icon: <Package />, label: 'Inventory' },
                            { id: 'expenses', icon: <Receipt />, label: 'Expenses & Profit' }
                        ])}

                        {renderCategory('People Control', [
                            { id: 'therapists', icon: <Users />, label: 'Specialists' },
                            { id: 'clients', icon: <UserSearch />, label: 'Client Intelligence' }
                        ])}

                        {renderCategory('System', [
                            { id: 'website-analytics', icon: <Eye />, label: 'Website Visits' },
                            { id: 'errors', icon: <AlertTriangle />, label: 'Error Logs' }
                        ])}
                    </div>
                </nav>
                <div className="p-4 lg:p-6 border-t border-white/10">
                    <button onClick={onSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-white/5 rounded-xl transition-all">
                        <LogOut size={20} />Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
