/*! Fingers.js - v0.0.1 - 2014-06-04
 *
 * Copyright (c) 2014 Jérôme HENAFF <jerome.henaff@gmail.com>;
 * Licensed under the MIT license */

(function(window, undefined) {
    'use strict';


var Fingers = function Fingers(pElement) {
    return new Fingers.Instance(pElement);
};

Fingers.__extend = function(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
        if (source) {
            for (var prop in source) {
                obj[prop] = source[prop];
            }
        }
    });
    return obj;
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

    GROW: {
        IN: 'in',
        OUT: 'out'
    },

    getVelocity: function(deltaTime, deltaPos) {
        return Math.abs(deltaPos / deltaTime) || 0;
    },

    getAngle: function(x, y) {
        return Math.atan2(x, y);
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

    getDistance: function(x, y) {
        return Math.sqrt((x * x) + (y * y));
    }
};

Fingers.Utils = Utils;




/**
 * @module fingers
 *
 * @class CacheArray
 * @constructor
 * @return {CacheArray}
 */

var CacheArray = function() {
    this._cache = [];
};

CacheArray.prototype = {
    _cache: null,

    isCachedValue: function(pIndex) {
        return (this._cache[pIndex] !== undefined);
    },

    getCachedValue: function(pIndex) {
        return this._cache[pIndex];
    },

    setCachedValue: function(pIndex, pValue) {
        this._cache[pIndex] = pValue;
    },

    clearCachedValue: function(pIndex) {
        delete this._cache[pIndex];
    },

    clearCache: function() {
        this._cache.length = 0;
    },

    getCachedValueOrUpdate: function(pIndex, pUpdateF, pUpdateContext) {
        var cacheValue = this.getCachedValue(pIndex);
        if(cacheValue === undefined) {
            cacheValue = pUpdateF.call(pUpdateContext);
            this.setCachedValue(pIndex, cacheValue);
        }
        return cacheValue;
    }
};

Fingers.CacheArray = CacheArray;

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
Instance.HAS_TOUCHEVENTS = ('ontouchstart' in window);
Instance.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);
Instance.LISTEN_TOUCH_EVENTS = (Instance.HAS_TOUCHEVENTS && Instance.IS_MOBILE);

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

        this.startListening();
    },

    getElement: function() {
        return this.element;
    },

    /*---- gestures ----*/
    addGesture: function(PGestureClass, pOptions, pHandler) {
        var gesture = new PGestureClass(pOptions, pHandler);
        this.gestureList.push(gesture);

        return gesture;
    },

    /*---- Native event listening ----*/
    startListening: function() {
        if(this._stopListeningF === null) {
            var _this = this;
            if(Instance.LISTEN_TOUCH_EVENTS) {
                var onTouchStartF = this._onTouchStart.bind(this);
                var onTouchMoveF = this._onTouchMove.bind(this);
                var onTouchEndF = this._onTouchEnd.bind(this);
                var onTouchCancelF = this._onTouchCancel.bind(this);

                this.element.addEventListener("touchstart", onTouchStartF);
                this.element.addEventListener("touchmove", onTouchMoveF);
                this.element.addEventListener("touchend", onTouchEndF);
                this.element.addEventListener("touchcancel", onTouchCancelF);

                this._stopListeningF = function() {
                    _this.element.removeEventListener("touchstart", onTouchStartF);
                    _this.element.removeEventListener("touchmove", onTouchMoveF);
                    _this.element.removeEventListener("touchend", onTouchEndF);
                    _this.element.removeEventListener("touchcancel", onTouchCancelF);
                };
            }
            else {
                this._onMouseMoveF = this._onMouseMove.bind(this);
                this._onMouseUpF = this._onMouseUp.bind(this);

                var onMouseDownF = this._onMouseDown.bind(this);
                this.element.addEventListener("mousedown", onMouseDownF);

                this._stopListeningF = function() {
                    _this.element.removeEventListener("mousedown", onMouseDownF);
                    document.removeEventListener("mousemove", this._onMouseMoveF);
                    document.removeEventListener("mouseup", this._onMouseUpF);
                };
            }
        }
    },

    _stopListeningF: null,
    stopListening: function() {
        if(this._stopListeningF !== null) {
            this._removeAllFingers();

            this._stopListeningF();
            this._stopListeningF = null;
        }
    },

    /*-------- Touch events ----*/
    _onTouchStart: function(pTouchEvent) {
        var touch;
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            touch = pTouchEvent.changedTouches[i];
            this._createFinger(touch.identifier, pTouchEvent.timeStamp, touch.pageX, touch.pageY);
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

    _onTouchEnd: function(pTouchEvent) {
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {
            this._removeFinger(pTouchEvent.changedTouches[i].identifier);
        }
    },

    _onTouchCancel: function(pTouchEvent) {
        //Security to prevent chrome bugs
        for(var i= 0, size=pTouchEvent.changedTouches.length; i<size; i++) {

            if(this.fingerMap[pTouchEvent.changedTouches[i].identifier] !== undefined) {
                //Remove all fingers
                this._removeAllFingers();
                break;
            }
        }
    },

    /*-------- Mouse events ----*/
    _onMouseDown: function(pMouseEvent) {
        if(pMouseEvent.button === 0) {
            document.addEventListener("mousemove", this._onMouseMoveF);
            document.addEventListener("mouseup", this._onMouseUpF);

            this._createFinger(pMouseEvent.button, pMouseEvent.timeStamp, pMouseEvent.pageX, pMouseEvent.pageY);

            pMouseEvent.preventDefault();
        }
    },

    _onMouseMoveF: null,
    _onMouseMove: function(pMouseEvent) {
        if(pMouseEvent.button === 0) {
            this._updateFingerPosition(pMouseEvent.button, pMouseEvent.timeStamp, pMouseEvent.pageX, pMouseEvent.pageY);
        }
    },

    _onMouseUpF: null,
    _onMouseUp: function(pMouseEvent) {
        //In all cases, remove listener
        document.removeEventListener("mousemove", this._onMouseMoveF);
        document.removeEventListener("mouseup", this._onMouseUpF);

        this._removeFinger(0);
    },

    /*---- Fingers ----*/
    _createFinger: function(pFingerId, pTimestamp, pX, pY) {
        var finger = new Finger(pFingerId, pTimestamp, pX, pY);

        this.fingerMap[finger.id] = finger;
        this.fingerList.push(finger);

        for(var i=0, size=this.gestureList.length; i<size; i++) {
            this.gestureList[i]._onFingerAdded(finger, this.fingerList);
        }
    },

    _removeFinger: function(pFingerId) {
        var finger = this.fingerMap[pFingerId];
        if(finger !== undefined) {
            for(var i=0, size=this.gestureList.length; i<size; i++) {
                this.gestureList[i]._onFingerRemoved(finger);
            }

            delete this.fingerMap[pFingerId];
            this.fingerList.splice(this._getFingerPosition(finger), 1);
        }
    },

    _removeAllFingers: function() {
        var list = this.fingerList.splice(0);
        for(var i= 0, size=list.length; i<size; i++) {

            this._removeFinger(list[i].id);
        }
    },

    _updateFingerPosition: function(pFingerId, pTimestamp, pX, pY) {
        var finger = this.fingerMap[pFingerId];
        if(finger !== undefined) {
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
 * @param {Number} pTimestamp
 * @param {Number} pX
 * @param {Number} pY
 * @return {Finger}
 */

var Finger = function(pId, pTimestamp, pX, pY) {
    this.id = pId;
    this._handlerList = [];

    this.startP = new Position(pTimestamp, pX, pY);
    this.previousP = new Position(pTimestamp, pX, pY);
    this.currentP = new Position(pTimestamp, pX, pY);

    this._cacheArray = new CacheArray();
};

var CACHE_INDEX_CREATOR = 0;
Finger.cacheIndexes = {
    deltaTime: CACHE_INDEX_CREATOR++,
    totalTime: CACHE_INDEX_CREATOR++,

    deltaX: CACHE_INDEX_CREATOR++,
    deltaY: CACHE_INDEX_CREATOR++,
    deltaDistance: CACHE_INDEX_CREATOR++,
    totalX: CACHE_INDEX_CREATOR++,
    totalY: CACHE_INDEX_CREATOR++,
    totalDistance: CACHE_INDEX_CREATOR++,

    deltaDirection: CACHE_INDEX_CREATOR++,
    totalDirection: CACHE_INDEX_CREATOR++,

    velocityX: CACHE_INDEX_CREATOR++,
    velocityY: CACHE_INDEX_CREATOR++,
    velocity: CACHE_INDEX_CREATOR++,
    velocityAverage: CACHE_INDEX_CREATOR++
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
    _cacheArray: null,
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
        this._cacheArray.clearCache();

        this.previousP.copy(this.currentP);
        this.currentP.set(pTimestamp, pX, pY);

        for(var i= 0; i<this._handlerListSize; i++) {
            this._handlerList[i](this);
        }
    },

    /*---- time ----*/
    getTime: function() {
        return this.currentP.timestamp;
    },

    getDeltaTime: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaTime, this._getDeltaTime, this);
    },
    _getDeltaTime: function() {
        return this.currentP.timestamp - this.previousP.timestamp;
    },

    getTotalTime: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.startTime, this._getDeltaTime, this);
    },
    _getTotalTime: function() {
        return this.currentP.timestamp - this.startP.timestamp;
    },

    /*---- position ----*/
    getX: function() {
        return this.currentP.x;
    },

    getY: function() {
        return this.currentP.y;
    },

    /*---- distance ----*/
    getDeltaX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaX, this._getDeltaX, this);
    },
    _getDeltaX: function() {
        return this.currentP.x - this.previousP.x;
    },

    getDeltaY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaY, this._getDeltaY, this);
    },
    _getDeltaY: function() {
        return this.currentP.y - this.previousP.y;
    },

    getDeltaDistance: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaDistance, this._getDeltaDistance, this);
    },
    _getDeltaDistance: function() {
        return Utils.getDistance(this.getDeltaX(), this.getDeltaY());
    },

    getTotalX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalX, this._getTotalX, this);
    },
    _getTotalX: function() {
        return this.currentP.x - this.startP.x;
    },

    getTotalY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalY, this._getTotalY, this);
    },
    _getTotalY: function() {
        return this.currentP.y - this.startP.y;
    },

    getDistance: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalDistance, this._getDistance, this);
    },
    _getDistance: function() {
        return Utils.getDistance(this.getTotalX(), this.getTotalY());
    },

    /*---- direction ----*/
    getDeltaDirection: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.deltaDirection, this._getDeltaDirection, this);
    },
    _getDeltaDirection: function() {
        return Utils.getDirection(this.getDeltaX(), this.getDeltaY());
    },

    getDirection: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.totalDirection, this._getDirection, this);
    },
    _getDirection: function() {
        return Utils.getDirection(this.getTotalX(), this.getTotalY());
    },

    /*---- velocity ----*/
    getVelocityX: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocityX, this._getVelocityX, this);
    },
    _getVelocityX: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaX());
    },

    getVelocityY: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocityY, this._getVelocityY, this);
    },
    _getVelocityY: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaY());
    },

    getVelocity: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocity, this._getVelocity, this);
    },
    _getVelocity: function() {
        return Utils.getVelocity(this.getDeltaTime(), this.getDeltaDistance());
    },

    getVelocityAverage: function() {
        return this._cacheArray.getCachedValueOrUpdate(Finger.cacheIndexes.velocityAverage, this._getVelocity, this);
    },
    _getVelocityAverage: function() {
        return Utils.getVelocity(this.getTotalTime(), this.getDistance());
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

var Gesture = function(pOptions, pHandler, pDefaultOptions) {
    this.options = Fingers.__extend({}, pDefaultOptions || {}, pOptions || {});
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


    Fingers.__extend(Drag.prototype, _super.prototype, {

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening) {
                this._addListenedFinger(pNewFinger);

                this._handler(_super.EVENT_TYPE.start, this.listenedFingers[0]);
            }
        },

        _onFingerUpdate: function(pFinger) {
            this._handler(_super.EVENT_TYPE.move, this.listenedFingers[0]);
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._handler(_super.EVENT_TYPE.end, this.listenedFingers[0]);

                this._removeAllListenedFingers();
            }
        }
    });

    return Drag;
})(Fingers.Gesture);

