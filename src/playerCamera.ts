import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Player } from "./player";

class PlayerCamera {
    private playerInstance: Player;

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;
    }

    init() {
        this.playerInstance.canvas.addEventListener("click", () => {
            this.playerInstance.canvas.requestPointerLock();
        });

        document.addEventListener("mousemove", (event) => {
            if (document.pointerLockElement === this.playerInstance.canvas) {
                this.playerInstance.player.rotation.y += event.movementX * 0.01;
            }
        });
    }
}

export { PlayerCamera };