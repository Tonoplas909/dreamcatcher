import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Player } from "./player";

class PlayerAction {
    private playerInstance: Player;

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;
    }

    init() {
        // TODO; faire les attaques du joueur
    }
}

export { PlayerAction };