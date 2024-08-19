const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session configuration
app.use(session({
    secret: 'fingerprint_customer',  // Secret key for session encryption
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }  // Set secure to true if using HTTPS
}));

// Middleware to authenticate user based on JWT token
app.use("/customer/auth/*", (req, res, next) => {
    // Check for token in the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access token is missing' });
    }

    // Verify the token
    jwt.verify(token, 'your-jwt-secret', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Set user information in the request object
        req.user = decoded;
        
        // Proceed to the next middleware or route handler
        next();
    });
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
