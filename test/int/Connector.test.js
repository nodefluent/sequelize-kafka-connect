"use strict";

const assert = require("assert");
const Sequelize = require("sequelize");
const { runSourceConnector, runSinkConnector } = require("./../../index.js");
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
                return true;
            });
        });

        it("should be able to await a few pollings", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        })

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
            return runSinkConnector(sinkProperties, [], onError).then(_config => {
                config = _config;
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

        it("should see table data", function() {
            const { database, options, user, password, table } = sinkProperties.connector;
            const sequelize = new Sequelize(database, user, password, options);
            return sequelize.query(`SELECT * FROM ${table}`)
                .then(([results]) => {
                    console.log(results);
                    assert.equal(results.length, 2);
                    sequelize.close();
                    return true;
                });
        });
    });

    describe("Sink with erroneous message", function() {

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

        const brokenTopic = sourceProperties.topic + "_broken";
        let config = null;
        let error = null;

        it("should be able to run sequelize source config", function() {
            const onError = _error => {
                error = _error;
            };

            sourceProperties.topic = brokenTopic;

            return runSourceConnector(sourceProperties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should be able to await a few pollings", function(done) {
            setTimeout(() => {
                assert.ifError(error);
                done();
            }, 4500);
        })

        it("should be able to close configuration", function(done) {
            config.stop();
            setTimeout(done, 1500);
        });

        it("should produce the erroneous message", function(done) {
            const {Producer} = require("sinek");
            const partitions = 1;
            const producer = new Producer(sourceProperties.kafka, [brokenTopic]);
            producer.on("error", error => {
                console.error(error);
                return done();
            });

            producer.connect()
                .then(() => producer.send(brokenTopic, JSON.stringify({payload: "this is wrong"})))
                .then(() => done());
        });

        it("should be able to run sequelize sink config", function() {
            const onError = _error => {
                error = _error;
            };

            sinkProperties.topic = brokenTopic;
            sinkProperties.maxRetries = 2;
            sinkProperties.awaitRetry = 100;
            sinkProperties.haltOnError = true;
            sinkProperties.kafka.logger = {
                debug: function(message) {console.debug(message)},
                info: function(message) {console.info(message)},
                warn: function(message) {console.warn(message)},
                error: function(message) {
                    errorMessages.push(message);
                    console.error(message);
                }
            }

            return runSinkConnector(sinkProperties, [], onError).then(_config => {
                config = _config;
                return true;
            });
        });

        it("should put valid messages and fail on erroneous message", function(done) {
            setTimeout(() => {
                assert.equal(error, "Error: halting because of retry error.");
                done();
            }, 8000);
        })
    });
});
