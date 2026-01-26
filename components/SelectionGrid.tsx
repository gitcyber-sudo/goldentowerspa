import React from 'react';
import { Check } from 'lucide-react';

export interface SelectionOption {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    price?: number | string;
    duration?: string;
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => onSelect(option.id)}
                        className={`
              relative p-3 rounded-xl border transition-all cursor-pointer group flex gap-3 items-center
              ${selectedId === option.id
                                ? 'bg-gold/10 border-gold shadow-md'
                                : 'bg-white border-gold/10 hover:border-gold/40 hover:bg-gold/5'
                            }
            `}
                    >
                        {option.imageUrl && (
                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 border border-gold/10">
                                <img src={option.imageUrl} alt={option.title} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className={`font-serif text-sm font-bold truncate ${selectedId === option.id ? 'text-charcoal' : 'text-charcoal/80'}`}>
                                    {option.title}
                                </h4>
                                {selectedId === option.id && <Check size={14} className="text-gold flex-shrink-0 ml-2" />}
                            </div>

                            {option.subtitle && <p className="text-xs text-gold font-medium mt-0.5 truncate">{option.subtitle}</p>}

                            <div className="flex items-center gap-2 mt-1 text-[10px] text-charcoal/50 font-medium uppercase tracking-wider">
                                {option.duration && <span>{option.duration}</span>}
                                {option.price && (
                                    <>
                                        <span>•</span>
                                        <span>₱{option.price}</span>
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
