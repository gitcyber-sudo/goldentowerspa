import React from 'react';
import { Check } from 'lucide-react';

export interface SelectionOption {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    price?: number | string;
    duration?: string | number;
}

interface SelectionGridProps {
    options: SelectionOption[];
    selectedId: string;
    onSelect: (id: string) => void;
    label: string;
}

const SelectionGrid: React.FC<SelectionGridProps> = ({ options, selectedId, onSelect, label }) => {
    return (
        <div className="space-y-3">
            <label className="block text-xs uppercase tracking-widest font-bold text-gold">{label}</label>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              relative p-4 rounded-xl border transition-all cursor-pointer group flex gap-4 items-center
              ${selectedId === option.id
                                ? 'bg-gold/10 border-gold shadow-md'
                                : 'bg-white border-gold/10 hover:border-gold/40 hover:bg-gold/5'
                            }
            `}
                    >
                        {option.imageUrl && !option.title.toUpperCase().includes('PACKAGE') && (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 border border-gold/10">
                                <img src={option.imageUrl} alt={option.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className={`flex-1 min-w-0 ${!option.imageUrl || option.title.toUpperCase().includes('PACKAGE') ? 'py-1' : ''}`}>
                            <div className="flex justify-between items-start capitalize">
                                <h4 className={`font-serif text-base font-bold ${selectedId === option.id ? 'text-charcoal' : 'text-charcoal/80'}`}>
                                    {option.title.toLowerCase()}
                                </h4>
                                {selectedId === option.id && <Check size={18} className="text-gold flex-shrink-0 ml-2" />}
                            </div>

                            {option.subtitle && <p className="text-xs text-gold font-semibold mt-0.5">{option.subtitle}</p>}

                            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-charcoal/50 font-bold uppercase tracking-widest">
                                {option.duration && <span>{option.duration}</span>}
                                {option.price && (
                                    <>
                                        <span className="text-gold/40">•</span>
                                        <span className="text-charcoal/70">₱{option.price}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectionGrid;
