import { ApiError } from "../utils/ApiError.js"

const errorHandler = (err, req, res, next) => {
  let error = err

  // If error is not ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500
    const message = error.message || "Internal Server Error"

    error = new ApiError(statusCode, message)
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
  })
}

export { errorHandler }
