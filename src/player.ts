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
    dashDistance: number = 25;
    dashCooldown: number = 1.5;
    private lastDashTime: number = 0; // timestamp of the last dash

    // movement properties
    walkSpeed: number = 0.25;
    walkBackSpeed: number = 0.2;
    runSpeed: number = 0.4;

    // camera properties
    MouseSensitivity: number = 0.01;
    cameraSpeed: number = 0.1;
    mouseMovement: number = 0;

    // key bindings
    keyBindings = {
        forward: "z",
        backward: "s",
        left: "q",
        right: "d",
        run: "Shift",
        jump: " ",
        dash: "f",
    };

    // key status
    keyStatus: { [key: string]: boolean } = {};

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        this.scene = scene;
        this.canvas = canvas;

        // initialize key status
        for (const key in this.keyBindings) {
            this.keyStatus[this.keyBindings[key]] = false;
        }

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
                if (key !== this.keyBindings.run) {
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
                if (key !== this.keyBindings.run) {
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
        if (this.isGrounded && this.keyStatus[this.keyBindings.jump]) {
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

            if (
                this.keyStatus[this.keyBindings.forward] ||
                this.keyStatus[this.keyBindings.left] ||
                this.keyStatus[this.keyBindings.backward] ||
                this.keyStatus[this.keyBindings.right]
            ) {
                moving = true;
                let forward = this.camera.getForwardRay().direction;
                forward.y = 0;
                forward.normalize();

                let right = Vector3.Cross(forward, Vector3.Up());
                right.normalize();

                let direction = new Vector3();

                if (this.keyStatus[this.keyBindings.forward]) {
                    direction.addInPlace(forward);
                }
                if (this.keyStatus[this.keyBindings.backward]) {
                    direction.addInPlace(forward.scale(-1));
                }
                if (this.keyStatus[this.keyBindings.left]) {
                    direction.addInPlace(right);
                }
                if (this.keyStatus[this.keyBindings.right]) {
                    direction.addInPlace(right.scale(-1));
                }

                // Normalize the direction to avoid speed addition
                direction.normalize();

                // Apply the appropriate speed
                const speed = this.keyStatus[this.keyBindings.run] ? this.runSpeed : this.walkSpeed;
                direction.scaleInPlace(speed);

                this.player.moveWithCollisions(direction);
            } else if (moving) {
                // stop the player
                moving = false;
                this.speed = 0;

                // TODO: add the stop animation later
            }
            // dash movement
            if (this.keyStatus[this.keyBindings.dash]) {
                this.handleDash();
            }
        });
    }
}

export { Player };
