# sequelize-kafka-connect

Node.js Kafka Connect connector for MySQL, Postgres, SQLite and MSSQL databases

[![Build Status](https://travis-ci.org/nodefluent/sequelize-kafka-connect.svg?branch=master)](https://travis-ci.org/nodefluent/sequelize-kafka-connect)

[![Coverage Status](https://coveralls.io/repos/github/nodefluent/sequelize-kafka-connect/badge.svg?branch=master)](https://coveralls.io/github/nodefluent/sequelize-kafka-connect?branch=master)

## Use API

```
npm install --save sequelize-kafka-connect
```

## A note on native mode

If you are using the native mode (`config: { noptions: {} }`).
You will have to manually install `node-rdkafka` alongside kafka-connect.
(This requires a Node.js version between 9 and 12 and will not work with Node.js >= 13, last tested with 12.16.1)

On Mac OS High Sierra / Mojave:
`CPPFLAGS=-I/usr/local/opt/openssl/include LDFLAGS=-L/usr/local/opt/openssl/lib yarn add --frozen-lockfile node-rdkafka@2.7.4`

Otherwise:
`yarn add --frozen-lockfile node-rdkafka@2.7.4`

(Please also note: Doing this with npm does not work, it will remove your deps, `npm i -g yarn`)

### database -> kafka

```es6
const { runSourceConnector } = require("sequelize-kafka-connect");
runSourceConnector(config, [], onError).then(config => {
    //runs forever until: config.stop();
});
```

### kafka -> database

```es6
const { runSinkConnector } = require("sequelize-kafka-connect");
runSinkConnector(config, [], onError).then(config => {
    //runs forever until: config.stop();
});
```

### kafka -> database (with custom topic (no source-task topic))

```es6
const { runSinkConnector, ConverterFactory } = require("sequelize-kafka-connect");

const tableSchema = {
    "id": {
        "type": "integer",
        "allowNull": false,
        "primaryKey": true
    },
    "name": {
        "type": "varchar(255)",
        "allowNull": true
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

    callback(new Error("unknown messageValue.type"));
};

const converter = ConverterFactory.createSinkSchemaConverter(tableSchema, etlFunc);

runSinkConnector(config, [converter], onError).then(config => {
    //runs forever until: config.stop();
});

/*
    this example would be able to store kafka message values
    that look like this (so completely unrelated to messages created by a default SourceTask)
    {
        payload: {
            id: 123,
            name: "bla"
        },
        type: "publish"
    }
*/
```

## Use CLI
note: in BETA :seedling:

```
npm install -g sequelize-kafka-connect
```

```
# run source etl: database -> kafka
nkc-sequelize-source --help
```

```
# run sink etl: kafka -> database
nkc-sequelize-sink --help
```

## Config(uration)
```es6
const config = {
    kafka: {
        //zkConStr: "localhost:2181/",
        kafkaHost: "localhost:9092",
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
            requireAcks: 1,
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
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: true,
    batch: {
        batchSize: 100, 
        commitEveryNBatch: 1, 
        concurrency: 1,
        commitSync: true
    }
};
```

## Native Clients Config(uration)
```es6
const config = {
   
    kafka: {
        noptions: {
            "metadata.broker.list": "localhost:9092",
            "group.id": "n-test-group",
            "enable.auto.commit": false,
            "debug": "all",
            "event_cb": true,
            "client.id": "kcs-test"
        },
        tconf: {
            "auto.offset.reset": "earliest",
            "request.required.acks": 1
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
    },
    http: {
        port: 3149,
        middlewares: []
    },
    enableMetrics: true
};
```