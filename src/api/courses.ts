const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

export async function getCourses() {
    const response = await fetch(`${API_ENDPOINT}courses`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        throw new Error('Failed to fetch courses');
    }
    return response.json();
}

export async function createCourse(courseData: any) {
    const response = await fetch(`${API_ENDPOINT}courses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(courseData),
    });
    if (!response.ok) {
        throw new Error('Failed to create course');
    }
    return response.json();
}

export async function updateCourse(courseId: string, courseData: any) {
    const response = await fetch(`${API_ENDPOINT}courses/${courseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(courseData),
    });
    if (!response.ok) {
        throw new Error('Failed to update course');
    }
    return response.json();
}

export async function deleteCourse(courseId: string) {
    const response = await fetch(`${API_ENDPOINT}courses/${courseId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        throw new Error('Failed to delete course');
    }
    return response.json();
}
