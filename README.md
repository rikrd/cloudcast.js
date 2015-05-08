cloudcast.js
==========

__cloudcast.js__ is a small Javascript library for browser-based interaction with CloudCAST services.

__cloudcast.js__ is based on the wonderful library [dictate.js](http://kaljurand.github.io/dictate.js/).

__cloudcast.js__ is designed to interact with CloudCAST services.

It uses [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio capture, and a WebSocket connection to the
[CloudCAST server](...) for online speech recognition.


Getting Started
---------------

Minimal example:

    <!DOCTYPE html>
    <html>
    <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Minimal example</title>
    </head>
    <body>
    <script src="../../lib/cloudcast.js"></script>
    <script src="../../lib/recorder.js"></script>
    <script type="text/javascript">
    var cloudcast = new Cloudcast({
            recorderWorkerPath : '../../lib/recorderWorker.js',
            onInited : function() {
                cloudcast.open();
            },
            onOpened : function() {
                cloudcast.startListening();
            },
            onResults : function(hypos) {
                var best_transcript = hypos[0].transcript;
                console.log(best_transcript);
            },
            onError : function(err, data) {
                console.log('Error: ' + err + ' ' + data);
                cloudcast.cancel();
            }
    });
    window.onload = function() {
        cloudcast.init();
    };
    </script>
    </body>
    </html>


Examples
--------

To run the examples on localhost, start a local webservice, e.g.:

	python -m SimpleHTTPServer

and then open e.g. <http://localhost:8000/examples>.

Browser support
---------------

Known to work in
  - Google Chrome 36.0.1985.125 on Ubuntu desktop
  - Google Chrome 37.0.2062.117 on Android
