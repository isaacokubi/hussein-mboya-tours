import { db } from "../config/firestore.js";
export async function withTransaction(work){return db.runTransaction(async transaction=>work(transaction));}
export default withTransaction;
