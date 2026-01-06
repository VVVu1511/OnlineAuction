import cron from 'node-cron';
import * as productService from '../services/product.service.js';
import * as orderService from '../services/order.service.js';
import { emailEndBid } from "../services/contact.service.js";

export function startAuctionCron() {
    cron.schedule('* * * * * *', async () => {
        const products = await productService.getEndedAuctionsNotHandled();

        for (const product of products) {
            // 1. End bid
            await productService.productEndBid(product.id);

            // 2. Nếu có winner thì tạo order
            if (product.best_bidder) {
                await orderService.createOrder({
                    product_id: product.id,
                    seller_id: product.seller,
                    winner_id: product.best_bidder
                });
            }

            // 3. Gửi email
            await emailEndBid(
                product.best_bidder,
                product.seller,
                product.id
            );

            console.log('Handled product:', product.id);
        }
    });
}
