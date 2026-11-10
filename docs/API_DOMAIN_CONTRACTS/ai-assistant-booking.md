# AI assistant and booking endpoints

## POST `/api/ai/assistant` and `/api/ai/chat` (entries 163–164)

Both routes run `resolveTenant` (router-wide) → `protect` → `aiRateLimiter` → `askAI`; authenticated user and tenant are required, with no role permission gate. The client uses `/api/ai/chat` and sends `x-ai-session`, but the controller does not read that header and imported `addMessage` is unused in the handler, so this request does not persist conversation history through that helper.

JSON body requires `message` as string. Controller trims and collapses whitespace; empty message returns 400; length >2,000 returns 400. Limiter defaults to 30 requests per 15 minutes per tenant/user (minimum window 60 seconds and max 1, both configurable by `AI_RATE_LIMIT_WINDOW_MS`/`AI_RATE_LIMIT_MAX`); 429 response includes `retryAfterSeconds` and standard rate headers. It calls `generateTravelAdvice(message,req.user)`. That service may create a pending AI booking draft when booking intent and a matching tour are found, before returning its prompt text; this write does not reserve capacity or initiate payment. Otherwise it searches tenant tours and calls configured OpenAI Responses API, with deterministic fallback on provider/config failure. Empty reply returns 502. Success 200 `{success:true,data:{message,reply,timestamp}}`. Tenant/search/draft failures reach centralized handler. No explicit external provider call is guaranteed, and provider fallback is source-verified only, not live provider-tested.

## POST `/api/ai/booking/complete` (entry 165)

Chain is `resolveTenant` → `protect` → `aiRateLimiter` → `completeBooking`. Authenticated user required; any authenticated tenant role is accepted. Body properties passed through to `completeAIBooking`: `tourId`, `travelDate`, `travellers`, `name`, `email`, `phone`; controller adds `user:req.user`. No explicit schema/body validation. Service requires tenant, tenant-loads Tour by ID and returns an error if absent; guests is `Number(travellers)||1`; amount is tour.price × guests. It creates a Booking with `AI-${Date.now()}` number, user, tour, requested date, guest count, one traveler `{name}`, contact fields, `bookingSource:"api"`, pending booking/payment status, and amount in subtotal/total/balance. Success 201 `{success:true,message:"AI booking created successfully",data:booking}`. Errors are forwarded, commonly 500 for service-thrown missing-tour error unless centralized mapping changes it.

**Important limits:** it does not check tour availability/status, validate future travel date, enforce capacity, reserve slots, validate guest bounds or contact fields, verify payment, or provide idempotency. Duplicate/retried requests can create multiple pending bookings; concurrent requests can exceed capacity. No Payment record or provider call is made. The endpoint name “complete” means create this pending booking record, not complete travel/payment.

## Source and tests

`server/routes/aiRoutes.js`; `server/controllers/aiController.js` (`askAI`); `server/controllers/aiBookingController.js` (`completeBooking`); `server/services/aiService.js`; `aiBookingCompleteService.js`; `aiBookingDraftService.js`; `aiRateLimiter.js`; client `client/src/api/aiApi.js`. No focused request-level tests were found in the searched `server/tests`. Provider behavior was not exercised and no live AI request was made.
