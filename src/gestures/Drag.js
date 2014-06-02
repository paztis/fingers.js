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