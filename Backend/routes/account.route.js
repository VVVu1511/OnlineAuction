import express from 'express'
import bcrypt from 'bcryptjs'
import * as accountService from '../services/account.service.js'
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.js"; // adjust path

const router = express.Router();
// router.use(authMiddleware);

router.post('/login', async (req, res) => {
    try {
        const data = await accountService.getAllByEmail(req.body.email);

        if (!data || !data.password) {
            return res.status(400).json({ message: "Wrong username or password" , data: data});
        }

        const valid = bcrypt.compareSync(req.body.password, data.password);

        if (!valid) {
            return res.status(400).json({ message: "Wrong username or password" });
        }

        // Create JWT
        const payload = {
            id: data.id,
            address: data.address,
            score: data.score,
            role: data.role,
            full_name: data.full_name,
            email: req.body.email,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ 
            success: true,
            message: "Login successfully",
            token 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error log in", error: err.message });
    }
});

router.post('/register', async (req,res) => {
    try{
        const captcha = req.body.captcha;

        const googleVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`;

        const response = await fetch(googleVerifyURL, { method: "POST" });

        const data = await response.json();
        
        if (!data.success) {
            return res.status(400).json({ message: "CAPTCHA failed!" });
        }

        const hashPassword = bcrypt.hashSync(req.body.password, 10);
    
        const user = {
            password: hashPassword,
            address: req.body.address,
            email: req.body.email,
            score: 10,
            full_name: req.body.fullName
        }

        const allEmail = await accountService.findAllEmail();
        
        if(allEmail.includes(user.email)){
            throw new Error("Email already exists");
        }
    
        const result = await accountService.add(user);

        res.status(201).json({
            success: true,
            userId: result[0],     
            message: "User registered successfully. OTP sent."
        });

    }

    catch(error){
        res.status(500).json({ message: "Error registering user", error: error.message});
    }
    
})

router.put('/email', async(req,res) => {
    try{
        await accountService.updateEmail(req.body);
    }

    catch(error){
        res.status(500).json({ message: "Error updating email!", error: error.message});
    }
})

router.put('/full_name', async(req,res) => {
    try{
        await accountService.updateFullName(req.body);
    }

    catch(error){
        res.status(500).json({ message: "Error updating full name!", error: error.message});
    }
})

router.put('/password', async(req,res) => {
    try{
        const password = await accountService.getPasswordByUsername(req.body.user_id);

        const valid = bcrypt.compareSync(req.body.old_password, password);

        if(!valid){
            throw error;
        }
        
        await accountService.updatePassword(req.body);
    }

    catch(error){
        res.status(500).json({ message: "Error updating full name!", error: error.message});
    }
})

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

router.get('/rating', async(req,res) => {
    try {
        const userId = req.user.id;
        
        const rating = await accountService.getRating(userId);

        res.status(201).json({ message: 'Get rating OK!', data: rating });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error getting rating' });
    }
})

router.get('/profile', async (req,res) => {
    res.status(201).json({ message: 'Get profile', data: req.user});
})

router.get('/win', async(req,res) => {
    try {
        const userId = req.user.id;
        
        const winProducts = await accountService.getWinProducts(userId);

        res.status(201).json({ message: 'Get win products OK!', data: winProducts });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error getting win products' });
    }
})

router.delete('/watchlist', async function (req,res) {
    try {
        const userID = req.user.id;
         // decoded token set by middleware
        const productId = req.body.productId;

        if (!productId) return res.status(400).json({ message: "Missing product ID" });

        // Add to watchlist
        await accountService.delWatchList(userID, productId);

        res.status(201).json({ 
            success: true,
            message: 'Product added to watchlist successfully!',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting product of watchlist', 
            error: error.message,
        });
    }
})

router.post('/watchlist', async function (req, res) {
    try {
        const userID = req.user.id;
         // decoded token set by middleware
        const productId = req.body.productId;

        if (!productId) return res.status(400).json({ message: "Missing product ID" });

        // Add to watchlist
        await accountService.addWatchList(userID, productId);

        res.status(201).json({ 
            success: true,
            message: 'Product added to watchlist successfully!',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false,
            message: 'Error adding product to watchlist', 
            error: error.message,
        });
    }
});

router.get('/watchlist', async function (req,res)  {
    try{
        const id = req.user.id;

        const data = await accountService.getWatchList(id);
        
        res.status(201).json({data: data , message: 'Get watch list successfully!'});
    }
    catch(error){
        res.status(404).json({error: error.message, message: 'Error getting watch list'});
    }
})

router.put('/requestSell', async (req, res) => {
    try {
        const user_id = req.user.id;

        // Gọi service để request sell
        await accountService.requestSell(user_id);

        res.status(200).json({
            success: true,
            message: 'Yêu cầu nâng cấp Seller đã được gửi! Admin sẽ duyệt.'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});




export default router;