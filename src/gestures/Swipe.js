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

    function Swipe(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);
    }

    Swipe.default = {
        swipeVelocityX: 0.6,
        swipeVelocityY: 0.6
    };

    __extend(Swipe.prototype, _super.prototype, {

        _onFingerAddedImpl: function(pFingerList) {
            this._startListeningFingers(pFingerList[0]);
        },

        _onFingerUpdate: function() {
        },

        _onFingerRemovedImpl: function(pFinger) {
            var swipeVelocityX = this.options.swipeVelocityX || Swipe.default.swipeVelocityX;
            var swipeVelocityY = this.options.swipeVelocityY || Swipe.default.swipeVelocityY;

            if(pFinger.getVelocityX() > swipeVelocityX || pFinger.getVelocityY() > swipeVelocityY) {
                this._handler(_super.EVENT_TYPE.end, pFinger.getDeltaDirection(), this.listenedFingers[0]);
            }

            this._stopListeningFingers();
        }
    });

    return Swipe;
})(Fingers.Gesture);

Fingers.gesture.Swipe = Swipe;