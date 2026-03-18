const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

interface ReservationFilters {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
    status?: string;
}

export async function getAllReservations(filters: ReservationFilters = {}) {
    const { page = 1, limit = 10, date_from, date_to, status } = filters;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (date_from) {
        params.append('date_from', date_from);
    }
    if (date_to) {
        params.append('date_to', date_to);
    }
    if (status && status !== 'all') {
        params.append('status', status);
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

export interface WalkInReservationRequest {
    reservation_type: 'computer' | 'laboratory';
    computer_id?: string;
    laboratory_id?: string;
    reservation_date?: string;
    start_time?: string;
    end_time?: string;
    duration?: number;
    purpose: string;
    notes?: string;
    user_id?: string;
    id_number?: string;
    guest?: {
        firstname: string;
        lastname: string;
        middle_initial?: string;
        email?: string;
    };
    activate_now?: boolean;
}

export async function walkInReservation(reservationData: WalkInReservationRequest) {
    const response = await fetch(`${API_ENDPOINT}reservations/walk-in`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(reservationData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to walk-in reservation');
    }
    return response.json();
}

export async function createReservation(reservationData: any) {
    const response = await fetch(`${API_ENDPOINT}reservations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(reservationData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create reservation');
    }
    return response.json();
}

export async function cancelAllReservations(payload?: { notes?: string }) {
    const response = await fetch(`${API_ENDPOINT}reservations/cancel-all`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: payload ? JSON.stringify(payload) : undefined,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to cancel all reservations');
    }
    return response.json();
}
