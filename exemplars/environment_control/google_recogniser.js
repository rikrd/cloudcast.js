(function (window) {

    var GoogleCommandRecogniser = function (cfg) {
        var config = cfg || {};
        config.onInited = config.onInited || function () {
            };
        config.onEvent = config.onEvent || function (e, data) {
            };
        config.onError = config.onError || function (e, data) {
            };
        config.onCommandDetected = config.onCommandDetected || function (command, transcript) {
            };
        config.onPartialCommandDetected = config.onPartialCommandDetected || function (command, transcript) {
            };
        this.commands = [];
        config.recognizing = false;
        config.language = config.language || 'en-US';

        var _self = this;

        var lastResultIndex = -1;

        if (!('webkitSpeechRecognition' in window)) {
            this.errorOutdated();

        } else {
            config.recognition = new webkitSpeechRecognition();
            config.recognition.continuous = true;
            config.recognition.interimResults = true;
            config.recognition.lang = config.language;

            config.recognition.onstart = function () {
                config.recognizing = true;
            };

            config.recognition.onerror = function (event) {
                config.onError(event);
            };

            config.recognition.onend = function () {
                config.recognizing = false;
            };

            config.recognition.onresult = function (event) {
                if (typeof(event.results) == 'undefined') {
                    config.recognition.onend = null;
                    config.recognition.stop();
                    this.errorOutdated();
                    return;
                }

                // Iterate over the results
                for (var i = lastResultIndex + 1; i < event.results.length; ++i) {
                    var transcript = event.results[i][0].transcript;

                    if (event.results[i].isFinal) {
                        // Fire command detection
                        var command = _self.detectCommand(transcript);
                        var used = config.onCommandDetected(command, transcript);
                    } else {
                        // Light up possible detection
                        var command = _self.detectCommand(transcript);
                        var used = config.onPartialCommandDetected(command, transcript);
                    }

                    if (used) {
                        lastResultIndex = i;
                    }
                }
            };
        }

        this.detectCommand = function (transcript) {
            for (var i = 0; i < this.commands.length; i++) {
                var action = this.commands[i];
                var action_command = action.parameters.speech_command ? action.parameters.speech_command.toLowerCase().trim() : action.parameters.label.toLowerCase().trim();
                if (action_command.indexOf(transcript.toLowerCase().trim()) >= 0) {
                    return action;
                }
            }

            return null;
        }

        // Set the choice grammar
        this.setCommands = function (commands) {
            this.commands = commands;
        }

        this.startRecognition = function () {
            config.recognition.start();
        }

        this.stopRecognition = function () {
            config.recognition.stop();
        }

        this.errorOutdated = function () {
            console.error("Your Google Speech API is outdated. Please upgrade your client (e.g. Google Chrome)");
        }
    };

    window.GoogleCommandRecogniser = GoogleCommandRecogniser;

})(window);