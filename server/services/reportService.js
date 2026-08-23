import { mergeTenantFilter } from "../tenancy/context.js";
import { Parser } from "json2csv";

/*
|--------------------------------------------------------------------------
| GENERATE CSV
|--------------------------------------------------------------------------
|
| Converts an array of objects into CSV format.
|
*/

export const generateCSV = (
  data = [],
  options = {}
) => {
  if (!Array.isArray(data)) {
    throw new Error("Data must be an array.");
  }

  if (data.length === 0) {
    return "";
  }

  const parser = new Parser({
    fields: options.fields,
    delimiter: options.delimiter || ",",
    quote: options.quote || '"',
    header: options.header !== false,
    withBOM: options.withBOM || false,
    defaultValue: "",
  });

  return parser.parse(data);
};
