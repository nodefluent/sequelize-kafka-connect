# sequelize-kafka-connect
Node.js Kafka Connect connector for MySQL, Postgres, SQLite and MSSQL databases

[![Build Status](https://travis-ci.org/nodefluent/sequelize-kafka-connect.svg?branch=master)](https://travis-ci.org/nodefluent/sequelize-kafka-connect)

[![Coverage Status](https://coveralls.io/repos/github/nodefluent/sequelize-kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/sequelize-kafka-connect?branch=master)

## info
* not yet 100% done (almost :P)

## install
```
npm install --save sequelize-kafka-connect
```

## use

### database -> kafka

```es6
const { runSourceConnector } = require("sequelize-kafka-connect");
runSourceConnector(config, [], onError).then(config => {
    //runs forever until:
    config.stop();
});
```

### kafka -> database

```es6
const { runSinkConnector } = require("sequelize-kafka-connect");
runSinkConnector(config, [], onError).then(config => {
    //runs forever until:
    config.stop();
});
```

## config(uration)
```es6
const config = {
    kafka: {
        zkConStr: "localhost:2181/",
        logger: null,
        groupId: "kc-sequelize-test",
        clientName: "kc-sequelize-test-name",
        workerPerPartition: 1,
        options: {
            sessionTimeout: 8000,
            protocol: ["roundrobin"],
            fromOffset: "earliest", //latest
            fetchMaxBytes: 1024 * 100,
            fetchMinBytes: 1,
            fetchMaxWaitMs: 10,
            heartbeatInterval: 250,
            retryMinTimeout: 250,
            autoCommit: true,
            autoCommitIntervalMs: 1000,
            requireAcks: 0,
            //ackTimeoutMs: 100,
            //partitionerType: 3
        }
    },
    topic: "sc_test_topic",
    partitions: 1,
    maxTasks: 1,
    pollInterval: 2000,
    produceKeyed: true,
    produceCompressionType: 0,
    connector: {
        options: {
            host: "localhost",
            port: 5432,
            dialect: "sqlite",
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },
            storage: path.join(__dirname, "test-db.sqlite")
        },
        database: null,
        user: null,
        password: null,
        maxPollCount: 50,
        table: "accounts",
        incrementingColumnName: "id"
    }
};
```