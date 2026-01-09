class ApiResposeHandler {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.success = true;
        this.data = data;
    }
}

module.exports = ApiResposeHandler;