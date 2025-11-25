// const API_ENDPOINT = 'https://api.nextlib-system.online/api/v1/';
const LOCAL_API_ENDPOINT = 'http://localhost:4000/api/v1/';

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
    const url = `${LOCAL_API_ENDPOINT}users${queryString ? `?${queryString}` : ''}`;
    
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