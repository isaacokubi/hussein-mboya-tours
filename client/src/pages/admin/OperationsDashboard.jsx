import HospitalityOperations from "./HospitalityOperations";

// The production operations workspace now combines the existing tour-delivery
// operations surface with hotel PMS, occupancy, transfer dispatch and payment
// reconciliation capabilities exposed by the hospitality operations APIs.
export default function OperationsDashboard() {
  return <HospitalityOperations />;
}
