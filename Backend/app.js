import express from 'express';
import {createClient} from '@supabase/supabase-js';
import accountRouter from '../Backend/routes/account.route.js'

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);

app.use('/account', accountRouter);

app.listen(PORT, function(){
    console.log(`Server is running on http://localhost:${PORT}`);
});
