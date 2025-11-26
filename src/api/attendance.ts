// const API_ENDPOINT = 'https://api.nextlib-system.online/api/v1/';
const LOCAL_API_ENDPOINT = 'http://localhost:4000/api/v1/';

interface AttendanceFilters {
    page?: number;
    limit?: number;
    search?: string;
    date_from?: string;
    date_to?: string;
}

export async function getAllAttendanceRecords(filters: AttendanceFilters = {}) {
    const { page = 1, limit = 10, search, date_from, date_to } = filters;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (search) {
        params.append('search', search);
    }
    if (date_from) {
        params.append('date_from', date_from);
    }
    if (date_to) {
        params.append('date_to', date_to);
    }
    
    const response = await fetch(`${LOCAL_API_ENDPOINT}attendance-logs?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch attendance records');
    }
    return response.json();
}