"use strict";

const path = require("path");
const defaultConfig = require("./default.js");

function isObject(item) {
    return (item && typeof item === "object" && !Array.isArray(item) && item !== null);
}

function mergeDeep(target, source) {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, {
                        [key]: source[key]
                    });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, {
                    [key]: source[key]
                });
            }
        });
    }
    return output;
}

function loadConfig(uri = null, configPath = "./../config/default.js") {

    if (uri) {
        if (path.isAbsolute(uri)) {
            configPath = uri;
        } else {
            configPath = path.join(path.dirname(process.argv[1]), uri);
        }
    }

    let config = require(configPath);

    if (!config || typeof config !== "object") {
        return console.log("Failed to load config @ " + configPath);
    }

    return mergeDeep(defaultConfig, config);
}

module.exports = loadConfig;