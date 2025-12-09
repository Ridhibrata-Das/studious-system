"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface LanguageContextType {
    currentLanguage: string | null;
    setLanguage: (lang: string) => void;
    isModalOpen: boolean;
    setModalOpen: (open: boolean) => void;
    isVideoModalOpen: boolean;
    setVideoModalOpen: (open: boolean) => void;
    isUserTypeModalOpen: boolean;
    setUserTypeModalOpen: (open: boolean) => void;
    userType: 'farmer' | 'business' | 'researcher' | null;
    setUserType: (type: 'farmer' | 'business' | 'researcher' | null) => void;
}

const LanguageContext = createContext<LanguageContextType>({
    currentLanguage: null,
    setLanguage: () => { },
    isModalOpen: false,
    setModalOpen: () => { },
    isVideoModalOpen: false,
    setVideoModalOpen: () => { },
    isUserTypeModalOpen: false,
    setUserTypeModalOpen: () => { },
    userType: null,
    setUserType: () => { },
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isVideoModalOpen, setVideoModalOpen] = useState(false);
    const [isUserTypeModalOpen, setUserTypeModalOpen] = useState(false);
    const [userType, setUserType] = useState<'farmer' | 'business' | 'researcher' | null>(null);

    useEffect(() => {
        // Check local storage
        const saved = localStorage.getItem("preferredLanguage");
        if (saved) {
            setCurrentLanguage(saved);
        }

        // Always open the modal automatically as requested
        setModalOpen(true);
    }, []);

    const setLanguage = (lang: string) => {
        setCurrentLanguage(lang);
        localStorage.setItem("preferredLanguage", lang);
    };

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            setLanguage,
            isModalOpen,
            setModalOpen,
            isVideoModalOpen,
            setVideoModalOpen,
            isUserTypeModalOpen,
            setUserTypeModalOpen,
            userType,
            setUserType
        }}>
            {children}
        </LanguageContext.Provider>
    );
}
