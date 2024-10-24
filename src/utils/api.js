const API_URL = process.env.NEXT_PUBLIC_API_URL;
const GRAPHQL_URL = `${API_URL}/graphql`;

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

export async function delete_friend(friendName) {
    return apiRequest(`friends/delete/${friendName}`, 'DELETE');
}

export async function accept_friend(friendId) {
    return apiRequest(`friends/accept/${friendId}`, 'PUT');
}

export async function load_chats(receiverName, lastReadMsgId = null, direction = null, pageSize = 30) {
    return apiRequest(`chat/history`, 'POST', { receiverName, lastReadMsgId, direction, pageSize });
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

export async function delete_user(password) {
    return apiRequest('users/delete/delete-user', 'PATCH', { password })
}

export async function read_chat(msgId, receiverName) {
    return apiRequest('chat/messages/read', 'PATCH', { msgId, receiverName })
}

export async function graphqlRequest(query, variables = {}) {
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            query,
            variables
        })
    };

    const response = await fetch(GRAPHQL_URL, options);

    if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
            throw new Error('Unauthorized');
        }
        throw new Error(error.message || '영 좋지 않아요.');
    }

    const data = await response.json();

    if (data.errors) {
        throw new Error(data.errors[0].message);
    }

    return data.data;
}

export async function friends_recommand(userId) {
    const query = `
        query GetFriendRecommendations($userId: ID!) {
            getFriendRecommendations(userId: $userId) {
                name
                iconColor
                mutualFriends
            }
        }
    `;

    return graphqlRequest(query, { userId });
}