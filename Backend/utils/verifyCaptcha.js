import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

export async function verifyCaptcha(token) {
    const secretKey = process.env.RECAPTCHA_SECRET;

    const response = await axios.post(
        "https://www.google.com/recaptcha/api/siteverify",
        null,
        {
            params: {
                secret: secretKey,
                response: token
            }
        }
    );

    return response.data.success;
}
