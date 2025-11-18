import express from 'express';
import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv'

const app = express();
const port = 5000;

app.get('/', (req,res) => {
    res.send('Hello World');
})

app.listen(port, () => {
    console.log("example");
})


