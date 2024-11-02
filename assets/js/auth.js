const auth = {
    isAuthenticated: () => {
        const token = localStorage.getItem('jwt');
        if (!token) return false;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                localStorage.removeItem('jwt');
                return false;
            }
            return true;
        } catch (e) {
            localStorage.removeItem('jwt');
            return false;
        }
    },

    requireAuth: () => {
        if (!auth.isAuthenticated()) {
            window.location.href = '/login.html';
            return false;
        }
        return true;
    },

    logout: () => {
        localStorage.removeItem('jwt');
        window.location.href = '/login.html';
    },

    getToken: () => localStorage.getItem('jwt')
};

// Add this to protected pages
document.addEventListener('DOMContentLoaded', () => {
    auth.requireAuth();
});