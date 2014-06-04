/**
 * @module fingers
 *
 * @class FingerUtils
 */

var FingerUtils = {

    getFingersAngle: function(pFinger1, pFinger2) {
        return Utils.getAngle(pFinger2.currentP.x - pFinger1.currentP.x, pFinger2.currentP.y - pFinger1.currentP.y);
    },

    getFingersDistance: function(pFinger1, pFinger2) {
        return Utils.getDistance(pFinger2.currentP.x - pFinger1.currentP.x, pFinger2.currentP.y - pFinger1.currentP.y);
    }
};

Fingers.FingerUtils = FingerUtils;


