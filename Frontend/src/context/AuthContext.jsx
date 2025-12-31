// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    // Load user từ sessionStorage khi refresh trang
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        sessionStorage.setItem("user", JSON.stringify(userData));
        setUser(userData); 
    };

    const logout = () => {
        sessionStorage.removeItem("user");
        setUser(null);
    };

    const updateUser = (userData) => {
        sessionStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
