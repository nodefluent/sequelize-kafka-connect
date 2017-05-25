"use strict";

const {SinkConfig} = require("kafka-connect");

class SequelizeSinkConfig extends SinkConfig {

    constructor(...args){ super(...args); }

    run(){
        return super.run();
    }
}

module.exports = SequelizeSinkConfig;