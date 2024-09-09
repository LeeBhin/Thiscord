const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest(endpoint, method, body) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '영 좋지 않아요.');
    }

    return response.json();
}

export async function register(name, phoneOrEmail, password) {
    return apiRequest('users/register', 'POST', { name, phoneOrEmail, password });
}

export async function login(phoneOrEmail, password) {
    return apiRequest('users/login', 'POST', { phoneOrEmail, password });
}

export async function checkToken() {
    const response = await fetch(`${API_URL}/auth/check-token`, {
        method: 'GET',
        credentials: 'include',
    });

    if (response.status === 401) {
        throw new Error('Unauthorized');
    }
    return response.json();
}