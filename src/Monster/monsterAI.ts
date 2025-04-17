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

        if (distance < 2) {
            this.attack(); // Attack the player if close enough
        }
    }

    private chasePlayer() {
        // Vérifier si la hitbox du monstre entre en collision avec celle du joueur
        if (this.monsterInstance.monster.intersectsMesh(this.playerInstance.player, false)) {
            return; // Ne pas avancer si une collision est détectée
        }

        // Si pas de collision, continuer à poursuivre le joueur
        const direction = this.playerInstance.player.position
            .subtract(this.monsterInstance.monster.position)
            .normalize();
        this.monsterInstance.monster.position.addInPlace(direction.scale(0.1)); // Déplacer vers le joueur
    }

    private patrol() {
        // Implement patrol logic here
        // For example, move the monster in a predefined path or randomly within a certain area
        this.monsterInstance.monster.position.x += Math.sin(Date.now() * 0.001) * 0.01; // Example patrol movement
    }

    private attack() {
        // Implement attack logic here
        // For example, reduce player health or trigger an animation
        this.playerInstance.takeDamage(1);
        console.log("Monster attacked the player! Player life: " + this.playerInstance.life);
    }
}

export { MonsterAI };