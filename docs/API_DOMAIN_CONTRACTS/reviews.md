# Tour review API contracts

## Entries 376–378

**Status: SOURCE-TRACED.** `server/routes/reviewRoutes.js` tenant-resolves all routes; public review read has no JWT, while create/helpful vote require `protect`. Controller: `server/controllers/reviewController.js`; model: `Review`; creation checks completed tenant booking and updates only persisted review state. No focused review controller tests were found.

- `GET /api/reviews/tour/:id`: no body/query; tenant-scoped approved, non-deleted reviews for tour ID, populates author name/profileImage, newest first. Returns 200 `{success:true,count,reviews}`. It does not validate ObjectId itself; malformed IDs may be cast errors handled centrally.
- `POST /api/reviews`: body accepts `tour` or `tourId`, `rating`, `comment`, optional `title`. Requires truthy tour/rating/comment (400); requires a completed tenant booking tied to user, customer reference or matching customer snapshot email (400 otherwise); rejects an existing user+tour review with 409. Creates `verified:true`, `approved:false`, helpfulVotes 0; returns 201 pending moderation. Model constrains rating 1–5 and comment max 3000; invalid schema values are delegated errors. Unique booking index adds a second duplicate guard, but race errors are not translated here.
- `PUT /api/reviews/:id/helpful`: authenticated; no body. Tenant review lookup 404; increments helpfulVotes and saves; returns 200 `{success:true,helpfulVotes}`. The handler does not require the review be approved/non-deleted and stores no voter identity, so repeated votes by the same account can increment repeatedly.

Review creation does not update aggregate tour rating in this handler; `approveReview` exists as a controller export but is not mounted in this router. No external service or notifications. No live review submitted.
