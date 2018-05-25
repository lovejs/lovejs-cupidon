const _ = require("lodash");
const { Middleware } = require("@lovejs/components/middlewares");

class CupidonMiddleware extends Middleware {
    constructor(cupidon) {
        super();
        this.cupidon = cupidon;
    }

    getMiddleware() {
        return async (context, next) => {
            const query = context.getPathParameter("query");           
            return this.cupidon.handleRequest(context, query);
        };
    }
}

module.exports = CupidonMiddleware;
