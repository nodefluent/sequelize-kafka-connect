"use strict";

const { SourceTask, SourceRecord } = require("kafka-connect");

class SequelizeSourceTask extends SourceTask {

    start(properties, callback) {

        this.properties = properties;
        const {
            sequelize,
            maxTasks,
            table,
            maxPollCount,
            incrementingColumnName
        } = this.properties;

        this.sequelize = sequelize;
        this.maxTasks = maxTasks;
        this.table = table;
        this.maxPollCount = maxPollCount;
        this.incrementingColumnName = incrementingColumnName;

        this.currentOffset = 0; //TODO fetch from kafka

        callback(null);
    }

    poll(callback) {

        const query = [
            "SELECT",
            "*",
            "FROM",
            ":table",
            "LIMIT",
            ":limit",
            "OFFSET",
            ":offset"
        ];

        this.sequelize.query(
            query.join(" "), {
                type: this.sequelize.QueryTypes.SELECT,
                replacements: {
                    table: this.table,
                    limit: this.maxPollCount,
                    offset: this.currentOffset
                }
            }
        ).then(results => {

            this.currentOffset += results.length;

            const records = results.map(result => {

                const record = new SourceRecord();
                //TODO evaluate more record fields
                record.value = result;
                return record;
            });

            callback(null, records);
        }).catch(error => {
            callback(error);
        });
    }

    stop() {
        //empty (con is closed by connector)
    }
}

module.exports = SequelizeSourceTask;