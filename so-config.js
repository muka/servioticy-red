module.exports = function (RED) {

    var SoConfig = function(config) {

        RED.nodes.createNode(this, config);

//        console.log("SoConfig -.----- ", config);

        this.name = config.name;
        this.soid = config.soid;
//        this.api = RED.nodes.getNode(config.api);

    };

    RED.nodes.registerType("so-config", SoConfig);
};