/**
 * Purpose: report Service business-logic service. Main declarations: generateCSV.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter } from "../tenancy/context.js";
// Load json2csv so this module can use its exported dependencies.
import { Parser } from "json2csv";

/*
|--------------------------------------------------------------------------
| GENERATE CSV
|--------------------------------------------------------------------------
|
| Converts an array of objects into CSV format.
|
*/

// Declare generateCSV for use by the surrounding module or function.
export const generateCSV = (
  data = [],
  options = {}
) => {
  // Check the condition (!Array.isArray(data)) and run the matching branch.
  if (!Array.isArray(data)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Data must be an array.");
  }

  // Check the condition (data.length === 0) and run the matching branch.
  if (data.length === 0) {
    // Return a configured text value to the caller.
    return "";
  }

  // Declare parser for use by the surrounding module or function.
  const parser = new Parser({
    fields: options.fields,
    delimiter: options.delimiter || ",",
    quote: options.quote || '"',
    header: options.header !== false,
    withBOM: options.withBOM || false,
    defaultValue: "",
  });

  // Return the result of parser.parse() to the caller.
  return parser.parse(data);
};
