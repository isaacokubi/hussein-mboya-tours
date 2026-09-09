# Batch 2 — Operations, Customer Experience & Compliance

## Application implementation completed

- Existing customer self-service, booking, notification, document, review, CRM, cancellation/refund and policy workflows retained.
- Existing guide, driver, vehicle, tour-assignment and resource-conflict workflows retained.
- Existing agent booking, customer, quote, package and commission workflows retained.
- Existing compliance centre and privacy-request workflows retained.
- Added a tenant-scoped Field & Guest Service Desk covering airport transfers, accommodation requests, rooming lists, travel documents, insurance requests, trip manifests, incidents/emergencies, scheduling/staffing, cancellations and special services.
- Added live status, priority, due-date and assignment workflow for service requests.
- Added tenant-scoped accommodation room inventory with room-type capacity, availability and nightly rates.
- Added live frontend panels for the service desk and accommodation inventory inside Operations & Procurement.
- Added tenant-safe APIs, validation and index reconciliation for the new operational records.
- Corporate/group booking fields, purchase-order enforcement, rooming-list references and corporate credit exposure remain integrated with booking workflows.

## External or operational prerequisites

- Actual airport, hotel, airline, insurance and other supplier integrations still require the tenant's authorized provider accounts/contracts.
- Insurance claims and regulatory documentation require real provider/legal workflows; the application records and tracks the operational request.
- TRA/ODPC registrations, licences and legal policy approvals remain external obligations.

## Principle

The system provides the workflow, records, frontend actions, tenant isolation and audit-friendly operational state. It does not fabricate third-party confirmations, regulatory registrations or supplier credentials.
