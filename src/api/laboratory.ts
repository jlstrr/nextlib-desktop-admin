const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

export async function getAllLaboratories() {
    const response = await fetch(`${API_ENDPOINT}laboratories`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch laboratories');
    }
    return response.json();
}

export async function createLaboratory(laboratoryData: any) {
    const response = await fetch(`${API_ENDPOINT}laboratories`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(laboratoryData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create laboratory');
    }
    return response.json();
}

export async function updateLaboratory(laboratoryId: string, laboratoryData: any) {
    const response = await fetch(`${API_ENDPOINT}laboratories/${laboratoryId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(laboratoryData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update laboratory');
    }
    return response.json();
}

export async function deleteLaboratory(laboratoryId: string) {
    const response = await fetch(`${API_ENDPOINT}laboratories/${laboratoryId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete laboratory');
    }
    return response.json();
}

export async function updateLaboratoryStatus(laboratoryId: string, statusData: any) {
    const response = await fetch(`${API_ENDPOINT}laboratories/${laboratoryId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(statusData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update laboratory status');
    }
    return response.json();
}
