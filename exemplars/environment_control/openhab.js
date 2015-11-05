"use strict";

(function(window){
	var SERVER = "https://cors-anywhere.herokuapp.com/http://demo.openhab.org:9080/rest/sitemaps/demo";

    // Use "widgets" for OpenHAB 2.x
    //var WIDGETS_PROPERTY = "widgets";
    // and "widget" for OpenHAB 1.x
    var WIDGETS_PROPERTY = "widget";

	// Error codes (mostly following Android error names and codes)
	var ERR_NETWORK = 2;
	var ERR_AUDIO = 3;
	var ERR_SERVER = 4;
	var ERR_CLIENT = 5;

	// Event codes
	var MSG_DOWNLOADING_SITEMAP = 1;
	var MSG_DOWNLOADED_SITEMAP = 2;
	var MSG_INIT_RECORDER = 3;
	var MSG_RECORDING = 4;
	var MSG_SEND = 5;
	var MSG_SEND_EMPTY = 6;
	var MSG_SEND_EOS = 7;
	var MSG_WEB_SOCKET = 8;
	var MSG_WEB_SOCKET_OPEN = 9;
	var MSG_WEB_SOCKET_CLOSE = 10;
	var MSG_STOP = 11;
	var MSG_SERVER_CHANGED = 12;

	var Openhab = function(cfg) {
		var config = cfg || {};
		config.server = config.server || SERVER;
		config.onInited = config.onInited || function() {};
		config.onEvent = config.onEvent || function(e, data) {};
		config.onError = config.onError || function(e, data) {};
		config.onNavigated = config.onNavigated || function() {};
		config.onActionChanged = config.onActionChanged || function(action) {};

        config.sitemap = null;

        // This is a list of path elements
        // Each path element contains:
        //  - Name: string to display in the breadcrumb widget
        //  - Keys: list is in order to allow jumping several levels at once (for frames or groups)
        config.currentState = [];

        // States
        this.NOT_INITED = 1;
        this.INITED = 2;

        this.state = this.NOT_INITED;

		// Returns the configuration
		this.getConfig = function() {
			return config;
		}

        this.setSitemap = function(sitemap) {
            this.sitemap = sitemap;
        }

		// Downloads the sitemap
		this.init = function() {
			config.onEvent(MSG_DOWNLOADING_SITEMAP, "Downloading sitemap ...");
            var request = $.ajax({
                    type       : "GET",
                    url        : config.server,
                    data       : {type: "json"}
                });

            request.done( function(data) {
                config.sitemap = data;
                config.onEvent(MSG_DOWNLOADED_SITEMAP, "Downloaded sitemap ...");

                config.onInited();
            });

            request.fail( function(jqXHR, textStatus )
            {
                config.onError(ERR_CLIENT, "Failed to download sitemap : " + textStatus);
            });

			this.state = this.INITED;
		}

        // Get current choices
        this.getCurrentActions = function() {
            var current_map = this.getCurrentMap();

            var choices = map_to_choices(current_map, []);

            return choices;
        }

        function map_to_choices(map, path_prefix) {
            var result = [];
            for (var i=0; i<map[WIDGETS_PROPERTY].length; i++) {
                result = result.concat(widget_to_choices(map[WIDGETS_PROPERTY][i], path_prefix.concat([WIDGETS_PROPERTY, i])));
            }

            return result;
        }

        function label_to_command(label) {
            return label;
        }

        function widget_to_choices(widget, path_prefix) {
            var result = [];
            switch(widget.type) {
                case "Group":
                    result = [{
                                type: "navigation",
                                parameters: {
                                    label: widget.label,
                                    speech_command: widget.label,
                                    path: {
                                        name: widget.label,
                                        keys: path_prefix.concat(["linkedPage"])
                                    }
                                }
                            }];
                    break;

                case "Frame":
                    result = map_to_choices(widget, path_prefix);
                    break;

                case "Text":
                    if (widget.linkedPage) {
                        result = [{
                                    type: "navigation",
                                    parameters: {
                                        label: widget.label,
                                        speech_command: widget.label,
                                        path: {
                                            name: widget.label,
                                            keys: path_prefix.concat(["linkedPage"])
                                        }
                                    }
                                }];
                    } else {
                        result = [{
                                    type: "label",
                                    parameters: {
                                        label: widget.label,
                                    }
                                }];
                    }
                    break;

                case "Switch":
                    result = [{
                                type: "switch",
                                parameters: {
                                    label: widget.label,
                                    widget: widget,
                                }
                            }];
                    break;

                default:
                    console.warn("Case " + widget.type + " not handled.");
                    break;
            }

            return result;
        }

        this.getState = function() {
            return config.currentState;
        }

        this.setState = function(state) {
            config.currentState = state;
            config.onNavigated();
        }

        function update_switch(link, button, data) {
            var command = "GET";
            var suffix = "/state"
            if (data) {
                command = "POST";
                suffix = "";
            }

            // Get the state of the switch
            var url = CORS_PROXY + link;
            button.button('loading');
            $.ajax({
                url: url + suffix,
                method: command,
                data: data,
                dataType: "text",
                contentType: "text/plain",
                context: { $button: button,
                          },
                success: function (state) {
                    console.dir(state);
                    if (data) {
                        update_switch(link, button);

                    } else {
                        if (state=="ON") {
                            this.$button.button('on');
                            this.$button.addClass('active');
                            this.$button.attr('aria-pressed', 'true');
                        } else {
                            this.$button.button('off');
                            this.$button.removeClass('active');
                            this.$button.attr('aria-pressed', 'false');
                        }

                        this.$button.data("state", state);
                    }
                },
                fail: function () {},
            });
        }


        this.performAction = function(action) {
            switch(action.type) {
                case "navigation":
                    config.currentState.push(action.parameters.path);
                    config.onNavigated();
                    break;

                case "switch":
                    // TODO: implement a switch toggle
                    console.dir(action);

                    var current_state;

                    $.ajax({
                        method: "GET",
                        dataType: "text",
                        contentType: "text/plain",
                        url: action.parameters.widget.item.link + "/state",
                        success: function (result) {
                            current_state = result;
                        },
                        async: false
                    });

                    $.ajax({
                        url: action.parameters.widget.item.link,
                        method: "POST",
                        dataType: "text",
                        contentType: "text/plain",
                        data: current_state=="ON" ? "OFF" : "ON",
                        success: function (result) {
                            current_state = result;
                        },
                        async: false
                    });

                    config.onActionChanged(action);

                    break;

                default:
                    console.error("Action " + action.type + "not yet implmented.");
                    break;
            }
        }

        // Navigate to the current node of the sitemap and return the content
        this.getCurrentMap = function() {
            var map = config.sitemap.homepage;

            // Go to the current node
            for (var i=0; i<config.currentState.length; i++) {
                var keys = config.currentState[i].keys;
                for (var j=0; j<keys.length; j++)
                    map = map[keys[j]];
            }

            return map;
        }
	};

	window.Openhab = Openhab;

})(window);
