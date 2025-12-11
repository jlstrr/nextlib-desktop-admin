const API_ENDPOINT = 'http://localhost:4000/api/v1/';

export async function getCurrentAcademicYear() {
    const response = await fetch(`${API_ENDPOINT}system-config/current`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch current academic year');
    }
    return response.json();
}

export async function getAcademicYears() {
    const response = await fetch(`${API_ENDPOINT}system-config`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(json.message || 'Failed to fetch academic years');
    }
    const data = json?.data;
    const configs = Array.isArray(data?.configs)
        ? data.configs
        : Array.isArray(data)
          ? data
          : (data ? [data] : []);
    const pagination = data?.pagination;
    return { ...json, data: configs, pagination };
}

export async function createAcademicYear(payload: {
    school_year: string;
    notes?: string;
    make_active?: boolean;
    first_semester_start: string;
    first_semester_end: string;
    second_semester_start: string;
    second_semester_end: string;
    summer_start: string;
    summer_end: string;
}) {
    const response = await fetch(`${API_ENDPOINT}system-config`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create academic year');
    }
    return response.json();
}

export async function updateAcademicYear(id: string, payload: {
    school_year?: string;
    notes?: string;
    make_active?: boolean;
    first_semester_start?: string;
    first_semester_end?: string;
    second_semester_start?: string;
    second_semester_end?: string;
    summer_start?: string;
    summer_end?: string;
}) {
    const response = await fetch(`${API_ENDPOINT}system-config/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update academic year');
    }
    return response.json();
}

export async function setActiveAcademicYear(id: string) {
    const response = await fetch(`${API_ENDPOINT}system-config/${id}/activate`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to set active academic year');
    }
    return response.json();
}
