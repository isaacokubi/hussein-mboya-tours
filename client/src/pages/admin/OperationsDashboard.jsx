/**
 * Purpose: Operations Dashboard page-level UI component. Main declarations: OperationsDashboard.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import HospitalityOperations from "./HospitalityOperations";

// The production operations workspace now combines the existing tour-delivery
// operations surface with hotel PMS, occupancy, transfer dispatch and payment
// reconciliation capabilities exposed by the hospitality operations APIs.
// Define OperationsDashboard; its parameters and body implement this operation.
export default function OperationsDashboard() {
  // Return the expression shown below to the caller.
  return <HospitalityOperations />;
}
