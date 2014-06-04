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