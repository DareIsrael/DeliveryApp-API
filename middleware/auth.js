// const jwt = require ("jsonwebtoken");



// const authMiddleware = async (req, res, next ) => {
//    const {token} = req.headers;

// console.log(token)
   
//    if (!token) {
//     return res.json ({
//         success: false,
//         message: "Not Authorised Login Again"
//     })
// }
//     try {
//         const token_decode = jwt.verify(token,process.env.JWT_SECRET);
//         req.body.userId = token_decode.id;
//         next();
//     } catch (error) {
//        console.log(error)
//        res.json ({
//         success: false,
//         message: "Error"
//     })

//     }
//    }
  
//   module.exports = { authMiddleware };
  


const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
   // Extract the token from the Authorization header
   const token = req.header('Authorization')?.replace('Bearer ', '');

   if (!token) {
      return res.status(401).json({
         success: false,
         message: 'Not Authorized. Please log in again.'
      });
   }

   try {
      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user ID to the request object for further use
      req.body.userId = decoded.id;

      // Continue to the next middleware/route handler
      next();
   } catch (error) {
      console.error('JWT Error:', error.message);  // Log error message for debugging

      return res.status(401).json({
         success: false,
         message: 'Invalid or expired token. Please log in again.'
      });
   }
};

module.exports = { authMiddleware };
