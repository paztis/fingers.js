/**
 * @module gestures
 *
 * @class ZoneEntering
 * @constructor
 * @param {Object} pOptions
 * @return {ZoneEntering}
 */


var ZoneEntering = (function (_super) {

    var DEFAULT_OPTIONS = {
    };

    function ZoneEntering(pOptions) {
        _super.call(this, pOptions, DEFAULT_OPTIONS);
        this._zoneList = [];
        this._zoneMap = {};
    }

    ZoneEntering.TYPE = {
        enter: "enter",
        leave: "leave"
    };
    ZoneEntering.LAST_ZONE_ID = 0;

    Fingers.__extend(ZoneEntering.prototype, _super.prototype, {

        _zoneList: null,
        _zoneMap: null,
        _zoneSize: 0,

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(this.listenedFingers.length === 0) {
                this._addListenedFinger(pNewFinger);

                for(var i=0; i<this._zoneSize; i++) {
                    this._checkZone(this._zoneList[i], pNewFinger);
                }
            }
        },

        _onFingerUpdate: function(pFinger) {
            for(var i=0; i<this._zoneSize; i++) {
                this._checkZone(this._zoneList[i], pFinger);
            }
        },

        _onFingerRemoved: function(pFinger) {
            var zone;
            for(var i=0; i<this._zoneSize; i++) {
                zone = this._zoneList[i];
                if(this._zoneMap[zone.id] === true) {
                    this._fireLeaveZone(zone);
                }
            }

            this._removeListenedFinger(pFinger);
        },

        /**
         * @typedef Zone
         * @type {Object}
         * @property {number} id
         * @property {number} left
         * @property {number} right
         * @property {number} top
         * @property {number} bottom
         */

        /**
         * @param {Zone} pZone
         */
        addZone: function(pZone) {
            if(this._zoneList.indexOf(pZone) === -1) {
                if(pZone.id === undefined) {
                    pZone.id = ZoneEntering.LAST_ZONE_ID++;
                }

                this._zoneList.push(pZone);
                this._zoneMap[pZone.id] = false;
                this._zoneSize++;
            }

            return this;
        },

        /**
         * @param {Zone} pZone
         */
        removeZone: function(pZone) {
            var index = this._zoneList.indexOf(pZone);
            if(index !== -1) {
                this._zoneList.splice(index, 1);
                delete this._zoneMap[pZone.id];
                this._zoneSize--;
            }

            return this;
        },

        _checkZone: function(pZone, pFinger) {
            if(this._zoneMap[pZone.id] === false && this._isInZone(pZone, pFinger.getX(), pFinger.getY())) {
                this._zoneMap[pZone.id] = true;
                this._fireEnterZone(pZone);
            }
            else if(this._zoneMap[pZone.id] === true && !this._isInZone(pZone, pFinger.getX(), pFinger.getY())) {
                this._zoneMap[pZone.id] = false;
                this._fireLeaveZone(pZone);
            }
        },

        _fireEnterZone: function(pZone) {
            this.fire(_super.EVENT_TYPE.instant, {
                type: ZoneEntering.TYPE.enter,
                zone: pZone
            });
        },

        _fireLeaveZone: function(pZone) {
            this.fire(_super.EVENT_TYPE.instant, {
                type: ZoneEntering.TYPE.leave,
                zone: pZone
            });
        },

        _isInZone: function(pZone, pX, pY) {
            return (pX >= pZone.left &&
                pX <= pZone.right &&
                pY >= pZone.top &&
                pY <= pZone.bottom);
        }
    });

    return ZoneEntering;
})(Fingers.Gesture);

Fingers.gesture.ZoneEntering = ZoneEntering;