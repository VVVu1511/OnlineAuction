import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const tmpDir = "static/tmp";
        fs.mkdirSync(tmpDir, { recursive: true });
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB / ảnh (khuyên dùng)
    }
});

