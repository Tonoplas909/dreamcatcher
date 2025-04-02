import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Vector3 } from "@babylonjs/core";
import { Monster } from "./monster";
import { Player } from "../Player/player";

class MonsterAI {
    private monsterInstance: Monster;
    private playerInstance: Player;

    constructor(monsterInstance: Monster, playerInstance: Player) {
        this.monsterInstance = monsterInstance;
        this.playerInstance = playerInstance;
    }

    init() {
        this.monsterInstance.scene.registerBeforeRender(() => {
            this.update();
        });
    }
    
    private update() {
        const distance = Vector3.Distance(this.monsterInstance.monster.position, this.playerInstance.player.position);
        if (distance < 10) {
            this.chasePlayer();
        } else {
            this.patrol();
        }
    }

    private chasePlayer() {
        const direction = this.playerInstance.player.position.subtract(this.monsterInstance.monster.position).normalize();
        this.monsterInstance.monster.position.addInPlace(direction.scale(0.1)); // Move towards the player
    }

    private patrol() {
        // Implement patrol logic here
        // For example, move the monster in a predefined path or randomly within a certain area
        this.monsterInstance.monster.position.x += Math.sin(Date.now() * 0.001) * 0.01; // Example patrol movement
    }
}

export { MonsterAI };