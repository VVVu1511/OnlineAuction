import db from "../utils/db.js"

export function add(user){
    return db('USER').insert(user);
}

