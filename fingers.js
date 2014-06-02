/*! Fingers.js - v0.0.1 - 2014-06-03
 *
 * Copyright (c) 2014 Jérôme HENAFF <jerome.henaff@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
    'use strict';


var __extend = function(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
};


var Fingers = function Fingers(pElement) {
    return new Fingers.Instance(pElement);
};

/**
 * @module fingers
 *
 * @class Utils
 */

var Utils = {

    DIRECTION: {
        UP: 'up',
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right'
    },

    getVelocity: function(deltaTime, deltaPos) {
        return Math.abs(deltaPos / deltaTime) || 0;
    },

    getAngle: function(x, y) {
        return Math.atan2(x, y)
    },

    getDirection: function(deltaX, deltaY) {
        if(Math.abs(deltaX) >= Math.abs(deltaY)) {
            return (deltaX > 0) ? this.DIRECTION.RIGHT : this.DIRECTION.LEFT;
        }
        else {
            return (deltaY > 0) ? this.DIRECTION.DOWN : this.DIRECTION.UP;
        }
    },

    isVertical: function isVertical(direction) {
        return direction === this.DIRECTION.UP || direction === this.DIRECTION.DOWN;
    },

    getDistance: function(deltaX, deltaY) {
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    }
};

Fingers.Utils = Utils;




/**
 * @module fingers
 */

/**
 * create new fingers instance
 * all methods should return the instance itself, so it is chainable.
 *
 * @class Instance
 * @constructor
 * @param {HTMLElement} pElement
 * @return {Instance}
 */
var Instance = function(pElement) {
    this._init(pElement);
};

Instance.prototype = {
    /**
     * @property element
     * @type {HTMLElement}
     */
    element: null,

    /**
     * @property fingerMap
     * @type {Object.<Number, Finger>}
     */
    fingerMap: null,

    /**
     * @property fingerList
     * @type {Array.<Finger>}
     */
    fingerList: null,


    /**
     * @property fingerIdList
     * @type {Array.<Gesture>}
     */
    gestureList: null,

    /*---- INIT ----*/
    _init: function(pElement) {
        this.element = pElement;
        this.fingerMap = {};
        this.fingerList = [];
        this.gestureList = [];

        this._listenNativeEvents();
    },

    getElement: function() {
        return this.element;
    },

    /*---- gestures ----*/
    listenGesture: function(pGesture, pOptions, pHandler) {
        var gesture = new pGesture(pOptions, pHandler);
        this.gestureList.push(gesture);

        return gesture;
    },

    /*---- Native event listening ----*/
    _listenNativeEvents: function() {
        this.element.addEventListener("touchstart", this._onTouchStart.bind(this));
        this.element.addEventListener("touchend", this._onTouchEnd.bind(this));
        this.element.addEventListener("touchcancel", this._onTouchCancel.bind(this));
        this.element.addEventListener("touchmove", this._onTouchMove.bind(this));
    },

    _onTouchStart: function(pTouchEvent) {
        var touch;
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            touch = pTouchEvent.changedTouches[i];
            this._createFinger(touch.identifier, pTouchEvent.timeStamp, touch.pageX, touch.pageY);
        }
    },

    _onTouchEnd: function(pTouchEvent) {
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            this._removeFinger(pTouchEvent.changedTouches[i].identifier);
        }
    },

    _onTouchCancel: function(pTouchEvent) {
        //Security to prevent chrome bugs
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {

            if(this.fingerMap[pTouchEvent.changedTouches[i].identifier] != null) {
                //Remove all fingers
                this._removeAllFinger();
                break;
            }
        }
    },

    _onTouchMove: function(pTouchEvent) {
        var touch;
        var finger;
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            touch = pTouchEvent.changedTouches[i];
            this._updateFingerPosition(touch.identifier, pTouchEvent.timeStamp, touch.pageX, touch.pageY);
        }

        pTouchEvent.preventDefault();
    },

    /*---- Fingers ----*/
    _createFinger: function(pFingerId, pTimestamp, pX, pY) {
        var finger = new Finger(pFingerId, pTimestamp, pX, pY);

        this.fingerMap[finger.id] = finger;
        this.fingerList.push(finger);

        for(var i=0, size=this.gestureList.length; i<size; i++) {
            this.gestureList[i]._onFingerAdded(this.fingerList);
        }
    },

    _removeFinger: function(pFingerId) {
        var finger = this.fingerMap[pFingerId];

        if(finger != null) {
            for(var i=0, size=this.gestureList.length; i<size; i++) {
                this.gestureList[i]._onFingerRemoved(finger);
            }

            delete this.fingerMap[pFingerId];
            this.fingerList.splice(this._getFingerPosition(finger), 1);
        }
    },

    _removeAllFinger: function() {
        var list = this.fingerList.splice(0);
        for(var i= 0, size=list.length; i<size; i++) {

            this._removeFinger(list[i].id);
        }
    },

    _updateFingerPosition: function(pFingerId, pTimestamp, pX, pY) {
        var finger = this.fingerMap[pFingerId];
        if(finger != null) {
            finger._setCurrentP(pTimestamp, pX, pY);
        }
    },

    /*---- utils ----*/
    _getFingerPosition: function(pFinger) {
        return this.fingerList.indexOf(pFinger);
    }

};




