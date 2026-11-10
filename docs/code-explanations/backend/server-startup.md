# `server/server.js` — process startup and shutdown

## Imports and boot ordering

The first two side-effect imports load tenant bootstrap and operational accounting hooks before application startup. This matters because those modules register global schema/query behavior. The file then imports Node's HTTP server, Mongoose, Express app, DB connector, environment config, Socket.IO and scheduled domain services. Importing the app creates middleware/routes; connecting the database is deliberately handled after the HTTP listener begins.

## Startup constants and task guard

`DB_READY = 1` uses Mongoose's connected ready-state value. Timeout/retry constants bound database selection, invoice-index startup and scheduled retry delays. `taskState` tracks a named scheduled task's running/failure state; `intervals` allows cleanup. `stopJobWorker`, `shutdownPromise`, and `shuttingDown` make shutdown idempotent and prevent concurrent duplicate cleanup.

`runNonCriticalTask(name, task)` skips work when Mongo is unavailable or the same task is already running. It resets failures on success; on failure it caps the counter and logs a bounded exponential retry estimate. It returns false rather than crashing the HTTP process for this non-critical work.

`withTimeout` races an operation against a timer. On timeout, it waits for the underlying Mongo operation to settle before rejecting, because JavaScript promise timeout does not cancel the database operation and overlapping index migrations could race. Finally it clears the timer.

## HTTP and Socket.IO

`http.createServer(app)` gives Express an HTTP server that Socket.IO can share. The socket CORS list is derived from configured client origins, with credentials enabled; `initSocket(io)` installs handlers and exports the instance for other modules.

## Shutdown

`shutdown(exitCode)` returns an existing promise on repeated calls. First it marks shutdown, clears scheduled intervals, stops the job worker, closes the HTTP listener if open, then closes MongoDB and exits. Each close is guarded so one failure is logged and does not skip the other cleanup. SIGINT/SIGTERM invoke this path.

## Database services and retry loop

`startDatabaseServices()` launches periodic tenant/customer/compliance/retention tasks, starts the worker, and schedules eTIMS dispatch and tour lifecycle sync. Immediate one-off runs kick off important tasks without waiting an entire interval. `initializeDatabase()` retries connection and startup migration with bounded backoff; readiness is set to `ready` only after connection, staging-seed hook and invoice index migration complete. If startup fails, phase becomes failed and retry continues unless shutdown started.

The listener is started on `0.0.0.0` at configured port before `initializeDatabase()` is invoked. This lets liveness/readiness routes answer while startup progresses; app middleware still gates normal DB-dependent requests. `EADDRINUSE` produces a clear message and exits through common shutdown.

## Runtime caveats

Scheduled tasks are in-process timers. Multiple API replicas may each run a scheduler unless the underlying operation is coordinated/idempotent. Logs shown here are console logs; external log shipping is deployment-specific.
