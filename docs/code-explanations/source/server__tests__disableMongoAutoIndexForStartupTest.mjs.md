# Source explanation: `server/tests/disableMongoAutoIndexForStartupTest.mjs`

This test-only setup helper disables Mongoose's automatic index and collection creation before the isolated health/readiness test runs. It prevents unrelated schema auto-index work from making that test create many indexes in a fresh test database.

`import mongoose` loads the same Mongoose singleton used by the test process. `mongoose.set("autoIndex", false)` disables automatic index creation; without it, connecting the test can trigger every model's declared indexes. `mongoose.set("autoCreate", false)` similarly suppresses automatic collection creation. These are process-level Mongoose settings, so tests using this helper must run in an isolated process or intentionally accept those settings for their lifetime. The helper does not change application startup defaults outside the test process.
