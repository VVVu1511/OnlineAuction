function ResultModal({ success, title, message, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-[420px] space-y-4">
                <h2
                    className={`text-lg font-semibold ${
                        success ? "text-green-600" : "text-red-600"
                    }`}
                >
                    {title}
                </h2>

                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message}
                </p>

                <div className="flex justify-end pt-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResultModal;
