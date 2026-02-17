import React from 'react';
import { Menu, Search, RefreshCcw } from 'lucide-react';

interface AdminHeaderProps {
    title: string;
    setSidebarOpen: (isOpen: boolean) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    onRefresh: () => void;
    onManualBooking: () => void;
    showSearch?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
    title,
    setSidebarOpen,
    searchTerm,
    setSearchTerm,
    onRefresh,
    onManualBooking,
    showSearch = true
}) => {
    return (
        <header className="bg-white border-b border-gold/10 p-4 lg:p-6 sticky top-0 z-30">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden p-2 -ml-2 text-charcoal"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <h1 className="text-xl lg:text-2xl font-serif">{title}</h1>
                </div>
                <div className="flex items-center gap-2 lg:gap-3">
                    {showSearch && (
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-2 border rounded-xl w-40 lg:w-auto text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                    <button onClick={onRefresh} className="p-2 border rounded-xl hover:bg-gold/5 transition-colors" title="Refresh">
                        <RefreshCcw size={18} className="text-charcoal/60" />
                    </button>
                    <button onClick={onManualBooking} className="bg-gold text-white px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold flex items-center gap-1 lg:gap-2">
                        <span>Manual Booking</span>
                    </button>
                </div>
            </div>
            {/* Mobile Search */}
            {showSearch && (
                <div className="sm:hidden mt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            className="pl-9 pr-4 py-2 border rounded-xl w-full text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default AdminHeader;
