"use strict";

const { SinkTask } = require("kafka-connect");

class SequelizeSinkTask extends SinkTask {

    start(properties, callback) {

        this.properties = properties;
        const {
            sequelize,
            maxTasks,
            table,
            incrementingColumnName
        } = this.properties;

        this.sequelize = sequelize;
        this.maxTasks = maxTasks;
        this.table = table;
        this.incrementingColumnName = incrementingColumnName;

        //TODO check if table exists or create it

        callback(null);
    }

    put(records, callback) {

        records.forEach(record => console.log(record));

        //TODO
        //create model if not already present
        //run sequelize sync with model if not already done
        //upsert for key.toString() into table

        callback(null);
    }

    stop() {
        //empty (con is closed by connector)
    }
}

module.exports = SequelizeSinkTask;