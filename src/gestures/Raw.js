/**
 * @module gestures
 *
 * @class Raw
 * @constructor
 * @param {Object} pOptions
 * @param {Function} pHandler
 * @return {Raw}
 */


var Raw = (function (_super) {

    function Raw(pOptions, pHandler) {
        _super.call(this, pOptions, pHandler);
    }


    Fingers.__extend(Raw.prototype, _super.prototype, {

        _onFingerAdded: function(pNewFinger, pFingerList) {
//            if(!this.isListening) {
                this._addListenedFinger(pNewFinger);

                this.fire(_super.EVENT_TYPE.start, pNewFinger);
//            }
        },

        _onFingerUpdate: function(pFinger) {
            this.fire(_super.EVENT_TYPE.move, pFinger);
        },

        _onFingerRemoved: function(pFinger) {
            if(this.isListenedFinger(pFinger)) {
                this.fire(_super.EVENT_TYPE.end, pFinger);

                this._removeAllListenedFingers();
            }
        }
    });

    return Raw;
})(Fingers.Gesture);

Fingers.gesture.Raw = Raw;