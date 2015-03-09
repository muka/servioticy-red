
var apis = require('./apis');

var Promise = apis.Promise;

module.exports = function (RED) {

    function StreamPull(config) {

        RED.nodes.createNode(this, config);

        var node = this;

        node.name = config.name;
        node.soid = config.soid;

        node.stream = config.stream && config.stream.length ? config.stream : null;

        node.fetchType = config.fetchType;
        node.filter = config.filter || '{}';

        node.api = RED.nodes.getNode(config.api);

        if(!node.soid) {
            node.soid = node.api.soid;
        }

        var _DBG = false;
//        _DBG = true;

        var dbg = function (m) {
            _DBG && node.log(m);
        };

        this.on('input', function (msg) {

            dbg("msg " + JSON.stringify(msg));

            apis.getServiceObject({
                apiKey: node.api.apiKey,
                transport: node.api.transport || "http",
                url: node.api.url || "http://api.servioticy.com"
            }, node.soid)

            .then(function (so) {

                var api = this;

                var stream = null;
                var streamName = node.stream;
                if (msg.topic) {
                    stream = so.getStream(msg.topic);
                    if (stream) {
                        streamName = msg.topic;
                    }
                }

                if (!stream) {
                    stream = so.getStream(streamName);
                }

                if (!stream) {
                    return api.lib.Promise.reject(new Error("Stream '" + streamName + "' not found in " + so.name));
                }


                var searchFilter = node.filter;
                if (msg.filter) {
                    searchFilter = msg.filter;
                }

                (function() {

                    if(node.fetchType === '__filter') {
                        if(searchFilter) {
                            if(typeof searchFilter === 'string') {
                                try {
                                    searchFilter = JSON.parse(searchFilter);
                                }
                                catch(e) {

                                    node.error("Cannot parse search filter: " + searchFilter);
                                    return Promise.reject(e);
                                }
                            }
                        }

                        dbg("Searching data in " + so.id + "." + streamName + " with filter " + JSON.stringify(searchFilter));
                        return stream.search(searchFilter);
                    }
                    else {

                        var type = node.fetchType ? node.fetchType : null;
                        dbg("Fetching "+ ( type ? type : "all" ) +" data from " + so.id + "." + streamName);
                        return stream.pull(type);
                    }

                })()

                .then(function (dataset) {

                    dbg("Found " + dataset.size() + " records");

                    if(dataset.size() === 0) {
                        node.info("No data found for " + so.id + "." + streamName +
                            (searchFilter ?
                                " with filter: " +
                                    (typeof searchFilter === 'string' ?
                                        searchFilter : JSON.stringify(searchFilter))
                                : ""));
                    }

                    // iterate results
                    while (dataset.next()) {

                        // current return the data stored at the position of the internal cursor
                        var dataobj = dataset.current();
                        var value = dataobj.asObject();

                        node.send({
                            topic: streamName,
                            lastUpdate: dataobj.lastUpdate,
                            payload: value
                        });

                    }

                    return Promise.resolve();
                });
            })
//                    .then(function (res) {
//                        dbg("Data sent to " + node.soid);
//                    })
            .catch(function (err) {
                node.error(err);
            });

        });

        this.on('close', function () {
            // tidy up any state
            dbg("Closing node");
        });

    }
    ;

    RED.nodes.registerType("stream-pull", StreamPull);
};