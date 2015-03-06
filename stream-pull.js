
var apis = require('./apis');

module.exports = function(RED) {

    function StreamPull(config) {

        RED.nodes.createNode(this, config);

        var node = this;

        node.name = config.name;
        node.soid = config.soid;
        node.stream = config.stream && config.stream.length ? config.stream : null;
        node.api = RED.nodes.getNode(config.api);

        var _DBG = false;
        _DBG = true;

        var dbg = function(m) {
            _DBG && node.log( m );
        };

        this.on('input', function(msg) {

            var channelsData;
            // will be used as value for lastUpdate if not specified
            var timestamp = new Date;
            var rawdata = msg.payload;

            dbg("msg " + JSON.stringify(msg));
//
//            if(typeof rawdata === 'string') {
//
//                dbg("Parse payload json: " + rawdata);
//
//                try {
//                    channelsData = JSON.parse(rawdata);
//                }
//                catch(e) {
//
//                    node.error("Cannot parse payload: ");
//                    node.error(e);
//
//                    dbg(rawdata);
//
//                    channelsData = null;
//                }
//            }
//
//            if(channelsData && Object.keys(channelsData).length > 0) {
//
//                apis.getServiceObject({
//                        apiKey: node.api.apiKey,
//                        transport: node.api.transport || "http",
//                        url: node.api.url || "http://api.servioticy.com"
//                    }, node.soid)
//
//                    .then(function(so) {
//
//                        var api = this;
//
//                        var stream = null;
//                        var streamName = node.stream;
//                        if(msg.topic) {
//                            stream = so.getStream(msg.topic);
//                            if(stream) {
//                                streamName = msg.topic;
//                            }
//                        }
//
//                        if(!stream) {
//                            stream = so.getStream(streamName);
//                        }
//
//                        if(!stream) {
//                            return api.lib.Promise.reject(new Error("Stream '"+ streamName +"' not found in " + so.name));
//                        }
//
//                        dbg("Push data to " + so.id + "."+ streamName);
//                        dbg(JSON.stringify(channelsData));
//
//                        if(channelsData.lastUpdate) {
//                            timestamp = new Date(channelsData.lastUpdate);
//                            channelsData = channelsData.channels;
//                        }
//
//                        return stream.push(channelsData, timestamp);
//                    })
//                    .then(function(res) {
//                        dbg(JSON.stringify(res));
//                        dbg("Data sent to " + node.soid);
//                    })
//                    .catch(function(err) {
//                        node.error(err);
//                    });
//
//            }
//            else {
//                node.warn("Payload data cannot be read, push skipped");
//            }

        });

        this.on('close', function() {
            // tidy up any state
            dbg("Closing node");
        });

    };

    RED.nodes.registerType("stream-pull",StreamPull);
};