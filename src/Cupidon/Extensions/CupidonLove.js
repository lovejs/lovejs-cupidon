const path = require("path");
const _ = require("lodash");
const shortid = require("shortid");
const { errorToJSON } = require("json-error");
const CupidonExtension = require("../CupidonExtension");

class CupidonLove extends CupidonExtension {
    constructor(container, kernel, projectDir) {
        super();
        this.container = container;
        this.kernel = kernel;
        this.projectDir = projectDir;

        setInterval(() => this.emitUsages(), 1500);
    }

    getTitle() {
        return "Love";
    }

    getIcon() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M458.4 64.3C400.6 15.7 311.3 23 256 79.3 200.7 23 111.4 15.6 53.6 64.3-21.6 127.6-10.6 230.8 43 285.5l175.4 178.7c10 10.2 23.4 15.9 37.6 15.9 14.3 0 27.6-5.6 37.6-15.8L469 285.6c53.5-54.7 64.7-157.9-10.6-221.3zm-23.6 187.5L259.4 430.5c-2.4 2.4-4.4 2.4-6.8 0L77.2 251.8c-36.5-37.2-43.9-107.6 7.3-150.7 38.9-32.7 98.9-27.8 136.5 10.5l35 35.7 35-35.7c37.8-38.5 97.8-43.2 136.5-10.6 51.1 43.1 43.5 113.9 7.3 150.8z"/></svg>`;
    }

    getComponent() {
        return __dirname + "/../../_framework/cupidon/extensions/CupidonLove.js";
    }

    emitUsages() {
        this.emit(process.memoryUsage());
    }

    getLove() {
        return {
            version: this.kernel.getVersion()
        };
    }

    getServices() {
        const services = _.map(this.container.getServices(), (service, id) => {
            const tags = service.getTags().map(t => ({ name: t.getName(), data: t.getData() }));

            const module = service.getModule();
            const factory = service.getFactory();
            const alias = service.getAlias();
            let type, from;
            if (module) {
                if (_.isString(module)) {
                    type = "module";
                    from = `${path.relative(this.projectDir, module)}`;
                } else {
                    type = "instance";
                    from = "N/A";
                }
            } else if (factory) {
                type = "factory";
                from = { service: factory.getService(), method: factory.getMethod() };
            } else if (alias) {
                type = "alias";
                from = alias;
            } else {
                type = "Unknow";
                from = "Unknow";
            }

            return {
                id,
                type,
                from,
                tags
            };
        });
        const instances = this.container.getInstancesNames().map(id => ({id, type: "instance", from: "", tags: []}));
 
        return _.sortBy([...services, ...instances], "id");
    }

    getPlugins() {
        return _.orderBy(this.kernel.getPlugins().map(plugin => ({
            name: plugin.name
        })), 'name');
    }

    async getData(query) {
        return {
            love: this.getLove(),
            services: this.getServices(),
            plugins: this.getPlugins()
        };
    }
}

module.exports = CupidonLove;
