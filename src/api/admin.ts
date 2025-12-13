const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

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

export async function getAllAdmins(params: { page?: number; limit?: number; isSuperAdmin?: boolean } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (typeof params.isSuperAdmin === 'boolean') queryParams.append('isSuperAdmin', String(params.isSuperAdmin));
    const queryString = queryParams.toString();
    const url = `${API_ENDPOINT}admin${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
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

export async function createAdmin(adminData: any) {
    const response = await fetch(`${API_ENDPOINT}admin/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(adminData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create admin');
    }
    return response.json();
}

export async function updateAdmin(adminId: string, adminData: any) {
    const response = await fetch(`${API_ENDPOINT}admin/${adminId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(adminData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update admin');
    }
    return response.json();
}

export async function deleteAdmin(adminId: string) {
    const response = await fetch(`${API_ENDPOINT}admin/${adminId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete admin');
    }
    return response.json();
}

export async function changePassword(passwordData: any) {
    const response = await fetch(`${API_ENDPOINT}admin/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(passwordData),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
    }
    return response.json();
}
