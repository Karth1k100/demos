"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function authMiddleware(...allowedRoles) {
    return (req, resp, next) => {
        const role = req.session && req.session.role;
        if (role) {
            if (allowedRoles.some(allowedRole => role === allowedRole)) {
                next(); // allow the call to continue on to the next middleware to process the request
            }
            else {
                resp.sendStatus(403); // does not have proper permissions
            }
        }
        else {
            resp.sendStatus(401); // no authentication info present
        }
    };
}
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth-middleware.js.map