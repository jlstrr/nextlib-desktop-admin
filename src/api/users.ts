const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

interface GetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    user_type?: string;
}

export async function getAllUsers(params: GetAllUsersParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.user_type && params.user_type !== 'all') queryParams.append('user_type', params.user_type);
    
    const queryString = queryParams.toString();
    const url = `${API_ENDPOINT}users${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch users');
    }
    return response.json();
}

export async function addUser(userData: any) {
    const response = await fetch(`${API_ENDPOINT}users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add user');
    }
    return response.json();
}

export async function updateUser(userId: string, userData: any) {
    const response = await fetch(`${API_ENDPOINT}users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to edit user');
    }
    return response.json();
}

export async function deleteUser(userId: string) {
    const response = await fetch(`${API_ENDPOINT}users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
    }
    return response.json();
}

export async function bulkUserImport(userData: any) {
    const token = localStorage.getItem('token');
    const controller = new AbortController();
    const timeoutMs = 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(`${API_ENDPOINT}users/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                'Accept': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData),
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            let errorMessage = 'Failed to import users';
            let details: any = {};
            try {
                details = await response.json();
                if (details?.message) errorMessage = details.message;
            } catch {}
            if (response.status === 401 || response.status === 403) {
                throw new Error(details?.message || 'Authentication failed');
            }
            if (response.status === 400) {
                throw new Error(details?.message || 'Invalid data format');
            }
            if (response.status === 429) {
                throw new Error(details?.message || 'Rate limit exceeded');
            }
            if (response.status >= 500) {
                throw new Error(details?.message || 'Server error');
            }
            throw new Error(errorMessage);
        }
        return response.json();
    } catch (err: any) {
        clearTimeout(timeoutId);
        if (err?.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw err instanceof Error ? err : new Error('Network error');
    }
}
