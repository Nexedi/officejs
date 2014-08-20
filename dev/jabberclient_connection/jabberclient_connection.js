/*global window, rJS, Strophe, $, $iq, Handlebars,
  XMLSerializer, DOMParser, RSVP, sessionStorage, promiseEventListener*/
/*jslint nomen: true*/
(function($, Strophe, rJS, Handlebars) {
    "use strict";
    var gadget_klass = rJS(window), login_template_source = gadget_klass.__template_element.querySelector(".login-template").innerHTML, login_template = Handlebars.compile(login_template_source), logout_template_source = gadget_klass.__template_element.querySelector(".logout-template").innerHTML, logout_template = Handlebars.compile(logout_template_source);
    function parseXML(xmlString) {
        return new DOMParser().parseFromString(xmlString, "text/xml").children[0];
    }
    function serializeXML(xml) {
        return new XMLSerializer().serializeToString(xml);
    }
    function logout(gadget, authfail) {
        sessionStorage.removeItem("connection_params");
        return gadget.render({
            authfail: authfail
        });
    }
    function showLogout(gadget) {
        return new RSVP.Queue().push(function() {
            var jid = Strophe.getBareJidFromJid(gadget.props.connection.jid);
            $(gadget.__element).html(logout_template({
                server: gadget.props.connection.service,
                jid: jid
            }));
        }).push(function() {
            return promiseEventListener(gadget.__element.querySelector(".logout-box button"), "click", false);
        }).push(function() {
            if (gadget.props.connection) {
                gadget.props.connection.disconnect();
            }
        });
    }
    function setInputListener(gadget) {
        return new RSVP.Promise(function(resolveInputAssignment) {
            function canceller() {
                if (gadget.props.connection && gadget.props.connection.xmlInput) {
                    delete gadget.props.connection.xmlInput;
                }
            }
            function resolver(resolve, reject) {
                gadget.props.connection.xmlInput = function(domElement) {
                    try {
                        [].forEach.call(domElement.children, function(child) {
                            gadget.manageService(gadget.receive(serializeXML(child)));
                        });
                    } catch (e) {
                        reject(e);
                    }
                };
                resolveInputAssignment();
            }
            gadget.manageService(new RSVP.Promise(resolver, canceller));
        });
    }
    function login(gadget, params) {
        return new RSVP.Queue().push(function() {
            return setInputListener(gadget);
        }).push(function() {
            sessionStorage.setItem("connection_params", JSON.stringify(params));
        }).push(function() {
            return gadget.props.connection.send($iq({
                type: "get"
            }).c("query", {
                xmlns: "jabber:iq:roster"
            }).tree());
        }).push(function() {
            return gadget.loadGadgetAfterLogin();
        });
    }
    function connectionListener(gadget, params) {
        var connection = new Strophe.Connection(params.server), connection_callback, authfail = false;
        gadget.props.connection = connection;
        function canceller() {
            if (connection_callback !== undefined) {
                connection.disconnect();
            }
        }
        function resolver(resolve, reject) {
            connection_callback = function(status) {
                new RSVP.Queue().push(function() {
                    if (status === Strophe.Status.CONNECTED) {
                        authfail = false;
                        return login(gadget, params);
                    }
                    if (status === Strophe.Status.DISCONNECTED) {
                        return logout(gadget, authfail);
                    }
                    if (status === Strophe.Status.CONNFAIL || status === Strophe.Status.AUTHFAIL) {
                        authfail = true;
                    }
                }).fail(function(e) {
                    reject(e);
                });
            };
            connection.connect(params.jid, params.passwd, connection_callback);
        }
        return new RSVP.Promise(resolver, canceller);
    }
    function showLogin(gadget, options) {
        var params = {
            server: options.server
        };
        return new RSVP.Queue().push(function() {
            if (options && options.authfail) {
                params.authfail = true;
            }
            $(gadget.__element).html(login_template(params));
        }).push(function() {
            return promiseEventListener(gadget.__element.querySelector("form.login-form"), "submit", false);
        }).push(function(submit_event) {
            $(submit_event.target).serializeArray().forEach(function(field) {
                params[field.name] = field.value;
            });
            gadget.manageService(connectionListener(gadget, params));
        });
    }
    gadget_klass.declareAcquiredMethod("manageService", "manageService").declareAcquiredMethod("loadGadgetAfterLogin", "loadGadgetAfterLogin").declareMethod("isConnected", function() {
        if (this.props.connection) {
            return this.props.connection.connected;
        }
        return false;
    }).declareAcquiredMethod("receive", "receive").declareMethod("getConnectionJID", function() {
        return Strophe.getBareJidFromJid(this.props.connection.jid);
    }).declareMethod("send", function(xmlString) {
        return this.props.connection.send(parseXML(xmlString));
    }).declareMethod("logout", function() {
        logout(this);
    }).declareAcquiredMethod("renderConnection", "renderConnection").declareMethod("tryAutoConnect", function(options) {
        var params = JSON.parse(sessionStorage.getItem("connection_params"));
        if (params !== null && typeof params === "object" && Object.keys(params).length === 3) {
            this.manageService(connectionListener(this, params));
        } else {
            return this.renderConnection(options);
        }
    }).ready(function(g) {
        g.props = {};
    }).declareAcquiredMethod("pleaseRedirectMyHash", "pleaseRedirectMyHash").declareAcquiredMethod("getHash", "getHash").declareMethod("render", function(options) {
        if (options.server === undefined) {
            options.server = "https://mail.tiolive.com/chat/http-bind/";
            return this.getHash(options).push(this.pleaseRedirectMyHash.bind(this));
        }
        if (this.props.connection && this.props.connection.authenticated) {
            return showLogout(this);
        }
        return showLogin(this, options);
    });
})($, Strophe, rJS, Handlebars);