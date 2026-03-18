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

export interface UpdateSystemDefaultPayload {
    default_allotted_time?: string;
    operation_hours?: string;
    updateToAllStudents?: boolean;
}

export async function updateSystemDefault(id: string, payload: UpdateSystemDefaultPayload) {
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

export async function createSystemDefault(payload: UpdateSystemDefaultPayload) {
    const response = await fetch(`${API_ENDPOINT}system-defaults`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create system default');
    }
    return response.json();
}
