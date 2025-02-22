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
    // Existing properties
    scene: Scene;
    canvas: HTMLCanvasElement;
    player: Mesh;
    speed: number;
    camera: ArcRotateCamera;
    life: number = 100;

    // jump properties
    jumpHeight: number = 1;
    gravity: number = -9.81;
    verticalVelocity: number = 0;
    isJumping: boolean = false;
    isGrounded: boolean = true;

    // dash properties
    dashDistance: number = 10;
    dashCooldown: number = 1.5;
    private lastDashTime: number = 0; // timestamp of the last dash

    // movement properties
    walkSpeed: number = 0.03;
    walkBackSpeed: number = 0.02;
    runSpeed: number = 0.1;

    // camera properties
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
        " ": false, // space
        f: false,
    };

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        this.scene = scene;
        this.canvas = canvas;

        // create the player
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
        this.camera.alpha = 4.75; // angle of the camera;
        this.camera.lockedTarget = this.player;

        // collision management
        this.scene.collisionsEnabled = true;
        this.player.checkCollisions = true;
        this.player.ellipsoid = new Vector3(0.3, 0.3, 0.3); // Adjust the size of the collision box
        this.player.ellipsoidOffset = new Vector3(0, 0.3, 0); // Adjust the offset of the collision box

        this.attachMouseControl();
    }

    // function to attach mouse control
    attachMouseControl() {
        this.canvas.addEventListener("click", () => {
            this.canvas.requestPointerLock();
        });

        // mouse move event listener
        document.addEventListener("mousemove", (event) => {
            if (document.pointerLockElement === this.canvas) {
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

    handleJump() {
        if (this.isGrounded && this.keyStatus[" "]) {
            this.verticalVelocity = Math.sqrt(2 * Math.abs(this.gravity) * this.jumpHeight);
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    applyGravity(deltaTime: number) {
        // Apply gravity to vertical velocity
        this.verticalVelocity += this.gravity * deltaTime;

        // Update position based on vertical velocity
        let verticalMovement = new Vector3(0, this.verticalVelocity * deltaTime, 0);
        this.player.moveWithCollisions(verticalMovement);

        // Check if player is on the ground (y position <= initial height)
        if (this.player.position.y <= 0.5) {
            // 0.5 is the initial height
            this.player.position.y = 0.5;
            this.verticalVelocity = 0;
            this.isGrounded = true;
            this.isJumping = false;
        }
    }

    // movement player function
    movement() {
        // call the function to handle key events
        this.handleKeyEvents();
        let moving = false; // check if the player is moving

        this.scene.onBeforeRenderObservable.add(() => {
            // Calculate delta time
            const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

            // Handle jumping and gravity
            this.handleJump();
            this.applyGravity(deltaTime);

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
