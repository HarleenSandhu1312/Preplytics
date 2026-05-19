/**
 * middleware/logger.js
 * ─────────────────────────────────────────────
 * REQUEST LOGGER MIDDLEWARE
 *
 * Logs every incoming request with:
 *   method, URL, status code, response time, IP address
 *
 * We also use morgan (third-party) for structured logging.
 * This custom logger shows how to write middleware from scratch.
 * ─────────────────────────────────────────────
 */

// Custom logger middleware (application-level middleware)
const customLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Intercept res.end to capture the status code AFTER response is sent
  const originalEnd = res.end.bind(res);
  res.end = (...args) => {
    const duration = Date.now() - start;
    const color =
      res.statusCode >= 500 ? '\x1b[31m' :   // red
      res.statusCode >= 400 ? '\x1b[33m' :   // yellow
      res.statusCode >= 300 ? '\x1b[36m' :   // cyan
                              '\x1b[32m';    // green

    console.log(
      `${color}[${timestamp}] ${req.method} ${req.originalUrl} — ${res.statusCode} (${duration}ms)\x1b[0m`
    );
    originalEnd(...args);
  };

  next();
};

// Rate limit tracker (simple in-memory, use Redis in production)
const requestCounts = {};

const rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const ip  = req.ip;
    const now = Date.now();

    if (!requestCounts[ip]) {
      requestCounts[ip] = { count: 1, startTime: now };
    } else {
      if (now - requestCounts[ip].startTime > windowMs) {
        // Reset window
        requestCounts[ip] = { count: 1, startTime: now };
      } else {
        requestCounts[ip].count++;
        if (requestCounts[ip].count > maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
          });
        }
      }
    }
    next();
  };
};

module.exports = { customLogger, rateLimiter };
