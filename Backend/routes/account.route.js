import express from 'express'
import bcrypt from 'bcryptjs'
import * as accountService from '../services/account.service.js'

const router = express.Router();

router.post('/login', async(req,res) => {
    try{
        const password = await accountService.getPasswordByUsername(req.body.username);

        const valid = bcrypt.compareSync(req.body.password, password);

        if(!valid){
            throw err;
        }

        res.status(201).json({message: 'Login successfully'});
    }
    catch(err){
        console.error(err);

        res.status(500).json({ message: "Error log in", error: err.message});
    }
})

router.post('/register', async (req,res) => {
    try{
        const captcha = req.body.captcha;

        const googleVerifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${captcha}`;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const response = await fetch(googleVerifyURL, { method: "POST" });
        const data = await response.json();
        
        if (!data.success) {
            return res.status(400).json({ message: "CAPTCHA failed!" });
        }

        const hashPassword = bcrypt.hashSync(req.body.password, 10);
    
        const user = {
            id: 10,
            username: req.body.fullName,
            password: hashPassword,
            address: req.body.address,
            email: req.body.email,
            score: 10 
        }

        const allEmail = await accountService.findAllEmail();
        
        if(allEmail.includes(user.email)){
            throw new Error("Email already exists");
        }
    
        const result = await accountService.add(user);

        res.status(201).json({data: result,message: 'User registered successfully'});
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

router.post("/verify-otp", async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: "Missing data" });

    const valid = await accountService.verifyOtp(userId, otp);
    if (valid) {
        return res.json({ success: true, message: "OTP verified" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

export default router;