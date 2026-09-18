
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
 * Returns the current calendar date in Philippine Standard Time (UTC+8).
 * This is the single source of truth for all analytics — business day is simply
 * the calendar day in Philippine time (midnight to 11:59 PM PHT).
 * The 4PM-4AM display on the homepage is for display only and does NOT affect analytics.
 * @param date - The UTC date/timestamp to convert
 * @returns YYYY-MM-DD string representing the Philippine calendar date
 */
export const getBusinessDate = (date: Date): string => {
    // Convert to Philippine Standard Time (UTC+8) by adding 8 hours
    const phtOffset = 8 * 60 * 60 * 1000;
    const phtDate = new Date(date.getTime() + phtOffset);
    // Return ISO date string in YYYY-MM-DD (always based on PHT midnight)
    return phtDate.toISOString().split('T')[0];
};

/**
 * Returns today's Philippine Standard Time date string (YYYY-MM-DD).
 * Convenience wrapper around getBusinessDate(new Date()).
 */
export const getPHTDateString = (date: Date = new Date()): string => {
    return getBusinessDate(date);
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

/**
 * Formats duration in minutes to a human-readable string.
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "1 hour and 30 minutes")
 */
export const formatDuration = (minutes: number): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    const hourLabel = hours === 1 ? 'hour' : 'hours';
    const minuteLabel = remainingMinutes === 1 ? 'minute' : 'minutes';

    if (remainingMinutes === 0) {
        return `${hours} ${hourLabel}`;
    }

    return `${hours} ${hourLabel} and ${remainingMinutes} ${minuteLabel}`;
};
