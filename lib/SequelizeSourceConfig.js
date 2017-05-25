"use strict";

const {SourceConfig} = require("kafka-connect");

class SequelizeSourceConfig extends SourceConfig {

    constructor(...args){ super(...args); }

    run(){
        return super.run();
    }
}

module.exports = SequelizeSourceConfig;