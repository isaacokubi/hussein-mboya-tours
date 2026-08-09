// server/middleware/securityMonitor.js

import SecurityLog from "../models/SecurityLog.js";

/*
|--------------------------------------------------------------------------
| SECURITY MONITOR MIDDLE|--------------------------------------------------------------------------
|
| Monitors requests for suspicious activity.
|
|--------------------------------------------------------------------------
*/

const securityMonitor = async (req, res, next) => {
    try {
        /*
        |--------------------------------------------------------------------------
        | REQUEST DATA
        |--------------------------------------------------------------------------
        */

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

        const detectedPattern = suspiciousPatterns.find((regex) =>
            regex.test(requestData)
        );

        /*
        |--------------------------------------------------------------------------
        | SAVE INCIDENT
        |--------------------------------------------------------------------------
        */

        if (detectedPattern) {
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

        next();
    } catch (error) {
        console.error("Security Monitor Error:", error.message);

        next();
    }
};

export default securityMonitor;