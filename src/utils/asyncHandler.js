// HOF structure
// const func1 = (func2) => {
//   () => {func2()}
// }

// this is a higher order func which takes a func as an argument and performs operation on that func
// we can use this func as a middleware to respond to async functions

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// another way of doing the same thing using try-catch

// const asyncHandler = (requestHandler) => {
//   async (req, res, next) => {
//     try {
//       await requestHandler(req, res, next);
//     } catch (error) {
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };

export default asyncHandler;
