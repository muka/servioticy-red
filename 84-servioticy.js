/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";
    var compose = require('compose.io');
//    var OAuth= require('oauth').OAuth;

    function ServioticyNode(n) {
        RED.nodes.createNode(this,n);
        this.screen_name = n.screen_name;
    }
    RED.nodes.registerType("servioticy-credentials",ServioticyNode,{
        credentials: {
            apiKey: { type: "password" },
        }
    });

    function ServioticyInNode(n) {
        RED.nodes.createNode(this,n);
        this.active = true;
        this.user = n.user;
        //this.tags = n.tags.replace(/ /g,'');
        this.tags = n.tags;
        this.servioticy = n.servioticy;
        this.topic = n.topic||"tweets";
        this.servioticyConfig = RED.nodes.getNode(this.servioticy);
        var credentials = RED.nodes.getCredentials(this.servioticy);

        if (credentials && credentials.screen_name == this.servioticyConfig.screen_name) {

            compose.setup(credentials.apiKey);

        } else {
            this.error("missing apiKey");
        }

        this.on('close', function() {
            if (this.stream) {
                this.active = false;
                compose.disconnect();
            }
//            if (this.poll_ids) {
//                for (var i=0;i<this.poll_ids.length;i++) {
//                    clearInterval(this.poll_ids[i]);
//                }
//            }
        });
    }
    RED.nodes.registerType("servioticy in",ServioticyInNode);


    function ServioticyOutNode(n) {
        RED.nodes.createNode(this,n);
        this.topic = n.topic;
        this.servioticy = n.servioticy;
        this.servioticyConfig = RED.nodes.getNode(this.servioticy);
        var credentials = RED.nodes.getCredentials(this.servioticy);
        var node = this;

        if (credentials && credentials.screen_name == this.servioticyConfig.screen_name) {
            var twit = new nservioticy({
                consumer_key: "OKjYEd1ef2bfFolV25G5nQ",
                consumer_secret: "meRsltCktVMUI8gmggpXett7WBLd1k0qidYazoML6g",
                access_token_key: credentials.access_token,
                access_token_secret: credentials.access_token_secret
            }).verifyCredentials(function (err, data) {
                if (err) {
                    node.error("Error verifying credentials: " + err);
                } else {
                    node.on("input", function(msg) {
                        if (msg != null) {
                            if (msg.payload.length > 140) {
                                msg.payload = msg.payload.slice(0,139);
                                node.warn("Tweet greater than 140 : truncated");
                            }
                            twit.updateStatus(msg.payload, function (err, data) {
                                if (err) node.error(err);
                            });
                        }
                    });
                }
            });
        }
    }
    RED.nodes.registerType("servioticy out",ServioticyOutNode);
//
//    var oa = new OAuth(
//        "https://api.servioticy.com/oauth/request_token",
//        "https://api.servioticy.com/oauth/access_token",
//        "OKjYEd1ef2bfFolV25G5nQ",
//        "meRsltCktVMUI8gmggpXett7WBLd1k0qidYazoML6g",
//        "1.0",
//        null,
//        "HMAC-SHA1"
//    );
//
//    RED.httpAdmin.get('/servioticy-credentials/:id/auth', function(req, res){
//        var credentials = {};
//        oa.getOAuthRequestToken({
//                oauth_callback: req.query.callback
//        },function(error, oauth_token, oauth_token_secret, results){
//            if (error) {
//                var resp = '<h2>Oh no!</h2>'+
//                '<p>Something went wrong with the authentication process. The following error was returned:<p>'+
//                '<p><b>'+error.statusCode+'</b>: '+error.data+'</p>'+
//                '<p>One known cause of this type of failure is if the clock is wrong on system running Node-RED.';
//                res.send(resp)
//            } else {
//                credentials.oauth_token = oauth_token;
//                credentials.oauth_token_secret = oauth_token_secret;
//                res.redirect('https://servioticy.com/oauth/authorize?oauth_token='+oauth_token)
//                RED.nodes.addCredentials(req.params.id,credentials);
//            }
//        });
//    });
//
//    RED.httpAdmin.get('/servioticy-credentials/:id/auth/callback', function(req, res, next){
//        var credentials = RED.nodes.getCredentials(req.params.id);
//        credentials.oauth_verifier = req.query.oauth_verifier;
//
//        oa.getOAuthAccessToken(
//            credentials.oauth_token,
//            credentials.token_secret,
//            credentials.oauth_verifier,
//            function(error, oauth_access_token, oauth_access_token_secret, results){
//                if (error){
//                    console.log(error);
//                    res.send("yeah something broke.");
//                } else {
//                    credentials = {};
//                    credentials.access_token = oauth_access_token;
//                    credentials.access_token_secret = oauth_access_token_secret;
//                    credentials.screen_name = "@"+results.screen_name;
//                    RED.nodes.addCredentials(req.params.id,credentials);
//                    res.send("<html><head></head><body>Authorised - you can close this window and return to Node-RED</body></html>");
//                }
//            }
//        );
//    });
}
