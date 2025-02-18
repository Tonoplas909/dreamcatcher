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
    jumpHeight: number = 1;
    walkSpeed: number = 0.03;
    walkBackSpeed: number = 0.02;
    runSpeed: number = 0.2;
    rotationSpeed: number = 0.03;
    cameraSpeed: number = 0.1;
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
        var camera = new ArcRotateCamera("camera", 0, 1, 10, Vector3.Zero(), this.scene);
        camera.speed = this.cameraSpeed;
        camera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        camera.setTarget(this.player);
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
                if (this.keyStatus["q"]) {
                    // rotate the player
                    this.player.rotate(Vector3.Up(), -this.rotationSpeed);
                }
                if (this.keyStatus["d"]) {
                    // rotate the player
                    this.player.rotate(Vector3.Up(), this.rotationSpeed);
                }

                // move the player
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
