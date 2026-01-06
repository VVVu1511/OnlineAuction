import cron from 'node-cron';
import * as productService from '../services/product.service.js';
import { emailEndBid } from "../services/contact.service.js";

export function startAuctionCron() {
    cron.schedule('* * * * * *', async () => { // ⏱ mỗi giây
        console.log('[CRON] Checking ended auctions...');

        const products = await productService.getEndedAuctionsNotHandled();

        for (const product of products) {
            // ❗ RẤT QUAN TRỌNG: đánh dấu đã xử lý TRƯỚC
            // await productService.finishAuction(product.id);

            await emailEndBid(
                product.best_bidder,
                product.seller,
                product.id
            );
        }
    });
}
