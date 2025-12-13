const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

interface ReservationFilters {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
}

export async function getAllReservations(filters: ReservationFilters = {}) {
    const { page = 1, limit = 10, date_from, date_to } = filters;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (date_from) {
        params.append('date_from', date_from);
    }
    if (date_to) {
        params.append('date_to', date_to);
    }
    
    const response = await fetch(`${API_ENDPOINT}reservations?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch reservations');
    }
    return response.json();
}

export async function approveReservation(reservationId: string) {
    const response = await fetch(`${API_ENDPOINT}reservations/${reservationId}/approve`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve reservation');
    }
    return response.json();
}

export async function rejectReservation(reservationId: string) {
    const response = await fetch(`${API_ENDPOINT}reservations/${reservationId}/cancel`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reject reservation');
    }
    return response.json();
}

export async function updateReservationStatus(reservationId: string, status: string) {
    const response = await fetch(`${API_ENDPOINT}reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update reservation status');
    }
    return response.json();
}
