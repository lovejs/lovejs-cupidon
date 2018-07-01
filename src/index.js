const { Plugin } = require("@lovejs/framework");

class CupidonPlugin extends Plugin {
    async registerServices(container, origin) {
        container.setParameter("cache.configuration", this.get());
        await container.loadDefinitions(__dirname + "/_framework/services/services.yml", origin);
    }

    async boot(container, logger, isCli) {
        if (isCli) {
            return;
        }

        const cupidon = await container.get("cupidon");
        const server = this.get("server", "http.server");
        cupidon.attachToServer(await container.get(server));
        await cupidon.listen();
        logger.info(`Cupidon attached to server ${server} and listening`);
    }
}

module.exports = CupidonPlugin;
