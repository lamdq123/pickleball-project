export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';

    if (typeof date === 'string') {
        const datePart = date.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return String(date);

    return [
        String(parsedDate.getDate()).padStart(2, '0'),
        String(parsedDate.getMonth() + 1).padStart(2, '0'),
        parsedDate.getFullYear(),
    ].join('-');
}
