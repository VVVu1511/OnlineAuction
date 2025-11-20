import express from 'express'
import bcrypt from 'bcryptjs'
import * as accountService from '../services/account.service.js'
import { isAuth } from '../../../app/middlewares/auth.mdw.js'

const router = express.Router();

router.post('/register', async (req,res) => {
    try{
        const hashPassword = bcrypt.hashSync(req.body.password, 10);
    
        const user = {
            id: 0,
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
    
        await accountService.add(user);

        res.status(201).json({message: 'User registered successfully'});
    }

    catch(error){
        console.error(error);

        res.status(500).json({ message: "Error registering user", error: error.message});
    }
    
})

export default router;