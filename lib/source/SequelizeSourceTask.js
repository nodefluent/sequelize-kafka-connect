"use strict";

const {SourceTask} = require("kafka-connect");

class SequelizeSourceTask extends SourceTask {

    start(properties, callback){
        //reads config
        //opens db connection
        //reads offsets for table?
        callback();
    }

    stop(){
        //close db connection
    }

    poll(callback){
        //polls the table
        //returns a list of SourceRecords
        callback(null, records);
    }
}

module.exports = SequelizeSourceTask;