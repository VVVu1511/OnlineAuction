import express from 'express'
import bcrypt from 'bcryptjs'
import * as accountService from '../services/account.service.js'
import { isAuth } from '../../../app/middlewares/auth.mdw.js'

const router = express.Router();

router.post('/register', function(req,res) {
    console.log('hi');

    const hashPassword = bcrypt.hashSync(req.body.password, 10);

    const user = {
        id: 0,
        username: req.body.fullName,
        password: hashPassword,
        address: req.body.address,
        email: req.body.email,
        score: 10 
    }

    console.log(user);

    accountService.add(user);
})

export default router;