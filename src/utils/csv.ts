export function convertToCSV(data: Record<string, any>[]) {
    if (data.length === 0 || !data[0]) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header =>
                JSON.stringify(row[header] ?? '')
            ).join(',')
        )
    ];

    return csvRows.join('\n');
}

export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 