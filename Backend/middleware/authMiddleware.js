// Backend/middleware/authMiddleware.js

const protect = (req, res, next) => {
    // This is a bypass function to prevent the crash
    next(); 
};

// We export it in two ways to cover however Friend 2 wrote their code
module.exports = protect; 
module.exports.protect = protect;