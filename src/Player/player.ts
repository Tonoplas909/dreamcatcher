import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Scene, ArcRotateCamera, Mesh, MeshBuilder, float, Vector3 } from "@babylonjs/core";
import { PlayerMovement } from "./playerMovement";
import { PlayerAction } from "./playerAction";
import { PlayerModel } from "./playerModel";
import { Hud } from "./hud";
import { Monster } from "../Monster/monster";

class Player {
    scene: Scene;
    canvas: HTMLCanvasElement;
    player: Mesh;
    camera: ArcRotateCamera;
    movement: PlayerMovement;
    actions: PlayerAction;
    model: PlayerModel;
    hud: Hud;
    monsters: Monster[];
    playerPosition: Vector3;
    life: float = 100;

    constructor(canvas: HTMLCanvasElement, scene: Scene, playerPosition: Vector3) {
        this.scene = scene;
        this.canvas = canvas;
        this.playerPosition = playerPosition;

        this.player = MeshBuilder.CreateCapsule("player", { height: 1.5, radius: 0.3 }, this.scene);
        this.player.isVisible = false;
        this.player.position = this.playerPosition;
        
        this.camera = new ArcRotateCamera("camera", 0, 1, 7, this.player.position, this.scene);
        this.camera.attachControl(this.canvas, true);
        this.camera.lockedTarget = this.player;

        this.movement = new PlayerMovement(this);
        this.actions = new PlayerAction(this, this.monsters);
        this.model = new PlayerModel(this);
        this.hud = new Hud(this);

        this.model.init();
        this.movement.init();
        this.actions.init();
        this.hud.init();
    }

    takeDamage(amount: number) {
        this.life -= amount;
        this.hud.updateLifeBar();
        if (this.life <= 0) {
            console.log("Player is dead!");
        }
    }
}

export { Player };