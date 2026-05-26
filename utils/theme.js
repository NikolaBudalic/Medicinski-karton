export const getTheme = (mode) => {
    const isDark = mode === "dark";

    return {
        mode,

        background: isDark ? "#0f172a" : "#f8fafc",
        card: isDark ? "#1e293b" : "#ffffff",
        cardSoft: isDark ? "#172554" : "#eef2ff",

        primary: isDark ? "#8b5cf6" : "#6d5dfc",
        primaryDark: isDark ? "#6d28d9" : "#4f46e5",

        secondary: isDark ? "#f59e0b" : "#f97316",
        success: isDark ? "#22c55e" : "#16a34a",
        danger: isDark ? "#ef4444" : "#dc2626",

        text: isDark ? "#f8fafc" : "#111827",
        subtext: isDark ? "#cbd5e1" : "#64748b",

        border: isDark ? "#334155" : "#e5e7eb",
        inputBackground: isDark ? "#111827" : "#ffffff",

        badge: isDark ? "#312e81" : "#ede9fe",
        badgeText: isDark ? "#ddd6fe" : "#4f46e5",

        orangeCard: isDark ? "#431407" : "#fff7ed",
        purpleCard: isDark ? "#312e81" : "#eef2ff",
    };
};