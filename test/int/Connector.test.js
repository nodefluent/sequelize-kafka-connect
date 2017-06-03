"use strict";

const assert = require("assert");
const Sequelize = require("sequelize");
const { SourceRecord } = require("kafka-connect");
const uuid = require("uuid");
const { Producer } = require("sinek");

const { runSourceConnector, runSinkConnector, ConverterFactory } = require("./../../index.js");
const sinkProperties = require("./../sink-config.js");
const sourceProperties = require("./../source-config.js");

describe("Connector INT", function() {

    describe("Source", function() {

        let config = null;
        let error = null;

        it("should be able to run sequelize source config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSourceConnector(sourceProperties, [], onError).then(_config => {
                config = _config;
                config.on("record-read", id => console.log("read: " + id));
                return true;
            });
        });

        it("should be able to await a few pollings", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        });

        it("should be able to fake a delete action", function() {

            const record = new SourceRecord();
            record.key = "1";
            record.value = null; //will cause this record to be deleted when read by sink-task

            return config.produce(record);
        });

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 1500);
        });
    });

    describe("Sink", function() {

        before((done) => {
            const { database, options, user, password, table } = sinkProperties.connector;
            const sequelize = new Sequelize(database, user, password, options);
            sequelize.query(`DROP TABLE IF EXISTS ${table}`)
                .catch(error => console.log(error))
                .then(() => {
                    sequelize.close();
                    done();
                });
        });

        let config = null;
        let error = null;

        it("should be able to run sequelize sink config", function() {
            const onError = _error => {
                error = _error;
            };
            return runSinkConnector(Object.assign({}, sinkProperties, { enableMetrics: true }), [], onError).then(_config => {
                config = _config;
                config.on("model-upsert", id => console.log("upsert: " + id));
                config.on("model-delete", id => console.log("delete: " + id));
                return true;
            });
        });

        it("should be able to await a few message puts", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        })

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 1500);
        });

        it("should be able to see table data", function() {
            const { database, options, user, password, table } = sinkProperties.connector;
            const sequelize = new Sequelize(database, user, password, options);
            return sequelize.query(`SELECT * FROM ${table}`)
                .then(([results]) => {
                    console.log(results);
                    assert.equal(results.length, 1);
                    sequelize.close();
                    return true;
                });
        });
    });

    describe("Converter Factory", function() {

        let config = null;
        let error = null;
        let topic = "sc_test_topic_2";
        let converter = {};
        let producer = null;

        it("should be able to create custom converter", function(done) {

            const tableSchema = {
                "id": {
                    "type": "integer",
                    "allowNull": false,
                    "primaryKey": true
                },
                "name": {
                    "type": "varchar(255)",
                    "allowNull": true,
                    "primaryKey": false
                }
            };

            const etlFunc = (messageValue, callback) => {

                //type is an example json format field
                if (messageValue.type === "publish") {
                    return callback(null, {
                        id: messageValue.payload.id,
                        name: messageValue.payload.name
                    });
                }

                if (messageValue.type === "unpublish") {
                    return callback(null, null); //null value will cause deletion
                }

                console.log(messageValue);
                throw new Error("unknown messageValue.type");
            };

            converter = ConverterFactory.createSinkSchemaConverter(tableSchema, etlFunc);

            const aFakeKafkaMessage = {
                partition: 0,
                topic: "bla",
                value: {
                    payload: {
                        id: "123",
                        name: "bla-blup"
                    },
                    type: "publish"
                },
                offset: 1,
                key: Buffer.from("123", "utf8")
            };

            converter.toConnectData(Object.assign({}, aFakeKafkaMessage), (error, message) => {

                assert.ifError(error);
                assert.deepEqual(message.value.valueSchema, tableSchema);
                assert.deepEqual(message.value.value, {
                    id: "123",
                    name: "bla-blup"
                });
                assert.ok(message.key);
                assert.ok(message.value.key);

                converter.toConnectData(Object.assign({}, aFakeKafkaMessage), (error, message) => {

                    assert.ifError(error);
                    assert.deepEqual(message.value.valueSchema, tableSchema);
                    assert.deepEqual(message.value.value, {
                        id: "123",
                        name: "bla-blup"
                    });
                    assert.ok(message.key);
                    assert.ok(message.value.key);

                    done();
                });
            });
        });

        it("should be able to produce a few messages", function() {
            producer = new Producer(sinkProperties.kafka, topic, 1);
            return producer.connect().then(_ => {
                return Promise.all([
                    producer.buffer(topic, "3", { payload: { id: 3, name: "test1" }, type: "publish" }),
                    producer.buffer(topic, "4", { payload: { id: 4, name: "test2" }, type: "publish" }),
                    producer.buffer(topic, "3", { payload: null, type: "unpublish" })
                ]);
            });
        });

        it("should be able to await a few broker interactions", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 1500);
        });

        it("shoud be able to sink message through custom converter", function() {
            const onError = _error => {
                error = _error;
            };

            const customProperties = Object.assign({}, sinkProperties, { topic });
            return runSinkConnector(customProperties, [converter], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few message puts", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        });

        it("should be able to close configuration", function(done) {
            config.stop();
            producer.close();
            setTimeout(done, 1500);
        });

        it("should be able to see table data", function() {
            const { database, options, user, password, table } = sinkProperties.connector;
            const sequelize = new Sequelize(database, user, password, options);
            return sequelize.query(`SELECT * FROM ${table}`)
                .then(([results]) => {
                    console.log(results);
                    assert.equal(results.length, 2);
                    assert.deepEqual(results, [{ id: 2, name: "bob" }, { id: 4, name: "test2" }]);
                    sequelize.close();
                    return true;
                });
        });
    });
});