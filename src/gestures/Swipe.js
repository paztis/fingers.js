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

                    this._handler(_super.EVENT_TYPE.instant, this.data, this.listenedFingers);
                }

                this._removeAllListenedFingers();
            }
        }
    });

    return Swipe;
})(Fingers.Gesture);

Fingers.gesture.Swipe = Swipe;