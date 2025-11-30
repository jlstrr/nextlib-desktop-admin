const API_ENDPOINT = 'http://localhost:4000/api/v1/';

interface AttendanceFilters {
    page?: number;
    limit?: number;
    search?: string;
    start_date?: string;
    end_date?: string;
}

export async function getAllAttendanceRecords(filters: AttendanceFilters = {}) {
    const { page = 1, limit = 10, search, start_date, end_date } = filters;
    
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (search) {
        params.append('search', search);
    }
    if (start_date) {
        params.append('start_date', start_date);
    }
    if (end_date) {
        params.append('end_date', end_date);
    }
    
    const response = await fetch(`${API_ENDPOINT}attendance-logs?${params.toString()}`, {
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