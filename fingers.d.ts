declare namespace Fingers {
    
    export class Position {
        constructor(
            pTimestamp: number,
            pX: number,
            pY: number,
        )
            
        public timestamp: number;
        public x: number;
        public y: number;
        public set(pTimestamp: number, pX: number, pY: number): void;
        public copy(pPosition: Position): void;
    }

    export class Finger {
        constructor(
            pId: number,
            pTimestamp: number,
            pX: number,
            pY: number 
        );
            
        public id: number;
        public timestamp: number;
        public startP: Position;
        public previousP: Position;
        public currentP: Position;
        public nbListeningInstances: number;

        /*---- time ----*/
        public getTime(): number;
        public getDeltaTime(): number;
        public getTotalTime(): number;
        public getInactivityTime(): number;

        /*---- position ----*/
        public getX(): number;
        public getY(): number;

        /*---- distance ----*/
        public getDeltaX(): number;
        public getDeltaY(): number;
        public getDeltaDistance(): number;
        public getTotalX(): number;
        public getTotalY(): number;
        public getDistance(): number;

        /*---- direction ----*/
        public getDeltaDirection(): number;
        public getDirection(): number;

        /*---- velocity ----*/
        public getVelocityX(): number;
        public getVelocityY(): number;
        public getVelocity(): number;
        public getVelocityAverage(): number;
        public getOrientedVelocityX(): number;
        public getOrientedVelocityY(): number;
    }

    export class Gesture {
        constructor(
            pOptions?: Fingers.gesture.GestureOptions, 
            pDefaults?: Fingers.gesture.GestureOptions
        );
        
        protected isListening: boolean;
        protected fire<T>(event: keyof Gesture['EVENT_TYPE'], data: T): void;

        protected _addListenedFinger(pNewFinger: Finger): void;

        protected _onFingerAdded(pNewFinger: Finger, pFingerList: Finger[]): void;
        protected _onFingerUpdate(pFinger: Finger): void;
        protected _onFingerRemoved(pFinger: Finger): void;

        public addHandler<T>(
            handler: (
                eventType: keyof Gesture['EVENT_TYPE'], 
                data: T, 
                fingerList: Finger[]
            ) => void
        ): Gesture;

        public EVENT_TYPE : {
            instant: "instant",
            start: "start",
            end: "end",
            move: "move"
        };
    }

    

    export class Instance {

        constructor(pElement: HTMLElement);

        public addGesture(
            gesture: typeof Gesture, 
            options?: Fingers.gesture.GestureOptions
        ): Gesture;
    }

    export namespace gesture {

        export interface HoldOptions {
            nbFingers: number;
            distanceThreshold: number;
            duration: number;
        }

        export interface TapOptions {
            nbFingers: number;
            tapInterval: number;
        }

        export interface SwipeOptions {
            nbFingers: number;
            swipeVelocityX: number;
            swipeVelocityY: number;
        }

        export interface PinchOptions {
            pinchInDetect: number;
            pinchOutDetect: number;
        }

        export interface TransformOptions {
            rotation: boolean;
            scale: boolean;
        }

        export interface RawOptions {
            nbMaxFingers: number;
        }

        export type GestureOptions = 
            HoldOptions | 
            TapOptions |
            SwipeOptions |
            PinchOptions |
            TransformOptions |
            RawOptions;

       
        export class Raw extends Gesture {
            constructor(pOptions: RawOptions)
        }

        export class Swipe extends Gesture {
            constructor(pOptions: SwipeOptions)
        }

        export class Tap extends Gesture {
            constructor(pOptions: TapOptions)
        }

        export class Pinch extends Gesture {
            constructor(pOptions: PinchOptions)
        }

        export class Transform extends Gesture {
            constructor(pOptions: TransformOptions, pHandler: Function)
        }

        export class Hold extends Gesture {
            constructor(pOptions: HoldOptions)
        }

        export class Drag extends Gesture {}
        export class Rotate extends Gesture {}
        export class Scale extends Gesture {}
        export class ZoneHover extends Gesture {}

    }
}