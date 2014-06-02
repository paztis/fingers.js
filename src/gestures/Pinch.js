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