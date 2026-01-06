import express from 'express'
import bcrypt from 'bcryptjs'
import * as accountService from '../services/account.service.js'
import * as contactService from '../services/contact.service.js'
import { verifyCaptcha } from "../utils/verifyCaptcha.js";

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const user = await accountService.getAllByEmail(req.body.email);

        if (!user || !user.password) {
            return res.status(400).json({
                success: false,
                message: "Wrong email or password",
                data: null
            });
        }

        const valid = bcrypt.compareSync(req.body.password, user.password);
        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Wrong email or password",
                data: null
            });
        }

        const payload = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            address: user.address,
            role: user.role,
            score: user.score
        };

        const roleDesc = await accountService.getRoleDescription(payload.role);
        payload.role = roleDesc.description;

        res.status(200).json({
            success: true,
            message: "Login successfully",
            data: payload,
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            data: err.message
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { captcha } = req.body;

        // 1. Check captcha
        const isHuman = await verifyCaptcha(captcha);
        if (!isHuman) {
            return res.status(400).json({
                success: false,
                message: "Captcha verification failed"
            });
        }

        // 2. Hash password
        const hashPassword = bcrypt.hashSync(req.body.password, 10);

        const user = {
            email: req.body.email,
            password: hashPassword,
            address: req.body.address,
            full_name: req.body.fullName,
            role: req.body.role
        };

        // 3. Check email duplicate
        const emails = await accountService.findAllEmail();
        if (emails.includes(user.email)) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // 4. Insert user
        const userId = await accountService.add(user);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { userId }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Register failed",
            data: err.message
        });
    }
});

//update password
router.put('/change-password/:id', async (req, res) => {
    try {
        const user_id = parseInt(req.params.id);
        const { old_password, new_password } = req.body;

        const storedPassword = await accountService.getPasswordById(user_id);
        const valid = bcrypt.compareSync(old_password, storedPassword);

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Old password incorrect",
                data: null
            });
        }

        const affected = await accountService.updatePassword({ user_id, new_password });

        res.json({
            success: true,
            message: "Password updated successfully",
            data: affected
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Change password failed",
            data: err.message
        });
    }
});

//update profile
router.put('/profile/:id', async (req, res) => {
    try {
        const user_id = parseInt(req.params.id);
        const { full_name, address } = req.body;

        let updated = 0;

        if (address) updated += await accountService.updateAddress({ user_id, address });
        if (full_name) updated += await accountService.updateFullName({ user_id, full_name });

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: updated
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Update profile failed",
            data: err.message
        });
    }
});

router.post("/send-otp", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await accountService.sendOtp(email, otp);

        res.json({ success: true, message: "OTP sent successfully" });
    
    } catch (error) {
        console.error("Send OTP failed:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP"});
    }
});

router.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Missing data" });

    const valid = accountService.verifyOtp(email, otp);
    if (valid.success) {
        return res.json({ success: true, message: "OTP verified" });
    } else {
        return res.status(400).json({ success: false, message: valid.message });
    }
});

router.get('/rating/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const rating = await accountService.getRating(userId);

        res.json({
            success: true,
            message: 'Get rating OK!',
            data: rating
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error getting rating',
            data: null
        });
    }
});

router.get('/ratingScore/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const data = await accountService.getRatingPercent(userId);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});


router.get('/profile/:id', async (req,res) => {
    const id = parseInt(req.params.id);
    const data =  await accountService.getProfileById(id);

    res.status(201).json({ message: 'Get profile', data: data});
})

router.get('/win/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const winProducts = await accountService.getWinProducts(userId);

        res.json({
            success: true,
            message: 'Get win products OK!',
            data: winProducts
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error getting win products',
            data: null
        });
    }
});


// router.delete('/watchlist/:id', async (req, res) => {
//     try {
//         const user_id = parseInt(req.params.id);
//         const { productId } = req.body;

//         const deleted = await accountService.delWatchList(user_id, productId);

//         res.json({
//             success: true,
//             message: "Removed from watchlist",
//             data: deleted
//         });

//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: "Delete watchlist failed",
//             data: err.message
//         });
//     }
// });

