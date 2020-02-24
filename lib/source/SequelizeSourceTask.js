"use strict";

const { SourceTask, SourceRecord } = require("kafka-connect");
const SqlString = require("sequelize/lib/sql-string");

class SequelizeSourceTask extends SourceTask {

    start(properties, callback, parentConfig) {

        this.parentConfig = parentConfig;

        this.properties = properties;
        const {
            sequelize,
            maxTasks,
            table,
            maxPollCount,
            incrementingColumnName,
            tableSchema
        } = this.properties;

        this.sequelize = sequelize;
        this.maxTasks = maxTasks;
        this.table = table;
        this.maxPollCount = maxPollCount;
        this.incrementingColumnName = incrementingColumnName;
        this.tableSchema = tableSchema;

        this.currentOffset = 0; //TODO fetch from kafka

        callback(null);
    }

    poll(callback) {

        const idColumn = this.incrementingColumnName || "id";
        const query = [
            "SELECT",
            "*",
            "FROM",
            SqlString.escape(this.table),
            "ORDER BY",
            SqlString.escape(idColumn),
            "LIMIT",
            ":limit",
            "OFFSET",
            ":offset"
        ];

        this.sequelize.query(
            query.join(" "), {
                type: this.sequelize.QueryTypes.SELECT,
                replacements: {
                    limit: this.maxPollCount,
                    offset: this.currentOffset,
                }
            }
        ).then(results => {

            this.currentOffset += results.length;

            const records = results.map(result => {

                const record = new SourceRecord();

                record.key = result[idColumn];
                record.keySchema = null;

                if (!record.key) {
                    throw new Error("db results are missing incrementing column name or default 'id' field.");
                }

                record.value = result;
                record.valueSchema = this.tableSchema;

                record.timestamp = new Date().toISOString();
                record.partition = -1;
                record.topic = this.table;

                this.parentConfig.emit("record-read", record.key.toString());
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