import fs from "fs";

const file = "services/paymentLifecycleService.js";

let content = fs.readFileSync(file, "utf8");


const oldBlock = `
      if (
        bookingDoc.status !== "completed" &&
        bookingDoc.status !== "cancelled" &&
        bookingDoc.status !== "refunded"
      ) {
        bookingDoc.status =
          "failed";
      }
`;


const newBlock = `
      if (
        bookingDoc.status !== "completed" &&
        bookingDoc.status !== "refunded"
      ) {

        bookingDoc.status =
          "failed";

      }


      /*
      |--------------------------------------------------------------------------
      | KEEP CANCELLED PAYMENTS CONSISTENT
      |--------------------------------------------------------------------------
      */

      if (
        bookingDoc.status === "cancelled"
      ) {

        bookingDoc.paymentStatus =
          "cancelled";

      }
`;


if (!content.includes(oldBlock)) {
  console.log("Old block not found. File may already be patched.");
  process.exit(0);
}


content = content.replace(
  oldBlock,
  newBlock
);


fs.writeFileSync(
  file,
  content
);


console.log(
  "Payment lifecycle rules patched successfully."
);