Fingers.gesture.Drag = Drag;

/**
 * @module gestures
 *
 * @class Hold
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Swipe}
 */



var Hold = (function (_super) {

    var DEFAULT_OPTIONS = {
        nbFingers: 1,
        disanceThreshold: 10,
        duration: 500
    };

    function Hold(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler, DEFAULT_OPTIONS);
        this._onHoldTimeLeftF = this._onHoldTimeLeft.bind(this);
    }

    Fingers.__extend(Hold.prototype, _super.prototype, {

        timer: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= this.options.nbFingers) {
                for(var i=0; i<this.options.nbFingers; i++) {
                    this._addListenedFinger(pFingerList[i]);
                }

                clearTimeout(this.timer);
                this.timer = setTimeout(this._onHoldTimeLeftF, this.options.duration);
            }
        },

        _onFingerUpdate: function(pFinger) {
            var size = this.listenedFingers.length;
            for(var i= 0; i<size; i++) {
                if(this.listenedFingers[i].getDistance() > this.options.disanceThreshold) {
                    this._onHoldCancel();
                    break;
                }
            }
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._onHoldCancel();
            }
        },

        _onHoldTimeLeftF: null,
        _onHoldTimeLeft: function() {
            this._handler(_super.EVENT_TYPE.end, this.listenedFingers);
        },

        _onHoldCancel: function() {
            clearTimeout(this.timer);
            this._removeAllListenedFingers();
        }
    });

    return Hold;
})(Fingers.Gesture);

