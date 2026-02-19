import React from 'react';
import { X, LayoutDashboard, ClipboardList, Users, UserSearch, Eye, TrendingUp, LogOut, AlertTriangle } from 'lucide-react';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onSignOut: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen, onSignOut }) => {
    const renderSidebarItem = (id: string, icon: React.ReactNode, label: string) => (
        <button
            onClick={() => { setActiveTab(id); setIsOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-gold/10 text-gold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
            {icon}{label}
        </button>
    );

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-charcoal text-white flex flex-col z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 lg:p-8 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-serif text-xl lg:text-2xl text-gold">Golden Tower</h2>
                    <button className="lg:hidden text-white/60" onClick={() => setIsOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 lg:p-6 space-y-2">
                    {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
                    {renderSidebarItem('bookings', <ClipboardList size={20} />, 'Bookings')}
                    {renderSidebarItem('therapists', <Users size={20} />, 'Specialists')}
                    {renderSidebarItem('clients', <UserSearch size={20} />, 'Client Intelligence')}
                    <div className="pt-4 pb-2">
                        <p className="text-xs uppercase text-white/30 font-bold tracking-widest px-4">Analytics</p>
                    </div>
                    {renderSidebarItem('website-analytics', <Eye size={20} />, 'Website Visits')}
                    {renderSidebarItem('revenue', <TrendingUp size={20} />, 'Revenue')}
                    {renderSidebarItem('errors', <AlertTriangle size={20} />, 'Error Logs')}
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
