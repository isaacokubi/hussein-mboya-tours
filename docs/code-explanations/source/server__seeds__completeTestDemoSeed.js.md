# Source explanation: server/seeds/completeTestDemoSeed.js

**Source:** [server/seeds/completeTestDemoSeed.js](../../../server/seeds/completeTestDemoSeed.js)

## Purpose

A seed/migration helper that creates or updates database records. Review safety gates and target database before executing.

## Imports and dependencies

-  from `dotenv/config`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `mongoose` from `mongoose`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `randomBytes` from `node:crypto`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fs` from `node:fs/promises`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `path` from `node:path`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `fileURLToPath` from `node:url`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Organization` from `../models/Organization.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Organization.js](../../../server/models/Organization.js)
- `Permission` from `../models/Permission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Permission.js](../../../server/models/Permission.js)
- `Role` from `../models/Role.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Role.js](../../../server/models/Role.js)
- `User` from `../models/User.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/User.js](../../../server/models/User.js)
- `Customer` from `../models/Customer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Customer.js](../../../server/models/Customer.js)
- `Staff` from `../models/Staff.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Staff.js](../../../server/models/Staff.js)
- `Agent` from `../models/Agent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Agent.js](../../../server/models/Agent.js)
- `Destination` from `../models/Destination.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Destination.js](../../../server/models/Destination.js)
- `Tour` from `../models/Tour.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Tour.js](../../../server/models/Tour.js)
- `TourPackage` from `../models/TourPackage.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourPackage.js](../../../server/models/TourPackage.js)
- `Booking` from `../models/Booking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Booking.js](../../../server/models/Booking.js)
- `Payment` from `../models/Payment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Payment.js](../../../server/models/Payment.js)
- `Invoice` from `../models/Invoice.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Invoice.js](../../../server/models/Invoice.js)
- `Supplier` from `../models/Supplier.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Supplier.js](../../../server/models/Supplier.js)
- `PurchaseOrder` from `../models/PurchaseOrder.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PurchaseOrder.js](../../../server/models/PurchaseOrder.js)
- `Expense` from `../models/Expense.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Expense.js](../../../server/models/Expense.js)
- `TourCost` from `../models/TourCost.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCost.js](../../../server/models/TourCost.js)
- `Commission` from `../models/Commission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Commission.js](../../../server/models/Commission.js)
- `Vehicle` from `../models/Vehicle.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Vehicle.js](../../../server/models/Vehicle.js)
- `Hotel` from `../models/Hotel.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Hotel.js](../../../server/models/Hotel.js)
- `HotelRoomType` from `../models/HotelRoomType.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelRoomType.js](../../../server/models/HotelRoomType.js)
- `HospitalityRatePlan` from `../models/HospitalityRatePlan.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRatePlan.js](../../../server/models/HospitalityRatePlan.js)
- `HotelBooking` from `../models/HotelBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HotelBooking.js](../../../server/models/HotelBooking.js)
- `AirportTransfer` from `../models/AirportTransfer.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransfer.js](../../../server/models/AirportTransfer.js)
- `AirportTransferBooking` from `../models/AirportTransferBooking.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AirportTransferBooking.js](../../../server/models/AirportTransferBooking.js)
- `Review` from `../models/Review.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Review.js](../../../server/models/Review.js)
- `Lead` from `../models/Lead.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Lead.js](../../../server/models/Lead.js)
- `CustomTourRequest` from `../models/CustomTourRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomTourRequest.js](../../../server/models/CustomTourRequest.js)
- `TravelServiceRequest` from `../models/TravelServiceRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TravelServiceRequest.js](../../../server/models/TravelServiceRequest.js)
- `ChartOfAccount` from `../models/ChartOfAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ChartOfAccount.js](../../../server/models/ChartOfAccount.js)
- `JournalEntry` from `../models/JournalEntry.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/JournalEntry.js](../../../server/models/JournalEntry.js)
- `AccountingPeriod` from `../models/AccountingPeriod.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingPeriod.js](../../../server/models/AccountingPeriod.js)
- `FinanceBudget` from `../models/FinanceBudget.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/FinanceBudget.js](../../../server/models/FinanceBudget.js)
- `TaxRule` from `../models/TaxRule.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxRule.js](../../../server/models/TaxRule.js)
- `TaxProfile` from `../models/TaxProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TaxProfile.js](../../../server/models/TaxProfile.js)
- `CorporateAccount` from `../models/CorporateAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CorporateAccount.js](../../../server/models/CorporateAccount.js)
- `ComplianceRecord` from `../models/ComplianceRecord.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ComplianceRecord.js](../../../server/models/ComplianceRecord.js)
- `PrivacyRequest` from `../models/PrivacyRequest.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PrivacyRequest.js](../../../server/models/PrivacyRequest.js)
- `Notification` from `../models/Notification.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Notification.js](../../../server/models/Notification.js)
- `CustomerProfile` from `../models/CustomerProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CustomerProfile.js](../../../server/models/CustomerProfile.js)
- `StaffProfile` from `../models/StaffProfile.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/StaffProfile.js](../../../server/models/StaffProfile.js)
- `UserPreference` from `../models/UserPreference.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/UserPreference.js](../../../server/models/UserPreference.js)
- `Coupon` from `../models/Coupon.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Coupon.js](../../../server/models/Coupon.js)
- `Promotion` from `../models/Promotion.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Promotion.js](../../../server/models/Promotion.js)
- `Campaign` from `../models/Campaign.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Campaign.js](../../../server/models/Campaign.js)
- `Loyalty` from `../models/Loyalty.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Loyalty.js](../../../server/models/Loyalty.js)
- `LoyaltyAccount` from `../models/LoyaltyAccount.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/LoyaltyAccount.js](../../../server/models/LoyaltyAccount.js)
- `Wishlist` from `../models/Wishlist.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Wishlist.js](../../../server/models/Wishlist.js)
- `Referral` from `../models/Referral.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Referral.js](../../../server/models/Referral.js)
- `Refund` from `../models/Refund.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Refund.js](../../../server/models/Refund.js)
- `CreditDebitNote` from `../models/CreditDebitNote.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/CreditDebitNote.js](../../../server/models/CreditDebitNote.js)
- `SupplierPayable` from `../models/SupplierPayable.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SupplierPayable.js](../../../server/models/SupplierPayable.js)
- `FixedAsset` from `../models/FixedAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/FixedAsset.js](../../../server/models/FixedAsset.js)
- `OperationalAsset` from `../models/OperationalAsset.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/OperationalAsset.js](../../../server/models/OperationalAsset.js)
- `AccommodationInventory` from `../models/AccommodationInventory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccommodationInventory.js](../../../server/models/AccommodationInventory.js)
- `HospitalityRoomBlock` from `../models/HospitalityRoomBlock.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityRoomBlock.js](../../../server/models/HospitalityRoomBlock.js)
- `HospitalityDeposit` from `../models/HospitalityDeposit.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalityDeposit.js](../../../server/models/HospitalityDeposit.js)
- `PaymentGatewayConfig` from `../models/PaymentGatewayConfig.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentGatewayConfig.js](../../../server/models/PaymentGatewayConfig.js)
- `EtimsSubmission` from `../models/EtimsSubmission.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/EtimsSubmission.js](../../../server/models/EtimsSubmission.js)
- `ApiKey` from `../models/ApiKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/ApiKey.js](../../../server/models/ApiKey.js)
- `WebsiteIntegrationKey` from `../models/WebsiteIntegrationKey.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationKey.js](../../../server/models/WebsiteIntegrationKey.js)
- `WebsiteIntegrationEvent` from `../models/WebsiteIntegrationEvent.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebsiteIntegrationEvent.js](../../../server/models/WebsiteIntegrationEvent.js)
- `Webhook` from `../models/Webhook.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Webhook.js](../../../server/models/Webhook.js)
- `WebhookDelivery` from `../models/WebhookDelivery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WebhookDelivery.js](../../../server/models/WebhookDelivery.js)
- `Subscription` from `../models/Subscription.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Subscription.js](../../../server/models/Subscription.js)
- `TourCategory` from `../models/TourCategory.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourCategory.js](../../../server/models/TourCategory.js)
- `Itinerary` from `../models/Itinerary.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Itinerary.js](../../../server/models/Itinerary.js)
- `Gallery` from `../models/Gallery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Gallery.js](../../../server/models/Gallery.js)
- `Media` from `../models/Media.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Media.js](../../../server/models/Media.js)
- `HospitalitySupplierContract` from `../models/HospitalitySupplierContract.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HospitalitySupplierContract.js](../../../server/models/HospitalitySupplierContract.js)
- `TourGallery` from `../models/TourGallery.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourGallery.js](../../../server/models/TourGallery.js)
- `TourReport` from `../models/TourReport.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/TourReport.js](../../../server/models/TourReport.js)
- `HeroSlide` from `../models/HeroSlide.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/HeroSlide.js](../../../server/models/HeroSlide.js)
- `Quotation` from `../models/Quotation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/Quotation.js](../../../server/models/Quotation.js)
- `PaymentLink` from `../models/PaymentLink.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/PaymentLink.js](../../../server/models/PaymentLink.js)
- `SubscriptionPayment` from `../models/SubscriptionPayment.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/SubscriptionPayment.js](../../../server/models/SubscriptionPayment.js)
- `WithholdingTax` from `../models/WithholdingTax.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/WithholdingTax.js](../../../server/models/WithholdingTax.js)
- `AccountingReconciliation` from `../models/AccountingReconciliation.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingReconciliation.js](../../../server/models/AccountingReconciliation.js)
- `AccountingSubledger` from `../models/AccountingSubledger.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/models/AccountingSubledger.js](../../../server/models/AccountingSubledger.js)
- `runWithTenant` from `../tenancy/context.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/tenancy/context.js](../../../server/tenancy/context.js)
- `assertSupportedMongoVersion` from `../utils/mongodbVersion.js`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [server/utils/mongodbVersion.js](../../../server/utils/mongodbVersion.js)

