import express from 'express';
import {createClient} from '@supabase/supabase-js';
import accountRouter from '../Backend/routes/account.route.js'
import productRouter from '../Backend/routes/product.route.js'
import cors from 'cors'

const app = express();
const PORT = 3000;

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.use('/account', accountRouter);
app.use('/product', productRouter);

app.listen(PORT, function(){
    console.log(`Server is running on http://localhost:${PORT}`);
});
