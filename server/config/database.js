import mongoose from "mongoose";
import env from "./env.js";


const connectDatabase = async () => {

  try {

    const connection =
      await mongoose.connect(
        env.MONGODB_URI
      );


    console.log(
      `MongoDB Connected: ${connection.connection.host}`
    );


  } catch(error){

    console.error(
      "MongoDB Connection Failed:",
      error.message
    );


    process.exit(1);
  }

};


export default connectDatabase;