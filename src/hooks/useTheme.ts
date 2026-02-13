import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleTheme, setTheme } from '../store/slices/themeSlice';

export const useTheme = () => {
    const dispatch = useAppDispatch();
    const { mode } = useAppSelector((state) => state.theme);

    const toggle = () => {
        dispatch(toggleTheme());
    };

    const setMode = (newMode: 'light' | 'dark') => {
        dispatch(setTheme(newMode));
    };

    return {
        mode,
        isDark: mode === 'dark',
        isLight: mode === 'light',
        toggle,
        setMode,
    };
};
