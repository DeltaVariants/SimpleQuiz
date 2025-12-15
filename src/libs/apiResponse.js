//apiResponse.js
export function successResponse(data, message = "Operation successful") {
  return {
    status: "success",
    message: message,
    data: data,
  };
}
export function errorResponse(code, message = "An error occurred") {
  return {
    status: "error",
    code: code,
    message: message,
  };
}
export function notFoundResponse(message = "Resource not found") {
  return {
    status: "error",
    code: 404,
    message: message,
  };
}
export function validationErrorResponse(errors, message = "Validation errors") {
  return {
    status: "error",
    code: 400,
    message: message,
    errors: errors,
  };
}
export function serverErrorResponse(message = "Internal server error") {
  return {
    status: "error",
    code: 500,
    message: message,
  };
}
