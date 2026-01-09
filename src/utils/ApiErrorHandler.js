class ApiErrorHandler extends Error {
    constructor(statusCode, message, statck="", errors=[]) {
        super(message);
        this.data = null;
        this.statusCode = statusCode;
        this.message = message;
        this.success = false;
        this.errors = errors;
        
        if(statck)
            this.statck = statck
        else
            Error.captureStackTrace(this, this.constructor);
    }
};

export {ApiError};