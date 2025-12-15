const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/v1/`;

/**
 * Subject Scheduler resource returned by the API.
 */
export interface SubjectSchedule {
    _id: string;
    subjectName: string;
    instructorName: string;
    date: string;
    timeslot: string;
    isRepeat: boolean;
    repeatInterval?: string;
    repeatEndDate?: string;
    subjectCode: string;
}

/**
 * Payload for creating/updating a Subject Schedule.
 * - subjectCode: required, A–Z, 0–9, dash, 2–12 chars, unique
 */
export interface SubjectSchedulePayload {
    subjectName: string;
    instructorName: string;
    date: string;
    timeslot: string;
    isRepeat: boolean;
    repeatInterval?: string;
    repeatEndDate?: string;
    subjectCode: string;
}

export async function getSubjectSchedules() {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        throw new Error('Failed to fetch subject schedules');
    }
    return response.json() as Promise<SubjectSchedule[]>;
}

export async function createSubjectSchedule(payload: SubjectSchedulePayload) {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create subject schedule');
    }
    return response.json() as Promise<SubjectSchedule>;
}

export async function deleteSubjectSchedule(id: string) {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subject schedule');
    }
    return response.json() as Promise<{ success: boolean }>;
}

export async function updateSubjectSchedule(id: string, payload: SubjectSchedulePayload) {
    const response = await fetch(`${API_ENDPOINT}subject-scheduler/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for session identification
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update subject schedule');
    }
    return response.json() as Promise<SubjectSchedule>;
}
