import dotenv from "dotenv";

dotenv.config({
  path: "./server/.env"
});

const run = async () => {

  try {

    const {
      default: connectDatabase
    } = await import("../config/database.js");


    const {
      generateTravelAdvice
    } = await import("../services/aiService.js");


    console.log("STEP 1: Connecting database...");
    await connectDatabase();
    console.log("STEP 2: Database connected");


    console.log("STEP 3: Calling AI service...");

    const response =
      await generateTravelAdvice(
        "Recommend a 5 day Kenya safari tour for a couple with a budget of 1000 dollars."
      );


    console.log("\n================ AI RESPONSE ================\n");

    console.log("STEP 4: AI returned");
    console.log(response);

    console.log("\n==============================================\n");


    process.exit(0);


  } catch(error){

    console.error(error);

    process.exit(1);

  }

};


run();
