class ApiErrorHandler extends Error {
    constructor(statusCode, message, stack="", errors=[]) {
        super(message);
        this.data = null;
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        
        if(this.stack)
            this.stack = stack
        else
            Error.captureStackTrace(this, this.constructor);
    }
};

export {ApiError};