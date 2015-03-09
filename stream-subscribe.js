
var apis = require('./apis');

module.exports = function(RED) {

    function StreamSubscribe(config) {

        RED.nodes.createNode(this, config);

        var node = this;

        node.name = config.name;
        node.soid = config.soid;
        node.stream = config.stream && config.stream.length ? config.stream : null;

        node.api = RED.nodes.getNode(config.api);

        if(!node.soid) {
            node.soid = node.api.soid;
        }

        var _DBG = false;
        _DBG = true;

        var dbg = function(m) {
            _DBG && node.log( m );
        };

        // ensure it's a dual way proto
        var transport = !node.api.transport || node.api.transport === "http" ? 'mqtt' : node.api.transport;

        apis.getServiceObject({
            debug: true,
            apiKey: node.api.apiKey,
            transport: transport || 'mqtt',
            url: node.api.url || "http://api.servioticy.com"
        }, node.soid)

        .then(function(so) {

            var api = this;

            var streamName = node.stream;
            var stream = so.getStream(streamName);

            if(!stream) {
                return api.lib.Promise.reject(new Error("Stream '"+ streamName +"' not found in " + so.name));
            }

            dbg("Subscribing to " + streamName);

            return stream.subscribe(function(data) {

                dbg("Stream "+ streamName +" updated!");
                console.log(data);

                node.send({
                    payload: data
                });

            });
        })
        .catch(function(err) {
            node.error(err);
        });

        this.on('close', function() {
            // tidy up any state
            dbg("Closing node");

        });

    };

    RED.nodes.registerType("stream-subscribe", StreamSubscribe);
};