// router.post('/watchlist/:id', async (req, res) => {
//     try {
//         const user_id = parseInt(req.params.id);
//         const { productId } = req.body;

//         const id = await accountService.addWatchList(user_id, productId);

//         res.status(201).json({
//             success: true,
//             message: "Added to watchlist",
//             data: { watchlistId: id }
//         });

//     } catch (err) {
//         res.status(500).json({
//             success: false,
//             message: "Add watchlist failed",
//             data: err.message
//         });
//     }
// });


router.get('/watchlist/:id', async (req, res) => {
    try {
        const data = await accountService.getWatchList(parseInt(req.params.id));

        res.json({
            success: true,
            message: "Get watchlist successfully",
            data
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Get watchlist failed",
            data: err.message
        });
    }
});

router.put('/requestSell/:id', async (req, res) => {
    try {
        const result = await accountService.requestSell(parseInt(req.params.id));

        res.json({
            success: result.success,
            message: result.message,
            data: null
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            data: null
        });
    }
});

router.put('/approve/:id', async (req, res) => {
    const result = await accountService.confirmRequestSell(+req.params.id, true);

    res.json({
        success: result.success,
        message: "Approved request",
        data: result
    });
});


router.put('/deny/:id', async (req, res) => {
    try {
        await accountService.confirmRequestSell(parseInt(req.params.id), false);

        res.json({ success: true, message: "Denied user request!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const result = await accountService.delById(+req.params.id);

    if (!result.success) {
        return res.status(404).json(result);
    }

    res.json({
        success: true,
        message: "User deleted successfully",
        data: null
    });
});

router.get('/all', async(req,res) => {
    try {
        const data = await accountService.getAllUsers();

        res.status(200).json({
            success: true,
            message: 'Get all users successfully!',
            data: data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
})

router.put("/reset-password", async (req, res) => {
    try {
        const { email, new_password } = req.body;

        const hashed = bcrypt.hashSync(new_password, 10);

        await accountService.resetPassword(email, hashed);
        await contactService.emailResetPassword(email, new_password);

        res.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Reset password failed",
            error: err.message,
        });
    }
});

/* ADD USER */
router.post("/add", async (req, res) => {
    try {
        const user = await accountService.addUser(req.body);

        res.status(201).json({
            success: true,
            message: "User added successfully",
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: "Add user failed",
            data: null
        });
    }
});

/* UPDATE USER */
router.put("/update/:id", async (req, res) => {
    try {
        const user = await accountService.updateUserById(req.params.id, req.body);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found or no fields updated",
                data: null
            });
        }

        res.json({
            success: true,
            message: "User updated successfully",
            data: user
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: "Update user failed",
            data: null
        });
    }
});

/* GET WATCHLIST STATE */
router.get("/watchlist/:user_id/:product_id", async (req, res) => {
    try {
        const { user_id, product_id } = req.params;

        const liked = await accountService.getState(
            user_id,
            product_id
        );

        res.json({
            success: true,
            message: "Get watchlist state successfully",
            data: { liked }
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: "Get watchlist state failed",
            data: null
        });
    }
});

/* ADD WATCHLIST */
router.post("/watchlist/add", async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        if (user_id == null || product_id == null) {
            return res.status(400).json({
                success: false,
                message: "Missing user_id or product_id"
            });
        }

        const result = await accountService.addWatchList(
            user_id,
            product_id
        );

        res.json({
            success: true,
            message: "Added to watchlist",
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: "Add watchlist failed",
            data: null
        });
    }
});

/* REMOVE WATCHLIST */
router.delete("/watchlist/remove", async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const result = await accountService.removeWatchList(
            user_id,
            product_id
        );

        res.json({
            success: true,
            message: "Removed from watchlist",
            data: result
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({
            success: false,
            message: "Remove watchlist failed",
            data: null
        });
    }
});

// account.route.js
router.get("/requestSell/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const state = await accountService.getRequestSellState(userId);

        if (!state) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        res.json({
            success: true,
            message: "Get request sell state successfully",
            data: state
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Get request sell state failed",
            data: null
        });
    }
});


export default router;