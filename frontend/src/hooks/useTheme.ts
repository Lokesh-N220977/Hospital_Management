import { useState, useEffect } from 'react';
import authService from '../services/auth.service';

export type Theme = 'light' | 'dark';

/**
 * Returns the localStorage key for the CURRENT logged-in user's theme.
 * Format: "theme-<userId>"  (falls back to "theme-guest" if no user found)
 *
 * This guarantees that each account's preference is stored independently:
 * doctorA dark -> doctorB light -> patientX dark  all coexist, never collide.
 */
function getUserThemeKey(): string {
    const user = authService.getStoredUser();
    const uid = user?.id || 'guest';
    return `theme-${uid}`;
}

export const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>(() => {
        const key = getUserThemeKey();
        return (localStorage.getItem(key) as Theme) || 'light';
    });

    useEffect(() => {
        const handleStorage = () => {
            const key = getUserThemeKey();
            const current = (localStorage.getItem(key) as Theme) || 'light';
            setThemeState(current);
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('theme-change', handleStorage); // same-tab sync

        // IMPORTANT: We do NOT touch document.documentElement.
        // The `.dark` class is applied per portal layout wrapper only,
        // so public pages, login, and other portals are never affected.

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('theme-change', handleStorage);
        };
    }, []);

    const setTheme = (newTheme: Theme) => {
        const key = getUserThemeKey();
        localStorage.setItem(key, newTheme);
        setThemeState(newTheme);
        window.dispatchEvent(new Event('theme-change'));
    };

    return { theme, setTheme };
};
