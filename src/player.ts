import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
    Color3,
    ActionManager,
    ExecuteCodeAction,
    Action,
} from "@babylonjs/core";

class Player {
    // init player variables
    scene: Scene;
    player: Mesh;
    speed: number;
    camera: ArcRotateCamera;
    jumpHeight: number = 1;
    walkSpeed: number = 0.03;
    walkBackSpeed: number = 0.02;
    runSpeed: number = 0.2;
    MouseSensitivity: number = 0.01;
    cameraSpeed: number = 0.1;
    yaw: number = 0;
    keyStatus: { [key: string]: boolean } = {
        z: false,
        q: false,
        s: false,
        d: false,
        Shift: false,
    };

    constructor(scene: Scene) {
        this.scene = scene;

        this.player = MeshBuilder.CreateCapsule("player", { height: 1, radius: 0.3 }, this.scene);
        this.player.position.y = 0.5;

        // material
        var material = new StandardMaterial("playerMaterial", this.scene);
        material.diffuseColor = new Color3(1, 0, 0);
        this.player.material = material;

        // 3rd person camera
        this.camera = new ArcRotateCamera("camera", 0, 1, 7, this.player.position, this.scene);
        this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        this.camera.upperBetaLimit = 1.5;
        this.camera.alpha = 4.75; // angle of the camera
        this.camera.lockedTarget = this.player;

        this.attachMouseControl();
    }

    // function to attach mouse control
    attachMouseControl() {
        const canvas: HTMLCanvasElement = this.scene.getEngine().getRenderingCanvas();
        
        canvas.addEventListener("click", () => {
            canvas.requestPointerLock();
        });

        // mouse move event listener
        document.addEventListener("mousemove", (event) => {
            if (document.pointerLockElement === canvas) {
                this.yaw += event.movementX * this.MouseSensitivity; // get the movement of the mouse
                this.player.rotation.y = this.yaw; // rotate the player
            }
        });
    }

    // function to handle key events
    handleKeyEvents() {
        // action manager for key events
        this.scene.actionManager = new ActionManager(this.scene);

        // key down event listener
        this.scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event) => {
                let key = event.sourceEvent.key; // get the key
                if (key !== "Shift") {
                    key = key.toLowerCase();
                }
                // check if the key is in the table
                if (key in this.keyStatus) {
                    this.keyStatus[key] = true;
                }
                // console.log(this.keyStatus);
            })
        );

        // key up event listener
        this.scene.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (event) => {
                let key = event.sourceEvent.key; // get the key
                if (key !== "Shift") {
                    key = key.toLowerCase();
                }
                // check if the key is in the table
                if (key in this.keyStatus) {
                    this.keyStatus[key] = false;
                }
                // console.log(this.keyStatus);
            })
        );
    }

    // movement player function
    movement() {
        // call the function to handle key events
        this.handleKeyEvents();

        let moving = false; // check if the player is moving

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.keyStatus["z"] || this.keyStatus["q"] || this.keyStatus["s"] || this.keyStatus["d"]) {
                moving = true;
                if (this.keyStatus["s"] && !this.keyStatus["z"]) {
                    // move backward
                    this.speed = -this.walkBackSpeed;
                } else if (this.keyStatus["z"] || this.keyStatus["q"] || this.keyStatus["d"]) {
                    // move forward
                    this.speed = this.keyStatus["Shift"] ? this.runSpeed : this.walkSpeed; // check if the player is running
                }

                // move the player
                let direction: Vector3 = new Vector3(0, 0, this.speed);
                direction = Vector3.TransformNormal(direction, this.player.getWorldMatrix());
                direction.y = 0;
                this.player.moveWithCollisions(this.player.forward.scaleInPlace(this.speed));
            } else if (moving) {
                // stop the player
                moving = false;
                this.speed = 0;

                // TODO: add the stop animation later
            }
        });
    }
}

export { Player };
