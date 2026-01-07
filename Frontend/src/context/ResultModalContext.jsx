import { createContext, useContext, useState } from "react";
import ResultModal from "../components/ResultModal/ResultModal.jsx"

const ResultModalContext = createContext(null);

export function ResultModalProvider({ children }) {
    const [modal, setModal] = useState({
        open: false,
        success: true,
        title: "",
        message: ""
    });

    const showResult = ({ success = true, title, message }) => {
        setModal({
            open: true,
            success,
            title: title || (success ? "Thành công" : "Thất bại"),
            message
        });
    };

    const close = () => {
        setModal(prev => ({ ...prev, open: false }));
    };

    return (
        <ResultModalContext.Provider value={{ showResult }}>
            {children}

            {modal.open && (
                <ResultModal
                    {...modal}
                    onClose={close}
                />
            )}
        </ResultModalContext.Provider>
    );
}

export const useResultModal = () => {
    const ctx = useContext(ResultModalContext);
    
    if (!ctx) {
        throw new Error("useResultModal must be used inside ResultModalProvider");
    }
    return ctx;
};
