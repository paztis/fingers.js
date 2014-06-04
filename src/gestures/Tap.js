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

                    this._handler(_super.EVENT_TYPE.instant, this.nbTap, this.listenedFingers);
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