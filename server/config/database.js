import { connectFirestore } from "./firestore.js";
const connectDatabase = async () => { await connectFirestore(); console.log("Firebase Firestore connected"); };
export default connectDatabase;
