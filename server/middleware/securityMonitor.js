/**
 * Purpose: security Monitor request middleware. Main declarations: securityMonitor.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/middleware/securityMonitor.js

// Load ../models/SecurityLog.js so this module can use its exported dependencies.
import SecurityLog from "../models/SecurityLog.js";

/*
|--------------------------------------------------------------------------
| SECURITY MONITOR MIDDLE|--------------------------------------------------------------------------
|
| Monitors requests for suspicious activity.
|
|--------------------------------------------------------------------------
*/

// Declare securityMonitor for use by the surrounding module or function.
const securityMonitor = async (req, res, next) => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
        /*
        |--------------------------------------------------------------------------
        | REQUEST DATA
        |--------------------------------------------------------------------------
        */

        // Declare requestData for use by the surrounding module or function.
        const requestData = JSON.stringify({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        /*
        |--------------------------------------------------------------------------
        | SUSPICIOUS PATTERNS
        |--------------------------------------------------------------------------
        */

        // Declare suspiciousPatterns for use by the surrounding module or function.
        const suspiciousPatterns = [
            /<script/i,
            /<\/script>/i,
            /javascript:/i,
            /<iframe/i,
            /union\s+select/i,
            /drop\s+table/i,
            /insert\s+into/i,
            /delete\s+from/i,
            /update\s+\w+\s+set/i,
            /select\s+\*/i,
            /\.\.\//,
            /\.\.\\/,
            /\$where/i,
            /\$ne/i,
            /\$gt/i,
            /\$lt/i,
            /\$regex/i,
            /\|\|/,
            /&&/,
            /;.*(rm|cat|wget|curl|chmod|sudo)/i,
        ];

        // Declare detectedPattern for use by the surrounding module or function.
        const detectedPattern = suspiciousPatterns.find((regex) =>
            regex.test(requestData)
        );

        /*
        |--------------------------------------------------------------------------
        | SAVE INCIDENT
        |--------------------------------------------------------------------------
        */

        // Check the condition (detectedPattern) and run the matching branch.
        if (detectedPattern) {
            // Perform the side effect or state update expressed on the following line.
            await SecurityLog.create({
                action: "suspicious_request",

                severity: "high",

                user: req.user?._id || null,

                ipAddress: req.ip,

                userAgent: req.get("user-agent"),

                details: {
                    method: req.method,
                    url: req.originalUrl,
                    patternDetected: detectedPattern.toString(),
                    request: requestData.substring(0, 5000),
                },
            });
        }

        // Perform the side effect or state update expressed on the following line.
        next();
    } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        console.error("Security Monitor Error:", error.message);

        // Perform the side effect or state update expressed on the following line.
        next();
    }
};

export default securityMonitor;
