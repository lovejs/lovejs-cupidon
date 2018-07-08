const _ = require("lodash");
const path = require("path");
const fs = require("fs");
const sender = require("koa-send");
const builder = require("@lovejs/cupidon-client");
const WebSocket = require("ws");

class Cupidon {
    constructor(build_path) {
        this.extensions = {};
        this.builded = false;
        this.build_path = build_path;
        this.build_index = path.resolve(build_path, "/index.html");
        this.http_server = null;
        this.ws_server = null;
        this.contexts = [];
        this.statistics = {
            requests: 0,
            errors: 0
        };
    }

    registerExtensions(extensions) {
        for (let name in extensions) {
            this.registerExtension(name, extensions[name]);
        }
    }

    registerExtension(name, extension) {
        extension.setDataEmitter(data => this.extensionBroadcast(name, data));
        this.extensions[name] = extension;
    }

    attachToServer(http_server) {
        this.http_server = http_server;
    }

    addContext(context) {
        this.contexts.push(context);
    }

    getContexts() {
        return this.contexts;
    }

    getStatistics() {
        return this.statistics;
    }

    listen() {
        this.ws_server = new WebSocket.Server({ server: this.http_server, path: "/__cupidon" });
        this.ws_server.on("connection", ws => {
            ws.on("message", function incoming(message) {
                console.log("received: %s", message);
            });
        });
    }

    async handleContextResponse(event) {
        const context = event.getData();
        this.broadcast(context);
    }

    async handleContextError(event) {
        const { context, error } = event.getData();
        this.broadcast(context, error);
    }

    extensionBroadcast(ext, data) {
        return this.broadcast({ ext, data });
    }

    broadcast(data) {
        this.ws_server &&
            this.ws_server.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
    }

    /**
     * Check if a build exists
     */
    async buildExists() {
        return new Promise((resolve, reject) => fs.exists(this.build_index, exists => resolve(exists)));
    }

    /**
     * Build if build doesn't exists or forced
     */
    async build(force) {
        if (this.building) {
            return;
        }

        if (force || !(await this.buildExists())) {
            this.building = true;
            const result = await builder({
                outputPath: this.build_path,
                extensions: _.map(this.extensions, (extension, name) => ({ name, ...extension.toJSON() }))
            });

            this.builded = true;
            this.building = false;

            return result;
        }
    }

    async handleRequest(context, query) {
        if (!this.builded) {
            //await this.build();
        }

        if (query !== "query") {
            return this.serveSpa(context, query);
        } else {
            return (context.body = await this.resolveQuery(context.query));
        }
    }

    async serveSpa(context, query) {
        const opts = { root: this.build_path };
        try {
            await sender(context, query || "index.html", opts);
        } catch (error) {
            context.throw(404, "Missing cupidon files.");
        }
    }

    async resolveQuery(params) {
        const { ext, query, ...rest } = params;
        if (!ext || !this.extensions[ext]) {
            return [];
        }

        return await this.extensions[ext].getData(query, rest || {});
    }
}

module.exports = Cupidon;
