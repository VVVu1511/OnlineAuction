function VerifyOtp({ userId }) {
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch("http://localhost:3000/account/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, otp }),
        });
        const data = await res.json();
        setMessage(data.message);
        if (data.success) {
            alert("OTP verified! You can login now.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
            />
            <button type="submit">Verify OTP</button>
            {message && <p>{message}</p>}
        </form>
    );
}
