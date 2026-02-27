import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicToggleProps {
    isMuted: boolean;
    isPlaying: boolean;
    onToggle: () => void;
}

/**
 * Floating music toggle button — bottom-left corner.
 * Glassmorphism style with a subtle pulse glow when music is playing.
 */
const MusicToggle: React.FC<MusicToggleProps> = ({ isMuted, isPlaying, onToggle }) => {
    return (
        <button
            onClick={onToggle}
            className={`
        music-toggle
        fixed bottom-6 left-6 z-[90]
        w-12 h-12 rounded-full
        flex items-center justify-center
        transition-all duration-300 ease-out
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-gold/50
        ${!isMuted && isPlaying ? 'music-toggle--playing' : ''}
      `}
            aria-label={isMuted ? 'Unmute background music' : 'Mute background music'}
            title={isMuted ? 'Play ambient music' : 'Mute ambient music'}
        >
            {isMuted ? (
                <VolumeX className="w-5 h-5 text-gold/70" />
            ) : (
                <Volume2 className="w-5 h-5 text-gold" />
            )}
        </button>
    );
};

export default MusicToggle;
