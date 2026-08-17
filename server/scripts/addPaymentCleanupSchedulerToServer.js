import fs from "fs";

const file = "server/server.js";

let content = fs.readFileSync(file, "utf8");


// Add import
const oldImport =
`import { syncTourLifecycle } from "./services/tourLifecycleService.js";`;

const newImport =
`import { syncTourLifecycle } from "./services/tourLifecycleService.js";
import { startPaymentCleanupScheduler } from "./services/paymentCleanupScheduler.js";`;


if (
  !content.includes(
    'import { startPaymentCleanupScheduler } from "./services/paymentCleanupScheduler.js";'
  )
) {

  if (content.includes(oldImport)) {

    content = content.replace(
      oldImport,
      newImport
    );

    console.log("Added scheduler import.");

  } else {

    console.log("Tour lifecycle import not found.");

  }

} else {

  console.log("Scheduler import already exists.");

}


// Add scheduler startup

const oldStartup =
`await connectDatabase();

await syncTourLifecycle().catch((error) => {`;


const newStartup =
`await connectDatabase();


startPaymentCleanupScheduler();


await syncTourLifecycle().catch((error) => {`;


if (
  !content.includes(
    "startPaymentCleanupScheduler();"
  )
) {

  if (content.includes(oldStartup)) {

    content = content.replace(
      oldStartup,
      newStartup
    );

    console.log("Added scheduler startup.");

  } else {

    console.log("Database startup block not found.");

  }

} else {

  console.log("Scheduler startup already exists.");

}


fs.writeFileSync(
  file,
  content
);


console.log(
  "Payment cleanup scheduler patch completed."
);
