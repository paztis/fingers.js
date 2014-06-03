/**
 * @module fingers
 *
 * @class Gesture
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Gesture}
 */

var Gesture = function(pOptions, pHandler) {
    this.options = pOptions || {};
    this._handler = pHandler;
    this.listenedFingers = [];
    this._onFingerUpdateF = this._onFingerUpdate.bind(this);
};

Gesture.EVENT_TYPE = {
    start: "start",
    end: "end",
    move: "move"
};

Gesture.prototype = {

    options: null,
    _handler: null,
    _onFingerUpdateF: null,

    isListening: false,
    listenedFingers: null,

    _onFingerAdded: function(pFingerList) {
        if(!this.isListening) {
            this._onFingerAddedImpl(pFingerList);
        }
    },
    _onFingerAddedImpl: function(pFingerList) {},

    _onFingerUpdate: function() {},

    _onFingerRemoved: function(pFinger) {
        if(this.isListening && this.listenedFingers.indexOf(pFinger) > -1) {
            this._onFingerRemovedImpl(pFinger);
        }
    },

    _startListeningFingers: function(pFinger1, pFinger2, pFinger3) {
        var finger;
        for(var i= 0, size=arguments.length; i<size; i++) {
            finger = arguments[i];
            this.listenedFingers.push(finger);

            finger._addHandler(this._onFingerUpdateF);
        }

        this.isListening = true;
    },

    _stopListeningFingers: function() {
        var finger;
        for(var i= 0, size=this.listenedFingers.length; i<size; i++) {
            finger = this.listenedFingers[i];

            finger._removeHandler(this._onFingerUpdateF);
        }

        this.listenedFingers.length = 0;
        this.isListening = false;
    }
};

Fingers.Gesture = Gesture;