## Runtime declarations and data flow

### `getTestPassword` — lines 91–96

Parameters: none.
4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 92:** Sensitive-configuration/data operation; inspect source without copying secret values. — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 93:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 94:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 95:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `imageUrl` — lines 113–113

Parameters: `id`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `destinationImage` — lines 117–121

Parameters: `index`.
2 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 118:** `if (index < localDestinationImages.length) return localDestinationImages[index];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 119:** `if (index < localDestinationImages.length + 6) return imageUrl(unsplashAssetIds[23 + index - localDestinationImages.length]);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 120:** `return generatedDestinationImages[index - localDestinationImages.length - 6];` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `tourImage` — lines 122–122

Parameters: `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `loginEmail` — lines 125–129

Parameters: `local`, `prefix`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 126:** `if (local === "superadmin") return "superadmin1@husseinmboya.com";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 127:** `const roleAccount = { admin: "admin1", manager: "tourmanager1" }[local] || local;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 128:** `return \`${roleAccount}@${tenantDomain[prefix]}\`;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `roleForLoginEmail` — lines 131–141

Parameters: `email`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 132:** `if (email === TEST_LOGIN_EMAILS[0]) return "super_admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 133:** `const local = String(email).split("@")[0];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 134:** `if (local === "admin1") return "admin";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 135:** `if (local === "tourmanager1") return "tour_manager";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 136:** `if (local.startsWith("agent")) return "agent";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 137:** `if (local.startsWith("guide")) return "tour_guide";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 138:** `if (local.startsWith("driver")) return "driver";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 139:** `if (local.startsWith("customer")) return "customer";` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 140:** `return null;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `dates` — lines 142–142

