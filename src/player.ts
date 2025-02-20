import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    Scene,
    ArcRotateCamera,
    Vector3,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Color3,
    ActionManager,
    ExecuteCodeAction,
    AssetsManager,
} from "@babylonjs/core";

class Player {
    // init player variables
    scene: Scene;
    player: Mesh | null = null;
    speed: number;
    camera: ArcRotateCamera;
    // jump
    jumpHeight: number = 1;
    // dash
    dashDistance: number = 10;
    dashCooldown: number = 1.5;
    private lastDashTime: number = 0; // timestamp of the last dash
    // movement
    walkSpeed: number = 0.03;
    walkBackSpeed: number = 0.02;
    runSpeed: number = 0.1;
    // camera
    MouseSensitivity: number = 0.01;
    cameraSpeed: number = 0.1;
    mouseMovement: number = 0;
    // key status
    keyStatus: { [key: string]: boolean } = {
        z: false,
        q: false,
        s: false,
        d: false,
        Shift: false,
        Space: false,
        f: false,
    };

    constructor(scene: Scene) {
        this.scene = scene;

        // BUG : le chargement de la camera ou du model ne marche pas encore 
        const assetManager: AssetsManager = new AssetsManager(this.scene);
        const meshTask = assetManager.addMeshTask("playerTask", "", "/assets/models/", "playerTest.glb");

        meshTask.onSuccess = (task) => {
            this.player = task.loadedMeshes[0] as Mesh;
            this.player.position.y = 1;
            this.player.scaling.scaleInPlace(0.5);

            this.camera = new ArcRotateCamera("camera", 0, 1, 7, this.player.position, this.scene);
            this.camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
            this.camera.upperBetaLimit = 1.5;
            this.camera.alpha = 4.75;
            this.camera.setTarget(this.player);
        };

        meshTask.onError = (task, message, exception) => {
            console.log(message, exception);
        };

        assetManager.load();
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
                this.mouseMovement += event.movementX * this.MouseSensitivity; // get the movement of the mouse
                this.player.rotation.y = this.mouseMovement; // rotate the player
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
            })
        );
    }

    handleDash() {
        const currentTime = Date.now(); // get the current time
        if (currentTime - this.lastDashTime >= this.dashCooldown * 1000) {
            this.lastDashTime = currentTime;
            const dashDirection = this.player.forward.scale(this.dashDistance); // get the dash direction
            this.player.moveWithCollisions(dashDirection);
        }
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
                // déplacement latéral
                let lateralSpeed: number = 0;
                if (this.keyStatus["q"]) {
                    // move left
                    this.player.moveWithCollisions(
                        this.player.right.scaleInPlace(this.keyStatus["Shift"] ? -this.runSpeed : -this.walkSpeed)
                    );
                    if (this.keyStatus["z"] || this.keyStatus["s"]) {
                        lateralSpeed = this.keyStatus["Shift"] ? -this.runSpeed : -this.walkSpeed;
                    } else {
                        return; // prevent moving forward/backward
                    }
                }
                if (this.keyStatus["d"]) {
                    // move right
                    this.player.moveWithCollisions(
                        this.player.right.scaleInPlace(this.keyStatus["Shift"] ? this.runSpeed : this.walkSpeed)
                    );
                    if (this.keyStatus["z"] || this.keyStatus["s"]) {
                        lateralSpeed = this.keyStatus["Shift"] ? this.runSpeed : this.walkSpeed;
                    } else {
                        return; // prevent moving forward/backward
                    }
                }

                // move the player
                let direction: Vector3 = new Vector3(lateralSpeed, 0, this.speed);
                direction = Vector3.TransformNormal(direction, this.player.getWorldMatrix());
                direction.y = 0;
                this.player.moveWithCollisions(direction);
            } else if (moving) {
                // stop the player
                moving = false;
                this.speed = 0;

                // TODO: add the stop animation later
            }
            // dash movement
            if (this.keyStatus["f"]) {
                this.handleDash();
            }
        });
    }
}

export { Player };
