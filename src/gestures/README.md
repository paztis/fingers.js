
# Fingers.js Gestures

## Options
Each gesture has his set of options

#### Hold defaults
    {
        nbFingers: 1,
        disanceThreshold: 10,
        duration: 500
    };

#### Tap defaults
    {
        nbFingers: 1,
        tapInterval: 400
    };

#### Swipe defaults
    {
        nbFingers: 1,
        swipeVelocityX: 0.6,
        swipeVelocityY: 0.6
    };

#### Pinch defaults
    {
        pinchInDetect: 0.6,
        pinchOutDetect: 1.4
    };

#### Transform defaults
    {
        rotation: true,
        scale: true
    };

#### Drag, Rotate, Scale, Raw
No options

#### Example
    var element = document.getElementById('el_id');
    new Fingers(element).addGesture(Fingers.gesture.Tap, {
         nbFingers: 3,
         tapInterval: 400
     });


## Gesture events
There's 2 kinds of gestures:

- action gestures: fire instant events
- movement gestures: fire start, move then end events

Each event contains:

- its type (instant, start, move, end)
- its data (specific for each gesture)
- the list of concerned Fingers objects

#### Action gesture event exemple
    var element = document.getElementById('el_id');
    new Fingers(element)
        .addGesture(Fingers.gesture.Tap)
        .addHandler(function(eventType, data, fingerList) {
            //eventType === Fingers.Gesture.EVENT_TYPE.instant
        });

#### Movement gesture event exemple
    var element = document.getElementById('el_id');
    new Fingers(element)
        .addGesture(Fingers.gesture.Transform).addHandler(function(pEventType, pData, pFingers) {
            switch(pEventType) {
                case Fingers.Gesture.EVENT_TYPE.start:
                    ...
                    break;
                case Fingers.Gesture.EVENT_TYPE.move:
                    ...
                    break;
                case Fingers.Gesture.EVENT_TYPE.end:
                    ...
                    break;
            }
        });

## Event Data
Each Gesture manage its own data

#### Hold data
No data

#### Tap data
- nbTap: 0,
- lastTapTimestamp: 0

#### Swipe data
- direction
- velocity

#### Pinch data
- grow ('in' or 'out')
- scale

#### Drag data
No data (everything is accessible in finger object)

#### Rotate data
- totalRotation (rotation since the gesture start)
- deltaRotation (rotation since the last gesture move)
angles are in radian

#### Scale data
- totalScale (scale since the gesture start)
- deltaScale (scale since the last gesture move)

#### Transform data
- totalRotation
- deltaRotation
- totalScale
- deltaScale