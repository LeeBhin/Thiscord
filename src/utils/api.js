const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiRequest(endpoint, method, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}/${endpoint}`, options);

    if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
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

export function logout() {
    return apiRequest('users/logout', 'POST');
}

export async function checkToken() {
    return apiRequest('users/check-token', 'POST');
}

export async function load_friends() {
    return apiRequest('friends/list', 'GET');
}

export async function add_friend(friendId) {
    return apiRequest(`friends/request/${friendId}`, 'POST');
}

export async function pending_friends() {
    return apiRequest(`friends/pendinglist`, 'GET');
}

export async function delete_friend(friendId) {
    return apiRequest(`friends/delete/${friendId}`, 'DELETE');
}

export async function accept_friend(friendId) {
    return apiRequest(`friends/accept/${friendId}`, 'PUT');
}

export async function load_chats(receiverName) {
    return apiRequest(`chat/history/${receiverName}`, 'GET');
}

export async function load_chatrooms() {
    return apiRequest(`chat/chatrooms`, 'GET');
}

export async function delete_msg(senderId, msgId, receiverName) {
    return apiRequest(`chat/delete`, 'DELETE', { senderId, msgId, receiverName });
}

export async function edit_msg(senderId, msgId, receiverName, newMsg) {
    return apiRequest(`chat/edit`, 'PATCH', { senderId, msgId, receiverName, newMsg });
}

export async function update_name(newName) {
    return apiRequest('users/update-name', 'PATCH', { newName })
}

export async function my_info() {
    return apiRequest('users/myinfo', 'GET',)
}