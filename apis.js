
var lib = module.exports;

var compose = require('compose.io');

var Promise = compose.require('bluebird');

var soCache = {};
var apiCache = {};

lib.get = function(apiConfig) {

    if(apiConfig.apiKey && apiCache[ apiConfig.apiKey ]) {
        return Promise.resolve(apiCache[ apiConfig.apiKey ]);
    }

    return compose.setup(apiConfig).then(function(api) {
        apiCache[ apiConfig.apiKey ] = api;
        return Promise.resolve(api);
    });
};

lib.getServiceObject = function(apiConfig, soid) {
    return lib.get(apiConfig).then(function(api) {

        var apiKey = apiConfig.apiKey;

        if(soCache[ apiKey ] && soCache[ apiKey ][ soid ]) {
            var so = new api.ServiceObject(soCache[ apiKey ][ soid ]);
            return Promise.resolve(so).bind(api);
        }

        return api.load(soid).then(function(so) {

            soCache[ apiKey ] = soCache[ apiKey ] || {};
            soCache[ apiKey ][ soid ] = so.toJson();

            return Promise.resolve(so).bind(api);
        });
    });
};
