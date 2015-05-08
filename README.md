cloudcast.js
==========

__cloudcast.js__ is a small Javascript library for browser-based interaction with CloudCAST services.

__cloudcast.js__ is based on the wonderful library [dictate.js](http://kaljurand.github.io/dictate.js/).
__cloudcast.js__ is designed to interact with CloudCAST services.

It uses [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio capture, and a WebSocket connection to the
[CloudCAST server](...) for online speech recognition.

API
---

The API is modelled after [Android's SpeechRecognizer](http://developer.android.com/reference/android/speech/SpeechRecognizer.html).
See the source code of [lib/cloudcast.js](lib/cloudcast.js).


Browser support
---------------

Known to work in
  - Google Chrome 36.0.1985.125 on Ubuntu desktop
  - Google Chrome 37.0.2062.117 on Android