Parameters: `days (defaulted)`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `stablePhone` — lines 143–143

Parameters: `tenantIndex`, `accountIndex`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `databaseTarget` — lines 145–151

Parameters: none.
Error control: try=true, catch=false, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 146:** `const raw = String(process.env.MONGODB_URI || "");` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 147:** `if (!raw) throw new Error("MONGODB_URI is missing.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 148:** `let parsed;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 149:** `try { parsed = new URL(raw); } catch { throw new Error("MONGODB_URI is not a valid MongoDB URL."); }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 150:** `return { dbName: decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] || ""), host: parsed.hostname.toLowerCase() };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `safeTarget` — lines 153–171

Parameters: `target (defaulted)`.
7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 154:** `if (String(process.env.NODE_ENV || "").toLowerCase() === "production") throw new Error("Refusing test seed because NODE_ENV=production.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 155:** `const { dbName, host } = target;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 156:** `const normalizedHost = String(host || "").toLowerCase();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 157:** `if (String(dbName || "").toLowerCase() === "husseindb") {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 158:** `throw new Error("Refusing comprehensive test seed against the application database husseindb.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 160:** `const explicitAtlasStagingSeed = process.env.ALLOW_ATLAS_DEMO_SEED === "YES"` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 163:** `if (!new Set(["127.0.0.1", "localhost", "[::1]", "::1"]).has(normalizedHost) && !explicitAtlasStagingSeed) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 164:** `throw new Error("Refusing test seed: MongoDB host must be loopback unless the explicit Atlas staging-seed opt-in targets global_tours_test.");` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 166:** `const configText = [process.env.NODE_ENV, process.env.PLATFORM_HOST, process.env.CLIENT_URL, process.env.CLIENT_ORIGINS, host, dbName].join(" ").toLowerCase();` — Reads runtime/build configuration; never expose secret values through logs or browser-bundled variables.
- **Line 167:** `if (!explicitAtlasStagingSeed && !/(^|[-_])(test|testing|demo|disposable|seed)([-_]|$)/.test(dbName)) throw new Error(\`Refusing seed: configured database name "${dbName || "(default)"}" is not explicitly test/demo/dispo` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 168:** `if (/prod|production|render\.com|vercel\.app|mongodb\+srv:.*prod/.test(configText)) throw new Error("Refusing test seed because production-looking configuration was detected.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 169:** `if ([process.env.ALLOW_GLOBAL_MPESA_FALLBACK, process.env.ALLOW_SINGLE_TENANT_DEV_FALLBACK].some((value) => String(value || "").trim().toLowerCase() === "true")) throw new Error("Refusing test seed while an unsafe M-Pesa` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 170:** `return { dbName, host };` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `assertSeedConfirmation` — lines 173–175

Parameters: none.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 174:** `if (process.env.CONFIRM_TEST_SEED !== "YES") throw new Error("Set CONFIRM_TEST_SEED=YES to confirm this disposable TEST seed.");` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `assertRequiredSchemaFields` — lines 177–185

Parameters: `Model`, `doc`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 178:** `const errors = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 179:** `for (const [field, schemaPath] of Object.entries(Model.schema.paths)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 180:** `if (!schemaPath.isRequired || field === "_id" || field === "__v") continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 181:** `const values = collectPathValues(doc, field.split("."));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 182:** `if (!values.length || values.some((value) => value === undefined || value === null || (typeof value === "string" && !value.trim()))) errors.push(\`${Model.modelName}.${field}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 184:** `return errors;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `collectPathValues` — lines 187–192

Parameters: `value`, `parts`.
3 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 188:** `if (value == null) return [];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 189:** `if (!parts.length) return Array.isArray(value) ? value.flatMap((item) => collectPathValues(item, [])) : [value];` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 190:** `if (Array.isArray(value)) return value.flatMap((item) => collectPathValues(item, parts));` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 191:** `return collectPathValues(value[parts[0]], parts.slice(1));` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `safeErrorMessage` — lines 194–198

Parameters: `error`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 195:** `return String(error?.message || "Seed failed.")` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `inspectReferences` — lines 200–227

Parameters: `Model`, `docs`, `tenantId`, `failures`.
Persistent operations detected: RefModel.find; verify tenant/ownership filters in the exact query. 1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 7 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 201:** `for (const doc of docs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 202:** `for (const [field, schemaPath] of Object.entries(Model.schema.paths)) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 203:** `const refName = schemaPath.options?.ref || schemaPath.caster?.options?.ref;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 204:** `const refPath = schemaPath.options?.refPath;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 205:** `const modelName = refName || (refPath ? doc[refPath] : null);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 206:** `const RefModel = modelName && mongoose.models[modelName];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 207:** `if (!RefModel) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 208:** `const refs = collectPathValues(doc, field.split(".")).filter((value) => value != null && value !== "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 209:** `const platformOwner = Model === User && ["super_admin", "superadmin"].includes(String(doc.role || "").toLowerCase());` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 210:** `const ownerId = tenantId && RefModel.schema.path("tenantId") && !["Organization", "Permission", "Currency"].includes(modelName)` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 213:** `const cacheKey = \`${modelName}:${ownerId}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 214:** `if (!referenceCache.has(cacheKey)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 215:** `const filter = {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 216:** `if (ownerId !== "global") filter.tenantId = ownerId === "platform" ? null : (doc.tenantId || tenantId);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 217:** `const existing = await RefModel.find(filter).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 220:** `const validIds = referenceCache.get(cacheKey);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 221:** `for (const reference of refs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 222:** `const id = reference?._id || reference;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `upsert` — lines 229–244

Parameters: `Model`, `filter`, `fields`.
Persistent operations detected: Model.findOne; verify tenant/ownership filters in the exact query. 3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 230:** `if (typeof Model?.findOne !== "function") throw new Error(\`Seed fixture is not a Mongoose model with findOne(): ${Model?.modelName || Model?.name || typeof Model}; caller ${new Error().stack?.split("\n")[2]?.trim() || "` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 231:** `if (existingCollections && !existingCollections.has(Model.collection.collectionName)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 232:** `throw new Error(\`Required application collection was not initialized: ${Model.collection.collectionName}\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 234:** `let findQuery = Model.findOne(filter);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 235:** `if (Model === Tour) findQuery = findQuery.sort({ createdAt: 1, _id: 1 });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 236:** `let doc = await findQuery;` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 237:** `if (!doc) doc = new Model({ ...filter, ...fields });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 238:** `else Object.assign(doc, fields);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 239:** `const missing = assertRequiredSchemaFields(Model, doc);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 240:** `if (missing.length) throw new Error(\`Required fields missing: ${missing.join(", ")}\`);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 241:** `await doc.validate();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 242:** `await doc.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 243:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `upsertPlain` — lines 246–252

Parameters: `Model`, `filter`, `fields`.
1 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 247:** `if (existingCollections && !existingCollections.has(Model.collection.collectionName)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 248:** `throw new Error(\`Required application collection was not initialized: ${Model.collection.collectionName}\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 250:** `const doc = await Model.findOneAndUpdate(filter, { $set: fields }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 251:** `return doc;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `initializeApplicationCollections` — lines 254–280

Parameters: none.
5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 255:** `const newlyCreatedCollections = new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 256:** `for (const Model of allModels) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 257:** `const name = Model.collection.collectionName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 258:** `if (!existingCollections.has(name)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 259:** `try {` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 260:** `await Model.createCollection();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 262:** `if (error.codeName !== "NamespaceExists" && error.code !== 48) throw error;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 268:** `await reconcileBookingExternalIdIndex();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 269:** `await reconcileSubscriptionPaymentIndex();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 270:** `await reconcileExpensePurchaseOrderIndex();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 271:** `const initialized = new Set();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 272:** `for (const Model of allModels) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 273:** `const name = Model.collection.collectionName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 274:** `if (newlyCreatedCollections.has(name) && !initialized.has(name)) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 275:** `await Model.init();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `countClusterCollections` — lines 282–289

Parameters: none.
3 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller.

Key statements:
- **Line 283:** `const { databases = [] } = await mongoose.connection.db.admin().listDatabases({ nameOnly: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 284:** `const counts = await Promise.all(databases.map(async ({ name }) => {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 285:** `const database = mongoose.connection.getClient().db(name);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 286:** `return (await database.listCollections({}, { nameOnly: true }).toArray()).length;` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 288:** `return counts.reduce((total, count) => total + count, 0);` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `replacePriorDemoData` — lines 291–342

Parameters: none.
Persistent operations detected: Organization.findOne, Model.countDocuments, Permission.countDocuments, Role.countDocuments, User.findOne, User.updateOne; verify tenant/ownership filters in the exact query. 12 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 15 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 292:** `return runWithTenant({ role: "super_admin", bypass: true }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 293:** `const tenantDocs = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 294:** `const preflight = { namespace: NAMESPACE, database: mongoose.connection.name, timestamp: new Date().toISOString(), tenants: [], plannedDeletionCounts: {}, plannedGlobalCleanupCounts: {} };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 295:** `for (const tenantSpec of tenantsSpec) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 296:** `const tenant = await Organization.findOne({ slug: tenantSpec.slug }).lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 297:** `const knownDemoTenant = tenant && tenant.name === tenantSpec.name && tenant.status === "active";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 298:** `if (tenant && tenant.settings?.testSeedNamespace !== NAMESPACE && !(knownDemoTenant && process.env.ALLOW_ATLAS_DEMO_SEED === "YES" && process.env.CONFIRM_TEST_SEED === "YES")) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 299:** `throw new Error(\`Refusing to replace tenant without the exact demo seed marker: ${tenantSpec.slug}\`);` — Stops the current operation with an error; callers or Express error handling determine the response.
- **Line 301:** `if (tenant) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 306:** `const tenantIds = tenantDocs.map(({ _id }) => _id);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 307:** `if (tenantIds.length) {` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 308:** `for (const Model of allModels) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 309:** `if (Model === Organization || Model === Permission || !Model.schema.path("tenantId")) continue;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 310:** `const count = await Model.countDocuments({ tenantId: { $in: tenantIds } });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 311:** `if (count) preflight.plannedDeletionCounts[Model.modelName] = count;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 314:** `preflight.plannedGlobalCleanupCounts.permissions = await Permission.countDocuments({ name: /^test_seed_2026_/ });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 315:** `preflight.plannedGlobalCleanupCounts.platformRoles = await Role.countDocuments({ tenantId: null, name: "super_admin", description: "TEST/DEMO platform owner RBAC role" });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 316:** `const legacyPlatformUser = await User.findOne({ email: "superadmin@hussein-mboya.com", role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id").lean();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `reconcileExpensePurchaseOrderIndex` — lines 344–363

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 345:** `if (!existingCollections?.has(Expense.collection.collectionName)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 346:** `const collection = mongoose.connection.db.collection(Expense.collection.collectionName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 347:** `const indexes = await collection.indexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 348:** `const current = indexes.find((index) => index.name === "tenantId_1_purchaseOrder_1");` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 349:** `if (current?.partialFilterExpression?.purchaseOrder?.$type === "objectId") return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 350:** `const duplicates = await collection.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 356:** `if (duplicates.length) throw new Error("Cannot repair the expense purchase-order index: existing duplicate purchase-order references need review.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 357:** `if (current) await collection.dropIndex(current.name);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 358:** `await collection.createIndex({ tenantId: 1, purchaseOrder: 1 }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `reconcileBookingExternalIdIndex` — lines 365–386

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 366:** `if (!existingCollections?.has(Booking.collection.collectionName)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 367:** `const collection = mongoose.connection.db.collection(Booking.collection.collectionName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 368:** `const indexes = await collection.indexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 369:** `const indexName = "tenantId_1_externalSource_1_externalBookingId_1";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 370:** `const current = indexes.find((index) => index.name === indexName);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 371:** `const filter = current?.partialFilterExpression?.externalBookingId;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 372:** `if (filter?.$type === "string" && filter?.$gt === "" && !current.sparse) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 373:** `const duplicates = await collection.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 379:** `if (duplicates.length) throw new Error("Cannot repair the booking external identifier index: existing duplicate external booking IDs need review.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 380:** `if (current) await collection.dropIndex(current.name);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 381:** `await collection.createIndex({ tenantId: 1, externalSource: 1, externalBookingId: 1 }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `reconcileSubscriptionPaymentIndex` — lines 388–409

Parameters: none.
4 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 389:** `if (!existingCollections?.has(SubscriptionPayment.collection.collectionName)) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 390:** `const collection = mongoose.connection.db.collection(SubscriptionPayment.collection.collectionName);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 391:** `const indexes = await collection.indexes();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 392:** `const indexName = "provider_1_transactionReference_1";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 393:** `const current = indexes.find((index) => index.name === indexName);` — Reads or changes persistent model data; verify tenant filter, ownership and write semantics for this operation.
- **Line 394:** `const filter = current?.partialFilterExpression?.transactionReference;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 395:** `if (filter?.$type === "string" && filter?.$gt === "" && !current.sparse) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 396:** `const duplicates = await collection.aggregate([` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 402:** `if (duplicates.length) throw new Error("Cannot repair the subscription payment transaction index: duplicate references need review.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 403:** `if (current) await collection.dropIndex(current.name);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 404:** `await collection.createIndex({ provider: 1, transactionReference: 1 }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

### `createUsers` — lines 411–447

Parameters: `tenant`, `roleMap`, `prefix`, `ti`, `platform (defaulted)`, `platformRole (defaulted)`.
Persistent operations detected: User.findOne, User.findById; verify tenant/ownership filters in the exact query. 5 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 5 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 412:** Sensitive-configuration/data operation; inspect source without copying secret values. — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 413:** `const accountSpecs = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 421:** `if (platform) accountSpecs.unshift(["superadmin", "super_admin", "Platform Owner"]);` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 422:** `const users = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 423:** `for (let i = 0; i < accountSpecs.length; i++) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 424:** `const [local, role, title] = accountSpecs[i];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 425:** `const email = loginEmail(local, prefix);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 426:** `const id = platform && local === "superadmin" ? null : tenant._id;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 427:** `const filter = id ? { tenantId: id, email } : { email, tenantId: null };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 428:** `const provision = async () => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 429:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 430:** `if (!user) user = new User({ ...filter, email });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 439:** `await user.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 440:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 442:** `const saved = id ? await provision() : await runWithTenant({ role: "super_admin", bypass: true }, provision);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 443:** Sensitive-configuration/data operation; inspect source without copying secret values. — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 446:** `return users;` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `provision` — lines 428–441

Parameters: none.
Persistent operations detected: User.findOne, User.findById; verify tenant/ownership filters in the exact query. 2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 429:** Sensitive-configuration/data operation; inspect source without copying secret values. — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 430:** `if (!user) user = new User({ ...filter, email });` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 439:** `await user.save();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 440:** Sensitive-configuration/data operation; inspect source without copying secret values. — Exits this function and supplies its result (or response short-circuit) to the caller.

### `buildSeedTourItinerary` — lines 449–474

Parameters: `{title, destination, tenantPrefix, county}`.
6 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 450:** `const destinationName = String(destination?.name || county || "Kenya").replace(/^TEST\s+/i, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 451:** `const tourName = String(title || "Kenya experience").replace(/^TEST\s+/i, "");` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 452:** `const plans = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 469:** `return (plans[tenantPrefix] || plans.hussein).map((day, index) => ({` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `seedTenant` — lines 476–723

Parameters: `spec`, `index`, `globalPermissionIds`, `platformRole (defaulted)`.
Persistent operations detected: Tour.updateMany, Booking.aggregate, Invoice.findOne, PaymentLink.findOne, PurchaseOrder.findOne, CorporateAccount.findOne, Booking.find, JournalEntry.findOne, WebsiteIntegrationKey.findOne; verify tenant/ownership filters in the exact query. 102 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. 48 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 477:** `const tenant = await upsertPlain(Organization, { slug: spec.slug }, {` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 485:** `const permissions = globalPermissionIds;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 486:** `const roleDefs = [` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 490:** `const roleMap = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 491:** `let seededUsers = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 492:** `return runWithTenant({ tenantId: tenant._id, role: "admin", bypass: true }, async () => {` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 493:** `for (const provider of ["MPESA", "STRIPE", "BANK"]) await upsert(PaymentGatewayConfig, { tenantId: tenant._id, provider }, { tenantId: tenant._id, provider, environment: "sandbox", enabled: false, accountName: \`TEST ${p` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 494:** `for (const [name, displayName, level] of roleDefs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 495:** `const allowedModules = { super_admin: null, admin: null, tour_manager: new Set(["dashboard", "destination", "tour", "booking", "customer", "report"]), agent: new Set(["dashboard", "tour", "booking", "customer"]), tour_gu` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 496:** `const rolePermissions = permissions.filter((permission) => allowedModules === null || allowedModules.has(permission.module));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 499:** `const users = await createUsers(tenant, roleMap, spec.prefix, index, Boolean(platformRole), platformRole);` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 501:** `const byEmail = new Map(users.map((u) => [u.email, u]));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 502:** `const staffByKind = new Map();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 503:** `for (const [kind, position, roleName, nth] of [["manager", "tour_manager", "manager", 1], ["guide1", "guide", "guide", 1], ["guide2", "guide", "guide", 2], ["driver1", "driver", "driver", 1], ["driver2", "driver", "drive` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 504:** `const accountLocal = kind === "manager" ? "manager" : kind;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 505:** `const account = byEmail.get(loginEmail(accountLocal, spec.prefix));` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 506:** `const staff = await upsert(Staff, { tenantId: tenant._id, email: account.email }, { name: account.name, email: account.email, phone: account.phone, position, role: roleName, status: "active", availability: "available", e` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 508:** `await upsert(StaffProfile, { tenantId: tenant._id, user: account._id }, { user: account._id, staff: staff._id, bio: \`TEST/DEMO ${position} profile.\`, address: \`${spec.county}, Kenya\`, city: spec.county, country: "Ken` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `runCompleteTestDemoSeed` — lines 725–898

Parameters: none.
Persistent operations detected: Role.find, Permission.find, User.findOne, PaymentGatewayConfig.find, Tour.find, Booking.aggregate, Tour.aggregate, Invoice.find, Booking.find, Payment.find, Invoice.findOne, User.find, Destination.find; verify tenant/ownership filters in the exact query. 42 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=true, finally=false. 40 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 727:** `const target = databaseTarget();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 733:** `await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000, socketTimeoutMS: 120000 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 735:** `const targetCollectionsBefore = existingCollections.size;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 736:** `const clusterCollectionsBefore = await countClusterCollections();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 738:** `await initializeApplicationCollections();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 740:** `const replacedDemoData = await replacePriorDemoData();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 741:** `await reconcileExpensePurchaseOrderIndex();` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 742:** `const buildInfo = await mongoose.connection.db.admin().command({ buildInfo: 1 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 744:** `const dbName = mongoose.connection.name;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 745:** `if (dbName !== target.dbName) throw new Error("Connected database name does not match guarded target.");` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 748:** `const permissions = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 749:** `const permissionDefs = [["dashboard.view", "dashboard"], ["users.read", "user"], ["users.write", "user"], ["roles.read", "role"], ["roles.write", "role"], ["destinations.read", "destination"], ["destinations.write", "des` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 750:** `for (const [shortName, module] of permissionDefs) {` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 751:** `const name = \`test_seed_2026_${shortName.replace(/[.]/g, "_")}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 754:** `const results = [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 755:** `const platformRole = await runWithTenant({ role: "super_admin", bypass: true }, () => upsert(Role, { tenantId: null, name: "super_admin" }, { displayName: "TEST Platform Owner", description: "TEST/DEMO platform owner RBA` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 756:** `for (const [index, spec] of tenantsSpec.entries()) results.push(await seedTenant(spec, index + 1, permissions, index === 0 ? platformRole : null));` — This repeats work; check the collection size/termination condition and avoid unbounded request-driven loops.
- **Line 760:** `const allLoginEmails = TEST_LOGIN_EMAILS;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `writeFailureReport` — lines 900–914

Parameters: `error`.
2 awaited asynchronous operation(s); a rejection follows this function's catch behavior or its caller. Error control: try=true, catch=false, finally=false.

Key statements:
- **Line 901:** `let database = "unavailable";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 902:** `try { database = databaseTarget().dbName || "(default)"; } catch { /* URI is unavailable or malformed; never include it. */ }` — Begins an error-handling boundary; inspect the corresponding catch/finally for recovery and cleanup.
- **Line 903:** `const report = {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 912:** `await fs.mkdir(path.dirname(reportFile), { recursive: true });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.
- **Line 913:** `await fs.writeFile(reportFile, \`${JSON.stringify(report, null, 2)}\n\`, { mode: 0o600 });` — Waits for asynchronous I/O before continuing; rejection follows the surrounding catch/Express async behavior.

## Module-level declarations

- Line 89: `export const NAMESPACE = "TEST-SEED-GLOBAL-TOURS-2026";`.
- Line 90: `<sensitive declaration redacted>`.
- Line 91: `<sensitive declaration redacted>`.
- Line 92: `<sensitive declaration redacted>`.
- Line 97: `const __dirname = path.dirname(fileURLToPath(import.meta.url));`.
- Line 98: `const reportFile = path.resolve(__dirname, "../reports/test-seed-report.json");`.
- Line 99: `let existingCollections = null;`.
- Line 100: `let seedStage = "preflight";`.
- Line 101: `const unavailableSeedCollections = new Set();`.
- Line 102: `const referenceCache = new Map();`.
- Line 103: `<sensitive declaration redacted>`.
- Line 104: `export const SEEDED_MODELS = allModels;`.
- Line 105: `const tenantsSpec = [`.
- Line 110: `const unsplashAssetIds = [`.
- Line 113: `const imageUrl = (id) => \`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85\`;`.
- Line 114: `const localDestinationImages = ["/destinations/maasai-mara.jpg", "/destinations/amboseli.jpg", "/destinations/diani.jpg", "/gallery/mara.jpg", "/gallery/amboseli.jpg", "/gallery/di`.
- Line 115: `const generatedDestinationImages = Array.from({ length: 18 }, (_, index) => \`/demo-destinations/kenya-landscape-${String(index + 1).padStart(2, "0")}.svg\`);`.
- Line 116: `const generatedSafariTourImage = "/demo-tours/kenya-tour-08.svg";`.
- Line 117: `const destinationImage = (index) => {`.
- Line 122: `const tourImage = (index) => index === 7 ? generatedSafariTourImage : imageUrl(unsplashAssetIds[index < 7 ? index : index - 1]);`.
- Line 123: `const sharedDemoImage = imageUrl(unsplashAssetIds[29]);`.
- Line 124: `const tenantDomain = { hussein: "husseinmboya.com", amani: "amanitrails.com", demo: "demosafari.com" };`.
- Line 125: `function loginEmail(local, prefix) {`.
- Line 127: `const roleAccount = { admin: "admin1", manager: "tourmanager1" }[local] || local;`.
- Line 130: `export const TEST_LOGIN_EMAILS = ["superadmin1@husseinmboya.com", ...tenantsSpec.flatMap(({ prefix }) => ["admin", "manager", "agent1", "agent2", "guide1", "guide2", "driver1", "dr`.
- Line 131: `const roleForLoginEmail = (email) => {`.
- Line 133: `const local = String(email).split("@")[0];`.
- Line 142: `const dates = (days = 30) => new Date(Date.now() + days * 86400000);`.
- Line 143: `const stablePhone = (tenantIndex, accountIndex) => String(7100000000 + tenantIndex * 1000 + accountIndex).slice(0, 10);`.
- Line 145: `function databaseTarget() {`.
- Line 146: `const raw = String(process.env.MONGODB_URI || "");`.
- Line 148: `let parsed;`.
- Line 153: `export function safeTarget(target = databaseTarget()) {`.
- Line 155: `const { dbName, host } = target;`.
- Line 156: `const normalizedHost = String(host || "").toLowerCase();`.
- Line 160: `const explicitAtlasStagingSeed = process.env.ALLOW_ATLAS_DEMO_SEED === "YES"`.
- Line 166: `const configText = [process.env.NODE_ENV, process.env.PLATFORM_HOST, process.env.CLIENT_URL, process.env.CLIENT_ORIGINS, host, dbName].join(" ").toLowerCase();`.
- Line 173: `export function assertSeedConfirmation() {`.
- Line 177: `function assertRequiredSchemaFields(Model, doc) {`.
- Line 178: `const errors = [];`.
- Line 181: `const values = collectPathValues(doc, field.split("."));`.
- Line 187: `function collectPathValues(value, parts) {`.
- Line 194: `function safeErrorMessage(error) {`.
- Line 203: `const refName = schemaPath.options?.ref || schemaPath.caster?.options?.ref;`.
- Line 204: `const refPath = schemaPath.options?.refPath;`.
- Line 205: `const modelName = refName || (refPath ? doc[refPath] : null);`.
- Line 206: `const RefModel = modelName && mongoose.models[modelName];`.
- Line 208: `const refs = collectPathValues(doc, field.split(".")).filter((value) => value != null && value !== "");`.
- Line 209: `const platformOwner = Model === User && ["super_admin", "superadmin"].includes(String(doc.role || "").toLowerCase());`.
- Line 210: `const ownerId = tenantId && RefModel.schema.path("tenantId") && !["Organization", "Permission", "Currency"].includes(modelName)`.
- Line 213: `const cacheKey = \`${modelName}:${ownerId}\`;`.
- Line 215: `const filter = {};`.
- Line 217: `const existing = await RefModel.find(filter).select("_id").lean();`.
- Line 220: `const validIds = referenceCache.get(cacheKey);`.
- Line 222: `const id = reference?._id || reference;`.
- Line 234: `let findQuery = Model.findOne(filter);`.
- Line 236: `let doc = await findQuery;`.
- Line 239: `const missing = assertRequiredSchemaFields(Model, doc);`.
- Line 250: `const doc = await Model.findOneAndUpdate(filter, { $set: fields }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });`.
- Line 255: `const newlyCreatedCollections = new Set();`.
- Line 257: `const name = Model.collection.collectionName;`.
- Line 271: `const initialized = new Set();`.
- Line 273: `const name = Model.collection.collectionName;`.
- Line 283: `const { databases = [] } = await mongoose.connection.db.admin().listDatabases({ nameOnly: true });`.
- Line 284: `const counts = await Promise.all(databases.map(async ({ name }) => {`.
- Line 285: `const database = mongoose.connection.getClient().db(name);`.
- Line 293: `const tenantDocs = [];`.
- Line 294: `const preflight = { namespace: NAMESPACE, database: mongoose.connection.name, timestamp: new Date().toISOString(), tenants: [], plannedDeletionCounts: {}, plannedGlobalCleanupCount`.
- Line 296: `const tenant = await Organization.findOne({ slug: tenantSpec.slug }).lean();`.
- Line 297: `const knownDemoTenant = tenant && tenant.name === tenantSpec.name && tenant.status === "active";`.
- Line 306: `const tenantIds = tenantDocs.map(({ _id }) => _id);`.
- Line 310: `const count = await Model.countDocuments({ tenantId: { $in: tenantIds } });`.
- Line 316: `const legacyPlatformUser = await User.findOne({ email: "superadmin@hussein-mboya.com", role: { $in: ["super_admin", "superadmin"] }, tenantId: null }).select("_id").lean();`.
- Line 317: `const canonicalPlatformUser = await User.findOne({ email: "superadmin1@husseinmboya.com", tenantId: null }).select("_id").lean();`.
- Line 328: `const deletedCounts = {};`.
- Line 332: `const result = await Model.deleteMany({ tenantId: { $in: tenantIds } });`.
- Line 336: `const roleCleanup = await Role.deleteMany({ tenantId: null, name: "super_admin", description: "TEST/DEMO platform owner RBAC role" });`.
- Line 338: `const permissionCleanup = await Permission.deleteMany({ name: /^test_seed_2026_/ });`.
- Line 346: `const collection = mongoose.connection.db.collection(Expense.collection.collectionName);`.
- Line 347: `const indexes = await collection.indexes();`.

## Security, errors and performance checkpoints

- Tenant-scoping code is present; trace context and filters at every read/write boundary.
- Authentication/authorization-related code is present; review server-side enforcement and secret handling.
- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- File/upload-related code is present; verify type/size limits, storage permissions and public URL behavior.
- Environment access is present; client build variables are public and server secrets must remain server-side.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
