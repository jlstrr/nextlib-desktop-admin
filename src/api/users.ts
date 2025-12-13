const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

interface GetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getAllUsers(params: GetAllUsersParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    
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
