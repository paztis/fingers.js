/**
 * @module fingers
 *
 * @class Gesture
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @param {Object} pDefaultOptions
 * @return {Gesture}
 */

var Gesture = function(pOptions, pHandler, pDefaultOptions) {
    this.options = Fingers.__extend({}, pDefaultOptions || {}, pOptions || {});
    this._handler = pHandler;
    this.listenedFingers = [];
    this._onFingerUpdateF = this._onFingerUpdate.bind(this);
};

Gesture.EVENT_TYPE = {
    instant: "instant",
    start: "start",
    end: "end",
    move: "move"
};

Gesture.prototype = {

    options: null,
    _handler: null,

    isListening: false,
    listenedFingers: null,

    /*---- Fingers events ----*/
    _onFingerAdded: function(pNewFinger, pFingerList) { /*To Override*/ },

    _onFingerUpdateF: null,
    _onFingerUpdate: function(pFinger) { /*To Override*/ },

    _onFingerRemoved: function(pFinger) { /*To Override*/ },

    /*---- Actions ----*/
    _addListenedFingers: function(pFinger1, pFinger2, pFinger3) {
        for(var i= 0, size=arguments.length; i<size; i++) {
            this._addListenedFinger(arguments[i]);
        }
    },
    _addListenedFinger: function(pFinger) {
        this.listenedFingers.push(pFinger);
        pFinger._addHandler(this._onFingerUpdateF);

        if(!this.isListening) {
            this.isListening = true;
        }
    },

    _removeListenedFingers: function(pFinger1, pFinger2, pFinger3) {
        for(var i= 0, size=arguments.length; i<size; i++) {
            this._removeListenedFinger(arguments[i]);
        }
    },
    _removeListenedFinger: function(pFinger) {
        pFinger._removeHandler(this._onFingerUpdateF);

        var index = this.listenedFingers.indexOf(pFinger);
        this.listenedFingers.splice(index, 1);

        if(this.listenedFingers.length === 0) {
            this.isListening = false;
        }
    },

    _removeAllListenedFingers: function() {
        var finger;
        for(var i= 0, size=this.listenedFingers.length; i<size; i++) {
            finger = this.listenedFingers[i];

            finger._removeHandler(this._onFingerUpdateF);
        }

        this.listenedFingers.length = 0;
        this.isListening = false;
    },

    /*---- Utils ----*/
    isListenedFinger: function(pFinger) {
        return (this.isListening && this.getListenedPosition(pFinger) > -1);
    },

    getListenedPosition: function(pFinger) {
        return this.listenedFingers.indexOf(pFinger);
    }
};

Fingers.Gesture = Gesture;