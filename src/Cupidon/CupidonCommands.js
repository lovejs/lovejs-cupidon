const { Command } = require("@lovejs/components/console");
const _ = require("lodash");

class CupidonCompileCommand extends Command {
    constructor(cupidon) {
        super();
        this.cupidon = cupidon;
    }

    register(program) {
        program
            .command("cupidon:compile")
            .description("Compile Cupidon")
            .action(this.build.bind(this));

        program
            .command("cupidon:clean")
            .description("Clear Cupidon build directory")
            .action(this.clear.bind(this));
    }

    async build() {
        await this.cupidon.build(true);
        this.output("[success]Cupidon compiled.[/success]\n");
    }

    async clear() {
        await this.cupidon.clear();
    }
}

module.exports = CupidonCompileCommand;
