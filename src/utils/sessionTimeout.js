let timeout;

const startTimer = (store) => {
    const expireMinutes = parseInt(import.meta.env.VITE_JWT_EXPIRE_MINUTES || '60');

    timeout = setTimeout(() => {
        store.dispatch('auth/logout');
    }, expireMinutes * 60 * 1000);
};

const resetTimer = (store) => {
    clearTimeout(timeout);
    startTimer(store);
};

export const initSessionTimeout = (store) => {
    window.addEventListener('mousemove', () => resetTimer(store));
    window.addEventListener('keypress', () => resetTimer(store));
    startTimer(store);
};

export const clearSessionTimeout = () => {
    clearTimeout(timeout);
};