Fingers.gesture.Hold = Hold;

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

    var DEFAULT_OPTIONS = {
        nbFingers: 1,
        pinchInDetect: 0.6,
        pinchOutDetect: 1.4
    };

    function Pinch(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler, DEFAULT_OPTIONS);

        this.data = {
            grow: null,
            scale: 1
        };
    }

    Fingers.__extend(Pinch.prototype, _super.prototype, {

        _startDistance: 0,
        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= 2) {
                this._addListenedFingers(pFingerList[0], pFingerList[1]);

                this._startDistance = this._getFingersDistance();
            }
        },

        _onFingerUpdate: function(pFinger) {},

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                var newDistance = this._getFingersDistance();
                var scale = newDistance / this._startDistance;

                if(scale <= this.options.pinchInDetect || scale >= this.options.pinchOutDetect) {
                    this.data.grow = (scale > 1) ? Utils.GROW.OUT : Utils.GROW.IN;
                    this.data.scale = scale;
                    this._handler(_super.EVENT_TYPE.end, this.data, this.listenedFingers);
                }

                this._removeAllListenedFingers();
            }
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
 * @class Raw
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Raw}
 */


var Raw = (function (_super) {

    function Raw(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);
    }


    Fingers.__extend(Raw.prototype, _super.prototype, {

        _onFingerAdded: function(pNewFinger, pFingerList) {
//            if(!this.isListening) {
                this._addListenedFinger(pNewFinger);

                this._handler(_super.EVENT_TYPE.start, pNewFinger);
//            }
        },

        _onFingerUpdate: function(pFinger) {
            this._handler(_super.EVENT_TYPE.move, pFinger);
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._handler(_super.EVENT_TYPE.end, pFinger);

                this._removeAllListenedFingers();
            }
        }
    });

    return Raw;
})(Fingers.Gesture);

