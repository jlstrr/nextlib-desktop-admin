const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

export async function getSystemDefault() {
    const response = await fetch(`${API_ENDPOINT}system-defaults/current`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch system default');
    }
    return response.json();
}

export async function updateSystemDefault(id: string, payload: { default_allotted_time: string; updateToAllStudents?: boolean }) {
    const response = await fetch(`${API_ENDPOINT}system-defaults/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update system default');
    }
    return response.json();
}
