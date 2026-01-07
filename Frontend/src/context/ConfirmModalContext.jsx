import { createContext, useContext, useState } from "react";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal.jsx"

const ConfirmModalContext = createContext();

export const ConfirmModalProvider = ({ children }) => {
    const [state, setState] = useState({
        open: false,
        title: "Confirm",
        message: "",
        onConfirm: null
    });

    const showConfirm = ({ title = "Confirm", message, onConfirm }) => {
        setState({
            open: true,
            title,
            message,
            onConfirm
        });
    };

    const close = () => {
        setState({ open: false, title: "", message: "", onConfirm: null });
    };

    const handleConfirm = () => {
        if (state.onConfirm) state.onConfirm();
        close();
    };

    return (
        <ConfirmModalContext.Provider value={{ showConfirm }}>
            {children}
            {state.open && (
                <ConfirmModal
                    title={state.title}
                    message={state.message}
                    onCancel={close}
                    onConfirm={handleConfirm}
                />
            )}
        </ConfirmModalContext.Provider>
    );
};

export const useConfirmModal = () => useContext(ConfirmModalContext);