Fingers.gesture.Raw = Raw;

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
        };
    }

    Fingers.__extend(Rotate.prototype, _super.prototype, {

        _startAngle: 0,
        _lastAngle: 0,
        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= 2) {
                this._addListenedFingers(pFingerList[0], pFingerList[1]);

                this._handler(_super.EVENT_TYPE.start, this.data, this.listenedFingers);
                this._lastAngle = this._getFingersAngle();
                this._startAngle = this._lastAngle;
            }
        },

        _onFingerUpdate: function(pFinger) {
            var newAngle = this._getFingersAngle();
            this.data.totalRotation = this._startAngle - newAngle;
            this.data.deltaRotation = this._lastAngle - newAngle;
            this._lastAngle = newAngle;

            this._handler(_super.EVENT_TYPE.move, this.data, this.listenedFingers);
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._handler(_super.EVENT_TYPE.end, this.data, this.listenedFingers);

                this._removeAllListenedFingers();
            }
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


var Scale = (function (_super) {

    function Scale(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);

        this.data = {
            totalScale: 1,
            deltaScale: 1
        };
    }

    Fingers.__extend(Scale.prototype, _super.prototype, {

        _startDistance: 0,
        _lastDistance: 0,
        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= 2) {
                this._addListenedFingers(pFingerList[0], pFingerList[1]);

                this._handler(_super.EVENT_TYPE.start, this.data, this.listenedFingers);
                this._lastDistance = this._getFingersDistance();
                this._startDistance = this._lastDistance;
            }
        },

        _onFingerUpdate: function(pFinger) {
            var newDistance = this._getFingersDistance();
            this.data.totalScale = newDistance / this._startDistance;
            this.data.deltaScale = newDistance / this._lastDistance;
            this._lastDistance = newDistance;

            this._handler(_super.EVENT_TYPE.move, this.data, this.listenedFingers);
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._handler(_super.EVENT_TYPE.end, this.data, this.listenedFingers);

                this._removeAllListenedFingers();
            }
        },

        _getFingersDistance: function() {
            var finger1P = this.listenedFingers[0].currentP;
            var finger2P = this.listenedFingers[1].currentP;
            return Fingers.Utils.getDistance(finger2P.x - finger1P.x, finger2P.y - finger1P.y);
        }
    });

    return Scale;
})(Fingers.Gesture);

