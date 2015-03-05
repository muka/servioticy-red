module.exports = function(RED) {
    
    function StreamPush(config) {

        RED.nodes.createNode(this, config);

        this.on('input', function(msg) {
            this.log("Received msg", msg);
        });

        this.on('close', function() {
            // tidy up any state
            this.log("Closing node");
        });

    };

    RED.nodes.registerType("so-stream-push",StreamPush);
};