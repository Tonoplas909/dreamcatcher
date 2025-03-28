import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Mesh, AssetsManager, Vector3, AnimationGroup, SceneLoader, Scene } from "@babylonjs/core";
import { Player } from "./player";
import PlayerStateMachine from "./playerStateMachine";

class PlayerModel {
    private playerInstance: Player;
    private idleAnimation: AnimationGroup;

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;

        const playerStates = {
            idle: {
                onEnter: () => console.log("Entering idle state"),
                onExit: () => console.log("Exiting idle state"),
            },
            running: {
                onEnter: () => console.log("Entering running state"),
                onExit: () => console.log("Exiting running state"),
            },
            jumping: {
                onEnter: () => console.log("Entering jumping state"),
                onExit: () => console.log("Exiting jumping state"),
            },
            falling: {
                onEnter: () => console.log("Entering falling state"),
                onExit: () => console.log("Exiting falling state"),
            },
            attacking: {
                onEnter: () => console.log("Entering attacking state"),
                onExit: () => console.log("Exiting attacking state"),
            },
        };

        this.playerInstance.stateMachine = new PlayerStateMachine(playerStates);
    }

    init() {
        this.load();
    }

    load() {
        const assetsManager = new AssetsManager(this.playerInstance.scene);
        const meshTask = assetsManager.addMeshTask("player task", "", "/assets/models/", "playerTest.glb");

        meshTask.onSuccess = async (task) => {
            const playerModel = task.loadedMeshes[0] as Mesh;
            playerModel.parent = this.playerInstance.player; // Attach the model to the player hitbox
            playerModel.position = Vector3.Zero(); // Reset position relative to the parent

            // scale the model
            playerModel.scaling = new Vector3(0.75, 0.75, 0.75);
            playerModel.rotate(Vector3.Up(), Math.PI); // Rotate the model 180 degrees
            playerModel.position.y = -0.5; // Adjust the position of the model

            const idleAnimation = await this.load_animation("/assets/animations/", "playerIdle.glb");
            this.play_animation(idleAnimation, true);
        };

        meshTask.onError = (task, message, exception) => {
            console.error(message, exception);
        };

        assetsManager.load();
    }

    async load_animation(path: string, fileName: string): Promise<AnimationGroup | null> {
        try {
            const result = await SceneLoader.ImportAnimationsAsync(path, fileName, this.playerInstance.scene);
            if (result.animationGroups.length > 0) {
                return result.animationGroups[0];
            }
        } catch (error) {
            console.error(`Error loading animation from ${fileName}:`, error);
        }
        return null;
    }

    play_animation(animation: AnimationGroup | null, loop: boolean) {
        if (animation) {
            animation.loopAnimation = loop;
            animation.start(true);
        }
    }

    async loadForwardAnimation() {
        const forwardAnimation = await this.load_animation("/assets/animations/", "great sword run.glb");
        this.play_animation(forwardAnimation, false);
    }
}

export { PlayerModel };
