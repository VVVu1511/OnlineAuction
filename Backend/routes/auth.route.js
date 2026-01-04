import express from 'express'
import passport from "../config/passport.js";
import * as accountService from "../services/account.service.js"

const router = express.Router();

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: "http://localhost:5173/login",
        session: true,   // 🔴 BẮT BUỘC
    }),
    (req, res) => {
        console.log(req.user);
        res.redirect("http://localhost:5173/oauth-success");
    }
);
router.get('/me', async (req, res) => {
    try {
        if (!req.isAuthenticated() || !req.user?.email) {
            return res.status(401).json(null);
        }

        const user = await accountService.getAllByEmail(req.user.email);
        if (!user) return res.status(404).json(null);

        const role = await accountService.getRoleDescription(user.role);

        const {
            id,
            email,
            full_name,
            address,
            request_sell,
            request_expire,
        } = user;

        res.json({
            id,
            email,
            full_name,
            address,
            role,            // string: "seller" | "bidder"
            request_sell,
            request_expire,
        });
    } catch (err) {
        console.error("GET /auth/me error:", err);
        res.status(500).json(null);
    }
});

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