const API_ENDPOINT = 'https://api.nextlib-system.online/api/v1/';

export async function getSubjectSchedules() {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        throw new Error('Failed to fetch subject schedules');
    }
    return response.json();
}

export async function createSubjectSchedule(payload: any) {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject schedule');
    }
    return response.json();
}

export async function deleteSubjectSchedule(id: string) {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject schedule');
    }
    return response.json();
}

export async function updateSubjectSchedule(id: string, payload: any) {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subject schedule');
    }
    return response.json();
}