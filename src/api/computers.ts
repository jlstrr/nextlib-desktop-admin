const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

export async function getAllComputers() {
    const response = await fetch(`${API_ENDPOINT}computers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch computers');
    }
    return response.json();
}

export async function createComputer(computerData: any) {
    const response = await fetch(`${API_ENDPOINT}computers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(computerData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create computer');
    }
    return response.json();
}

export async function updateComputer(computerId: string, computerData: any) {
    const response = await fetch(`${API_ENDPOINT}computers/${computerId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(computerData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update computer');
    }
    return response.json();
}

export async function deleteComputer(computerId: string) {
    const response = await fetch(`${API_ENDPOINT}computers/${computerId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete computer');
    }
    return response.json();
}

export async function updateComputerStatus(computerId: string, status: string) {
    const response = await fetch(`${API_ENDPOINT}computers/${computerId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update computer status');
    }
    return response.json();
}
