import { createContext, useContext, useEffect, useState } from "react";

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
    const [mode, setMode] = useState("dark");

    useEffect(() => {
        document.documentElement.dataset.theme = mode;
        localStorage.setItem("themeMode", mode);
        document
            .querySelector('meta[name="theme-color"]')
            ?.setAttribute("content", mode === "dark" ? "#171717" : "#f5f5fa");
    }, [mode]);

    const toggleMode = () => {
        setMode(currentMode => currentMode === "light" ? "dark" : "light");
    };

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </ThemeModeContext.Provider>
    );
}

export function useThemeMode() {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error("useThemeMode must be used within a ThemeModeProvider");
    }

    return context;
}
