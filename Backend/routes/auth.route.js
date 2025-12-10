import express from 'express'
import passport from "../config/passport.js";

const router = express.Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const user = req.user;

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Send token to main window using postMessage
        res.send(`
            <html>
            <body>
                <script>
                    window.opener.postMessage(
                        { token: "${token}", user: ${JSON.stringify(user)} },
                        "http://localhost:5173" // your React app URL
                    );
                    window.close();
                </script>
            </body>
            </html>
        `);
    }
);

// ---------- FACEBOOK LOGIN ----------
router.get('/facebook',
    passport.authenticate('facebook', { scope: [] })
);

router.get('/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
        const user = req.user;

        // đảm bảo email tồn tại
        const userData = {
            id: user.id,
            email: user.emails && user.emails[0] ? user.emails[0].value : null,
            name: user.displayName || "",
            role: user.role || 2, // default role nếu chưa có
            photo: user.photos && user.photos[0] ? user.photos[0].value : null
        };

        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.send(`
            <html>
            <body>
                <script>
                    window.opener.postMessage(
                        { token: "${token}", user: ${JSON.stringify(userData)} },
                        "http://localhost:5173"
                    );
                    window.close();
                </script>
            </body>
            </html>
        `);
    }
);

export default router;