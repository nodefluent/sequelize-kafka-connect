"use strict";

const {SinkTask} = require("kafka-connect");

class SequelizeSinkTask extends SinkTask {

    start(properties, callback){
        //stores config
        //opens db connection
        callback();
    }

    put(records, callback){
        //upserts list of SinkRecords into table
        //retries on first fails
        //finally emits specific error to stop offset commits
        callback(null);
    }

    stop(){
        //close db connection
    }
}

module.exports = SequelizeSinkTask;