import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Mesh, AssetsManager, Vector3 } from "@babylonjs/core";
import { Player } from "./player";

class PlayerModel {
    private playerInstance: Player;

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;
    }

    init() {
        this.load();
    }

    load() {
        const assetsManager = new AssetsManager(this.playerInstance.scene);
        const meshTask = assetsManager.addMeshTask("player task", "", "/assets/models/", "playerTest.glb");

        meshTask.onSuccess = (task) => {
            const playerModel = task.loadedMeshes[0] as Mesh;
            playerModel.parent = this.playerInstance.player; // Attach the model to the player hitbox
            playerModel.position = Vector3.Zero(); // Reset position relative to the parent

            // scale the model
            playerModel.scaling = new Vector3(0.15, 0.15, 0.15);
            playerModel.rotate(Vector3.Up(), Math.PI); // Rotate the model 180 degrees
            playerModel.position.y = -0.5; // Adjust the position of the model
        };

        meshTask.onError = (task, message, exception) => {
            console.error(message, exception);
        };

        assetsManager.load();
    }
}

export { PlayerModel };