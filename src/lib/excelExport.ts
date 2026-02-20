import * as XLSX from 'xlsx';
import { formatTimeTo12h } from './utils';
import type { Booking } from '../types';

export const exportBookingsToExcel = (bookings: Booking[], filename = 'gt-spa-bookings') => {
    // 1. Prepare the data
    const data = bookings.map(b => ({
        'Reference ID': b.id,
        'Date': b.booking_date,
        'Time': formatTimeTo12h(b.booking_time),
        'Client Name': b.guest_name || b.user_email || 'Walk-in',
        'Client Phone': b.guest_phone || 'N/A',
        'Service': b.services?.title || 'Unknown',
        'Price (PHP)': b.services?.price || 0,
        'Specialist': b.therapists?.name || 'Any Available',
        'Status': b.status.toUpperCase()
    }));

    // 2. Create the workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    // 3. Format columns widths for better readability
    const wscols = [
        { wch: 36 }, // ID
        { wch: 12 }, // Date
        { wch: 10 }, // Time
        { wch: 20 }, // Name
        { wch: 15 }, // Phone
        { wch: 25 }, // Service
        { wch: 12 }, // Price
        { wch: 20 }, // Specialist
        { wch: 12 }, // Status
    ];
    worksheet['!cols'] = wscols;

    // 4. Export it
    XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};
