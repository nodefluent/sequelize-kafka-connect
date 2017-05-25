"use strict";

const {SourceConnector} = require("kafka-connect");

class SequelizeSourceConnector extends SourceConnector {

    start(properties, callback){
        //reads config
        //opens db connection
        //tests initial connection
        //starts table monitor thread
        callback(null);
    }

    taskConfigs(maxTasks, callback){
        //reads config
        //reads tables from table monitor
        //returns a map of task properties
        callback(null, {});
    }

    stop(){
        //kills table monitor thread
        //closes db connection
    }
}

module.exports = SequelizeSourceConnector;