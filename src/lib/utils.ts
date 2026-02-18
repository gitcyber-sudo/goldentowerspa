
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
        return time24;
    }
};
/**
 * Determines the "Business Day" for a given timestamp.
 * A business day starts at 4:00 PM (16:00) and ends at 3:59 PM the next day.
 * Revenue items between 4:00 PM Feb 18 and 3:59 PM Feb 19 are assigned to "Feb 18".
 * @param date - The date to check
 * @returns YYYY-MM-DD string representing the business day
 */
export const getBusinessDate = (date: Date): string => {
    const d = new Date(date);
    const hour = d.getHours();

    // If it's before 4 PM, it belongs to the previous calendar day's business cycle
    if (hour < 16) {
        d.setDate(d.getDate() - 1);
    }

    // Return in YYYY-MM-DD format (can use en-CA for simple ISO date)
    return d.toLocaleDateString('en-CA');
};
