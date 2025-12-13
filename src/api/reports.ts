const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

export async function getReports(type: string, queryString: string) {
    const url = `${API_ENDPOINT}usage-history/reports/${type}${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        throw new Error('Failed to fetch reports');
    }
    return response.json();
}