Fingers.Instance = Instance;

/**
 * @module fingers
 *
 * @class Finger
 * @constructor
 * @param {Number} pId
 * @param {Position} pStartPosition
 * @return {Finger}
 */

var Finger = function(pId, pTimestamp, pX, pY) {
    this.id = pId;
    this._handlerList = [];

    this.startP = new Position(pTimestamp, pX, pY);
    this.previousP = new Position(pTimestamp, pX, pY);
    this.currentP = new Position(pTimestamp, pX, pY);

    this._deltaP = {
        deltaTime: 0,
        deltaX: 0,
        deltaY: 0
    };
};

Finger.prototype = {
    /**
     * @property id
     * @type {Number}
     */
    id: null,
    startP: null,
    previousP: null,
    currentP: null,
    _deltaP: null,
    _handlerList: null,
    _handlerListSize: 0,

    _addHandler: function(pHandler) {
        this._handlerList.push(pHandler);
        this._handlerListSize = this._handlerList.length;
    },

    _removeHandler: function(pHandler) {
        var index = this._handlerList.indexOf(pHandler);
        this._handlerList.splice(index, 1);
        this._handlerListSize = this._handlerList.length;
    },

    _setCurrentP: function(pTimestamp, pX, pY) {
        this.previousP.copy(this.currentP);
        this.currentP.set(pTimestamp, pX, pY);

        this._deltaP.deltaTime = this.currentP.timestamp - this.previousP.timestamp;
        this._deltaP.deltaX = this.currentP.x - this.previousP.x;
        this._deltaP.deltaY = this.currentP.y - this.previousP.y;

        for(var i= 0; i<this._handlerListSize; i++) {
            this._handlerList[i]();
        }
    },

    getDeltaTime: function() {
        return this._deltaP.deltaTime;
    },

    getDeltaX: function() {
        return this._deltaP.deltaX;
    },

    getDeltaY: function() {
        return this._deltaP.deltaY;
    },

    getVelocityX: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaX());
    },

    getVelocityY: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaY());
    },

    getDirection: function() {
        return Utils.getDirection(this.getDeltaX(), this.getDeltaY());
    }
};

Fingers.Finger = Finger;



var Position = function(pTimestamp, pX, pY) {
    this.set(pTimestamp, pX, pY);
};

Position.prototype = {
    /**
     * @property timestamp
     * @type {Number}
     */
    timestamp: null,

    /**
     * @property x
     * @type {Number}
     */
    x: null,

    /**
     * @property y
     * @type {Number}
     */
    y: null,

    set: function(pTimestamp, pX, pY) {
        this.timestamp = pTimestamp;
        this.x = pX;
        this.y = pY;
    },

    copy: function(pPosition) {
        this.timestamp = pPosition.timestamp;
        this.x = pPosition.x;
        this.y = pPosition.y;
    }
};

Fingers.Position = Position;



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
    this._options = pOptions;
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

    _options: null,
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


Fingers.gesture = {
};

/**
 * @module gestures
 *
 * @class Drag
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Drag}
 */


var Drag = (function (_super) {

    function Drag(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);
    }


    __extend(Drag.prototype, _super.prototype, {

        _onFingerAddedImpl: function(pFingerList) {
            this._startListeningFingers(pFingerList[0]);

            this._handler(_super.EVENT_TYPE.start, this.listenedFingers[0]);
        },

        _onFingerUpdate: function() {
            this._handler(_super.EVENT_TYPE.move, this.listenedFingers[0]);
        },

        _onFingerRemovedImpl: function(pFinger) {
            this._handler(_super.EVENT_TYPE.end, this.listenedFingers[0]);

            this._stopListeningFingers();
        }
    });

    return Drag;
})(Fingers.Gesture);

Fingers.gesture.Drag = Drag;

/**
 * @module gestures
 *
 * @class Rotate
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Rotate}
 */


var Rotate = (function (_super) {

    function Rotate(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);

        this.data = {
            totalRotation: 0,
            deltaRotation: 0
        }
    }

    __extend(Rotate.prototype, _super.prototype, {

        _startAngle: 0,
        _lastAngle: 0,
        data: null,

        _onFingerAddedImpl: function(pFingerList) {
            if(pFingerList.length >= 2) {
                this._startListeningFingers(pFingerList[0], pFingerList[1]);

                this._handler(_super.EVENT_TYPE.start, 0, this.listenedFingers);
                this._lastAngle = this._getFingersAngle();
                this._startAngle = this._lastAngle;
            }
        },

        _onFingerUpdate: function() {
            var newAngle = this._getFingersAngle();
            this.data.totalRotation = this._startAngle - newAngle;
            this.data.deltaRotation = this._lastAngle - newAngle;
            this._lastAngle = newAngle;

            this._handler(_super.EVENT_TYPE.move, this.data, this.listenedFingers);
        },

        _onFingerRemovedImpl: function(pFinger) {
            this._handler(_super.EVENT_TYPE.end, 0, this.listenedFingers);

            this._stopListeningFingers();
        },

        _getFingersAngle: function() {
            var finger1P = this.listenedFingers[0].currentP;
            var finger2P = this.listenedFingers[1].currentP;
            return Fingers.Utils.getAngle(finger2P.x - finger1P.x, finger2P.y - finger1P.y);
        }
    });

    return Rotate;
})(Fingers.Gesture);

