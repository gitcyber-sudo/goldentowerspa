
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

/**
 * Formats a number as Philippine Peso (₱).
 * @param amount - The numeric value to format
 * @returns Formatted string, e.g., "₱1,250.00"
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};
/**
 * Enforces Philippine phone number formatting (09XXXXXXXXX)
 * - Always starts with 09
 * - Max 11 digits
 * - Strips non-digits
 */
export const formatPhoneNumber = (value: string): string => {
    // Strip everything but digits
    const digits = value.replace(/\D/g, '');

    // If empty or just starting, return 09
    if (!digits || digits.length <= 2) return '09';

    // Ensure it starts with 09 (if they tried to type something else after 09)
    let formatted = digits;
    if (!formatted.startsWith('09')) {
        formatted = '09' + formatted;
    }

    // Limit to 11 digits
    return formatted.slice(0, 11);
};

/**
 * Validates a Philippine phone number
 * @param isOptional - If true, treats "09" or empty as valid
 * @returns error message or null if valid
 */
export const validatePhoneNumber = (phone: string, isOptional: boolean = false): string | null => {
    if (!phone || phone.length === 0 || (isOptional && phone === '09')) return null;
    if (!isOptional && phone === '09') return 'Phone number is required';
    if (!phone.startsWith('09')) return 'Must start with 09';
    if (phone.length < 11) return 'Incomplete number';
    if (phone.length > 11) return 'Invalid number';
    return null;
};