Fingers.gesture.Scale = Scale;

/**
 * @module gestures
 *
 * @class Swipe
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Swipe}
 */



var Swipe = (function (_super) {

    var DEFAULT_OPTIONS = {
        nbFingers: 1,
        swipeVelocityX: 0.6,
        swipeVelocityY: 0.6
    };

    function Swipe(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler, DEFAULT_OPTIONS);

        this.data = {
            direction: null,
            velocity: 0
        };
    }

    Fingers.__extend(Swipe.prototype, _super.prototype, {

        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= this.options.nbFingers) {
                for(var i=0; i<this.options.nbFingers; i++) {
                    this._addListenedFinger(pFingerList[i]);
                }
            }
        },

        _onFingerUpdate: function(pFinger) {
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {

                var isSameDirection = true;
                var direction = this.listenedFingers[0].getDirection();
                var velocityX = 0;
                var velocityY = 0;

                var size = this.listenedFingers.length;
                for(var i= 0; i<size; i++) {
                    isSameDirection = isSameDirection && (direction === this.listenedFingers[i].getDirection());

                    velocityX += this.listenedFingers[i].getVelocityX();
                    velocityY += this.listenedFingers[i].getVelocityY();
                }
                velocityX /= size;
                velocityY /= size;

                if(isSameDirection &&
                    (velocityX > this.options.swipeVelocityX || pFinger.getVelocityY() > this.options.swipeVelocityY)) {
                    this.data.direction = direction;
                    this.data.velocity = (velocityX > this.options.swipeVelocityX) ? velocityX : velocityY;

                    this._handler(_super.EVENT_TYPE.end, this.data, this.listenedFingers);
                }

                this._removeAllListenedFingers();
            }
        }
    });

    return Swipe;
})(Fingers.Gesture);

Fingers.gesture.Swipe = Swipe;

/**
 * @module gestures
 *
 * @class Tap
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Swipe}
 */



var Tap = (function (_super) {

    var DEFAULT_OPTIONS = {
        nbFingers: 1,
        tapInterval: 400
    };

    function Tap(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler, DEFAULT_OPTIONS);
    }

    Fingers.__extend(Tap.prototype, _super.prototype, {

        lastTapTimestamp: 0,
        nbTap: 0,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= this.options.nbFingers) {

                if((pNewFinger.getTime() - this.lastTapTimestamp) > this.options.tapInterval) {
                    this._clearTap();
                }

                for(var i=0; i<this.options.nbFingers; i++) {
                    this._addListenedFinger(pFingerList[i]);
                }
            }
        },

        _onFingerUpdate: function(pFinger) {
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._removeAllListenedFingers();

                if(pFinger.getTotalTime() < this.options.tapInterval) {
                    this.lastTapTimestamp = pFinger.getTime();
                    this.nbTap++;

                    this._handler(_super.EVENT_TYPE.end, this.nbTap, this.listenedFingers);
                }
            }
        },

        _clearTap: function() {
            this.lastTapTimestamp = 0;
            this.nbTap = 0;
        }

    });

    return Tap;
})(Fingers.Gesture);

Fingers.gesture.Tap = Tap;

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
        };
    }

    Fingers.__extend(Transform.prototype, _super.prototype, {

        _startAngle: 0,
        _lastAngle: 0,
        _startDistance: 0,
        _lastDistance: 0,
        data: null,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening && pFingerList.length >= 2) {
                this._addListenedFingers(pFingerList[0], pFingerList[1]);

                this._handler(_super.EVENT_TYPE.start, this.data, this.listenedFingers);
                this._lastAngle = this._getFingersAngle();
                this._startAngle = this._lastAngle;

                this._lastDistance = this._getFingersDistance();
                this._startDistance = this._lastDistance;
            }
        },

        _onFingerUpdate: function(pFinger) {
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

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this._handler(_super.EVENT_TYPE.end, this.data, this.listenedFingers);

                this._removeAllListenedFingers();
            }
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