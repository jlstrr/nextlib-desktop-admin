// const API_ENDPOINT = 'https://api.nextlib-system.online/api/v1/';
const LOCAL_API_ENDPOINT = 'http://localhost:4000/api/v1/';

export async function getAllComputers() {
    const response = await fetch(`${LOCAL_API_ENDPOINT}computers`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch computers');
    }
    return response.json();
}