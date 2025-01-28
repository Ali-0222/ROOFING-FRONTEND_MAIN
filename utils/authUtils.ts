export const setToken = (token: string, email: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
};

export const getToken = () => {
    return localStorage.getItem("token");
};

export const getEmail = () => {
    return localStorage.getItem("email");
};

export const removeToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
};

export const isAuthenticated = () => {
    return !!getToken();
};

// Decode JWT token (if JWT is being used)
export const decodeJwt = (token: string) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (error) {
        return null;
    }
};

// Get the role from the token (assuming role is part of the token payload)
export const getUserRole = (): string => {
    const token = getToken();
    if (!token) return ''; // If no token, return an empty string

    // If the token is the fixed admin token, return 'admin'
    if (token === 'r8u5q2iCwK1zM8tXp7bF6#jH!QY3o4NcA9lPzV#h9RktL2Dk') {
        return 'admin';
    }

    // Decode JWT token and extract the role (if applicable)
    const decodedToken = decodeJwt(token);
    return decodedToken?.role || ''; // Return the role (e.g., 'admin' or 'user')
};

// Get the user's email from local storage
export const getUserEmail = (): string => {
    return getEmail() || '';
};
