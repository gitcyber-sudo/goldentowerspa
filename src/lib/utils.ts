
/**
 * Converts a 24-hour time string (HH:mm) to 12-hour format (h:mm AM/PM).
 * @param time24 - Example: "14:30"
 * @returns Example: "2:30 PM"
 */
export const formatTimeTo12h = (time24: string): string => {
    if (!time24) return '';
    try {
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours, 10);
        const m = minutes.substring(0, 2); // Ensure we only get mm even if seconds are present
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${h}:${m} ${ampm}`;
    } catch (e) {
        console.error('Error formatting time:', e);
        return time24;
    }
};
