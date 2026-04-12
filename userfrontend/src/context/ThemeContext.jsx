import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Default to false for "Avenger Mode" (Start in Normal Mode)
    const [isAvengerMode, setIsAvengerMode] = useState(false);

    // Transition State for global wipe effect
    const [transitionState, setTransitionState] = useState({
        active: false,
        mode: 'dark'
    });

    const toggleTheme = () => {
        const nextMode = !isAvengerMode;
        // 1. Start cover animation
        setTransitionState({ active: true, mode: nextMode ? 'dark' : 'light' });

        // 2. Wait for cover to fill screen, then switch actual theme
        setTimeout(() => {
            setIsAvengerMode(nextMode);
        }, 600);

        // 3. Reset after animation completes
        setTimeout(() => {
            setTransitionState(prev => ({ ...prev, active: false }));
        }, 1200);
    };

    const theme = isAvengerMode ? {
        bg: "bg-slate-900",
        text: "text-slate-100",
        textSec: "text-slate-400",
        cardBg: "bg-slate-800",
        border: "border-slate-700",
        accent: "text-red-500", // Avengers Red
        headerBg: "bg-slate-900/90",
        searchBg: "bg-slate-800",
        inputColor: "text-white",
        filterActive: "bg-red-600 text-white shadow-lg shadow-red-500/30",
        filterInactive: "bg-slate-800 text-slate-400 hover:text-slate-200",
        navBg: "bg-slate-900/95 border-t border-slate-800"
    } : {
        bg: "bg-gray-50",
        text: "text-gray-900",
        textSec: "text-gray-500",
        cardBg: "bg-white",
        border: "border-gray-100",
        accent: "text-orange-500",
        headerBg: "bg-white/95",
        searchBg: "bg-gray-100",
        inputColor: "text-gray-800",
        filterActive: "bg-orange-500 text-white shadow-md",
        filterInactive: "bg-white text-gray-500 hover:text-gray-700",
        navBg: "bg-white border-t border-gray-100"
    };

    return (
        <ThemeContext.Provider value={{ isAvengerMode, toggleTheme, theme, transitionState }}>
            {children}
        </ThemeContext.Provider>
    );
};
