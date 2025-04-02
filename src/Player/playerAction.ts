import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Player } from "./player";
import { MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";
import { Monster } from "../Monster/monster";

class PlayerAction {
    private playerInstance: Player;
    private monsters: Monster[];

    constructor(playerInstance: Player, monsters: Monster[]) {
        this.playerInstance = playerInstance;
        this.monsters = monsters;
    }

    init() {
        window.addEventListener("click", (event) => {
            if (event.button === 0) {
                this.attack();
            }
        });
    }

    attack() {
        // création de la hitbox 
        const hitbox = MeshBuilder.CreateBox("hitbox", {width: 1, height: 2, depth: 1}, this.playerInstance.scene);

        // Matériau rouge pour visualiser la hitbox
        const hitboxMaterial = new StandardMaterial("hitboxMat", this.playerInstance.scene);
        hitboxMaterial.diffuseColor = new Color3(1, 0, 0);
        hitboxMaterial.alpha = 0.5; // Semi-transparent
        hitbox.material = hitboxMaterial;

        // Positionner la hitbox devant le joueur
        const forward = this.playerInstance.player.forward.scale(1); // pour rapprocher la hitbox
        hitbox.position = this.playerInstance.player.position.add(forward);
        hitbox.position.y += 0; // Ajustement hauteur (actuellement au sol)

        // vérifier la collisions entre le monstre et le joueur
        // BUG : lors du click une erreur se produit
        /*this.monsters.forEach((monster, index) => {
            if (hitbox.intersectsMesh(monster.monster, false)) {
                // Faire disparaître le monstre
                monster.monster.dispose();
                this.monsters.splice(index, 1); // Retirer le monstre de la liste
            }
        });*/

        // Faire disparaître la hitbox après 300ms
        setTimeout(() => {
            hitbox.dispose();
        }, 200);
    }
}

export { PlayerAction };