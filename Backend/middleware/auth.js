// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import db from "../utils/db.js";   // ⚠ chỉnh đúng đường dẫn tới file knex instance

// dotenv.config();

// const authMiddleware = async (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader)
//         return res.status(401).json({ message: "Missing token" });

//     const token = authHeader.split(" ")[1];

//     try {
//         // Giải mã token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if (!decoded?.id) {
//             return res.status(401).json({ message: "Invalid token payload" });
//         }

//         //  Lấy user từ database + JOIN role
//         const user = await db("USER as u")
//             .leftJoin("ROLE as r", "u.role", "r.id")
//             .select(
//                 "u.id",
//                 "u.full_name",
//                 "u.email",
//                 "u.role",
//                 "r.description as role_description"
//             )
//             .where("u.id", decoded.id)
//             .first();

//         if (!user)
//             return res.status(401).json({ message: "User not found" });

//         // Gắn thông tin user đầy đủ vào request
//         req.user = user;

//         next();
//     } catch (err) {
//         return res.status(401).json({ message: "Invalid token" });
//     }
// };

// export default authMiddleware;
