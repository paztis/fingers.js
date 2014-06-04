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

    Fingers.__extend(Swipe.prototype, _super.prototype, {

        _onFingerAdded: function(pNewFinger, pFingerList) {
            if(!this.isListening) {
                this._addListenedFingers(pNewFinger);
            }
        },

        _onFingerUpdate: function(pFinger) {
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                var swipeVelocityX = this.options.swipeVelocityX || Swipe.default.swipeVelocityX;
                var swipeVelocityY = this.options.swipeVelocityY || Swipe.default.swipeVelocityY;

                if(pFinger.getVelocityX() > swipeVelocityX || pFinger.getVelocityY() > swipeVelocityY) {
                    this._handler(_super.EVENT_TYPE.end, pFinger.getDeltaDirection(), this.listenedFingers[0]);
                }

                this._removeAllListenedFingers();
            }
        }
    });

    return Swipe;
})(Fingers.Gesture);

Fingers.gesture.Swipe = Swipe;