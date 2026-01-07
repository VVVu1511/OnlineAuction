export default function ConfirmModal({
    title,
    message,
    onCancel,
    onConfirm
}) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-[380px] p-6 shadow-lg">
                
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {title}
                </h3>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
