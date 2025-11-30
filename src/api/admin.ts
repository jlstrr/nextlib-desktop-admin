const API_ENDPOINT = 'http://localhost:4000/api/v1/';

export async function adminLogin(username: string, password: string) {
    const response = await fetch(`${API_ENDPOINT}admin/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // This ensures cookies are saved
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
    }
    
    return response.json();
}

export async function adminLogout() {
    const response = await fetch(`${API_ENDPOINT}admin/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Logout failed');
    }
    return response.json();
}

export async function getAllAdmins() {
    const response = await fetch(`${API_ENDPOINT}admin`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch admins');
    }
    return response.json();
}

export async function getDashboardStats() {
    const response = await fetch(`${API_ENDPOINT}admin/dashboard`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch dashboard stats');
    }
    return response.json();
}

export async function getAdminProfile() {
    const response = await fetch(`${API_ENDPOINT}admin/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch profile');
    }
    return response.json();
}

export async function updateAdminProfile(profileData: any) {
    const response = await fetch(`${API_ENDPOINT}admin/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(profileData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update profile');
    }
    return response.json();
}