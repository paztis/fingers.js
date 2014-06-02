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

