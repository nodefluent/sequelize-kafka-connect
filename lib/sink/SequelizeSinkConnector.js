"use strict";

const {SinkConnector} = require("kafka-connect");

class SequelizeSinkConnector extends SinkConnector {

    start(properties, callback){
        //stores properties
        callback();
    }

    taskConfigs(maxTasks, callback){
        //reads config
        //returns map of task properties
        callback(null, {});
    }

    stop(){
        //does nothing
    }
}

module.exports = SequelizeSinkConnector;