Fingers.gesture.Rotate = Rotate;

/**
 * @module gestures
 *
 * @class Pinch
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Pinch}
 */


var Pinch = (function (_super) {

    function Pinch(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);

        this.data = {
            totalScale: 1,
            deltaScale: 1
        }
    }

    __extend(Pinch.prototype, _super.prototype, {

        _startDistance: 0,
        _lastDistance: 0,
        data: null,

        _onFingerAddedImpl: function(pFingerList) {
            if(pFingerList.length >= 2) {
                this._startListeningFingers(pFingerList[0], pFingerList[1]);

                this._handler(_super.EVENT_TYPE.start, 1, this.listenedFingers);
                this._lastDistance = this._getFingersDistance();
                this._startDistance = this._lastDistance;
            }
        },

        _onFingerUpdate: function() {
            var newDistance = this._getFingersDistance();
            this.data.totalScale = newDistance / this._startDistance;
            this.data.deltaScale = newDistance / this._lastDistance;
            this._lastDistance = newDistance;

            this._handler(_super.EVENT_TYPE.move, this.data, this.listenedFingers);
        },

        _onFingerRemovedImpl: function(pFinger) {
            this._handler(_super.EVENT_TYPE.end, 1, this.listenedFingers);

            this._stopListeningFingers();
        },

        _getFingersDistance: function() {
            var finger1P = this.listenedFingers[0].currentP;
            var finger2P = this.listenedFingers[1].currentP;
            return Fingers.Utils.getDistance(finger2P.x - finger1P.x, finger2P.y - finger1P.y);
        }
    });

    return Pinch;
})(Fingers.Gesture);

Fingers.gesture.Pinch = Pinch;

/**
 * @module gestures
 *
 * @class Transform
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Transform}
 */


var Transform = (function (_super) {

    function Transform(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);

        this.data = {
            totalRotation: 0,
            deltaRotation: 0,
            totalScale: 1,
            deltaScale: 1
        }
    }

    __extend(Transform.prototype, _super.prototype, {

        _startAngle: 0,
        _lastAngle: 0,
        _startDistance: 0,
        _lastDistance: 0,
        data: null,

        _onFingerAddedImpl: function(pFingerList) {
            if(pFingerList.length >= 2) {
                this._startListeningFingers(pFingerList[0], pFingerList[1]);

                this._handler(_super.EVENT_TYPE.start, 0, this.listenedFingers);
                this._lastAngle = this._getFingersAngle();
                this._startAngle = this._lastAngle;

                this._lastDistance = this._getFingersDistance();
                this._startDistance = this._lastDistance;
            }
        },

        _onFingerUpdate: function() {
            var newAngle = this._getFingersAngle();
            this.data.totalRotation = this._startAngle - newAngle;
            this.data.deltaRotation = this._lastAngle - newAngle;
            this._lastAngle = newAngle;

            var newDistance = this._getFingersDistance();
            this.data.totalScale = newDistance / this._startDistance;
            this.data.deltaScale = newDistance / this._lastDistance;
            this._lastDistance = newDistance;

            this._handler(_super.EVENT_TYPE.move, this.data, this.listenedFingers);
        },

        _onFingerRemovedImpl: function(pFinger) {
            this._handler(_super.EVENT_TYPE.end, 0, this.listenedFingers);

            this._stopListeningFingers();
        },

        _getFingersAngle: function() {
            var finger1P = this.listenedFingers[0].currentP;
            var finger2P = this.listenedFingers[1].currentP;
            return Fingers.Utils.getAngle(finger2P.x - finger1P.x, finger2P.y - finger1P.y);
        },

        _getFingersDistance: function() {
            var finger1P = this.listenedFingers[0].currentP;
            var finger2P = this.listenedFingers[1].currentP;
            return Fingers.Utils.getDistance(finger2P.x - finger1P.x, finger2P.y - finger1P.y);
        }
    });

    return Transform;
})(Fingers.Gesture);

Fingers.gesture.Transform = Transform;

/**
 * @module fingers
 */

// AMD export
if(typeof define == 'function' && define.amd) {
    define(function() {
        return Fingers;
    });
// commonjs export
} else if(typeof module !== 'undefined' && module.exports) {
    module.exports = Fingers;
// browser export
} else {
    window.Fingers = Fingers;
}

})(window);