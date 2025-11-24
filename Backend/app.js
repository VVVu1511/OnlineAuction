import express from 'express';
import {createClient} from '@supabase/supabase-js';
import accountRouter from '../Backend/routes/account.route.js'
import productRouter from '../Backend/routes/product.route.js'
import categoryRouter from '../Backend/routes/category.route.js'
import cors from 'cors'
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/account', accountRouter);
app.use('/product', productRouter);
app.use('/category',categoryRouter);

app.listen(PORT, function(){
    console.log(`Server is running on http://localhost:${PORT}`);
});
