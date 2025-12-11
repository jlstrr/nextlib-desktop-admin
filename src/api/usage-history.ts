const API_ENDPOINT = 'http://localhost:4000/api/v1/';

export async function getAllUsageHistory() {
    const response = await fetch(`${API_ENDPOINT}usage-history`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch usage history');
    }
    return response.json();
}