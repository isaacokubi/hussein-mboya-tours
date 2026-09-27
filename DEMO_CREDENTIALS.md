# Demo accounts

All accounts listed below use the demo password `Password@2785`. These are synthetic records for the three demo tenants.

| Tenant | Role | Email | Password | Dashboard |
|---|---|---|---|---|
| Platform | Super Admin | superadmin1@husseinmboya.com | Password@2785 | `/superadmin` |
| Hussein Mboya Tours | Tenant Admin | admin1@husseinmboya.com | Password@2785 | `/admin` |
| Hussein Mboya Tours | Tour Manager | tourmanager1@husseinmboya.com | Password@2785 | `/tour-manager` |
| Hussein Mboya Tours | Booking Agent | agent1@husseinmboya.com | Password@2785 | `/agent` |
| Hussein Mboya Tours | Booking Agent | agent2@husseinmboya.com | Password@2785 | `/agent` |
| Hussein Mboya Tours | Tour Guide | guide1@husseinmboya.com | Password@2785 | `/guide` |
| Hussein Mboya Tours | Tour Guide | guide2@husseinmboya.com | Password@2785 | `/guide` |
| Hussein Mboya Tours | Driver | driver1@husseinmboya.com | Password@2785 | `/driver` |
| Hussein Mboya Tours | Driver | driver2@husseinmboya.com | Password@2785 | `/driver` |
| Hussein Mboya Tours | Customer | customer1@husseinmboya.com | Password@2785 | `/dashboard` |
| Hussein Mboya Tours | Customer | customer2@husseinmboya.com | Password@2785 | `/dashboard` |
| Hussein Mboya Tours | Customer | customer3@husseinmboya.com | Password@2785 | `/dashboard` |
| Hussein Mboya Tours | Customer | customer4@husseinmboya.com | Password@2785 | `/dashboard` |
| Amani Trails | Tenant Admin | admin1@amanitrails.com | Password@2785 | `/admin` |
| Amani Trails | Tour Manager | tourmanager1@amanitrails.com | Password@2785 | `/tour-manager` |
| Amani Trails | Booking Agent | agent1@amanitrails.com | Password@2785 | `/agent` |
| Amani Trails | Booking Agent | agent2@amanitrails.com | Password@2785 | `/agent` |
| Amani Trails | Tour Guide | guide1@amanitrails.com | Password@2785 | `/guide` |
| Amani Trails | Tour Guide | guide2@amanitrails.com | Password@2785 | `/guide` |
| Amani Trails | Driver | driver1@amanitrails.com | Password@2785 | `/driver` |
| Amani Trails | Driver | driver2@amanitrails.com | Password@2785 | `/driver` |
| Amani Trails | Customer | customer1@amanitrails.com | Password@2785 | `/dashboard` |
| Amani Trails | Customer | customer2@amanitrails.com | Password@2785 | `/dashboard` |
| Amani Trails | Customer | customer3@amanitrails.com | Password@2785 | `/dashboard` |
| Amani Trails | Customer | customer4@amanitrails.com | Password@2785 | `/dashboard` |
| Demo Safari | Tenant Admin | admin1@demosafari.com | Password@2785 | `/admin` |
| Demo Safari | Tour Manager | tourmanager1@demosafari.com | Password@2785 | `/tour-manager` |
| Demo Safari | Booking Agent | agent1@demosafari.com | Password@2785 | `/agent` |
| Demo Safari | Booking Agent | agent2@demosafari.com | Password@2785 | `/agent` |
| Demo Safari | Tour Guide | guide1@demosafari.com | Password@2785 | `/guide` |
| Demo Safari | Tour Guide | guide2@demosafari.com | Password@2785 | `/guide` |
| Demo Safari | Driver | driver1@demosafari.com | Password@2785 | `/driver` |
| Demo Safari | Driver | driver2@demosafari.com | Password@2785 | `/driver` |
| Demo Safari | Customer | customer1@demosafari.com | Password@2785 | `/dashboard` |
| Demo Safari | Customer | customer2@demosafari.com | Password@2785 | `/dashboard` |
| Demo Safari | Customer | customer3@demosafari.com | Password@2785 | `/dashboard` |
| Demo Safari | Customer | customer4@demosafari.com | Password@2785 | `/dashboard` |

The repository has no separate finance-officer role; finance dashboard access is provided through tenant administration.

Run `npm run seed` from `server` to replace the records marked with the seed namespace and rebuild this deterministic demo dataset. Atlas seeding requires `ALLOW_ATLAS_DEMO_SEED=YES`, `CONFIRM_TEST_SEED=YES`, and `TEST_DEMO_SEED_PASSWORD`. The seed never drops a database and uses internal demo payment records only.
