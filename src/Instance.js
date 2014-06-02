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