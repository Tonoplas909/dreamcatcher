import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Scene, ArcRotateCamera, Mesh, MeshBuilder } from "@babylonjs/core";
import { PlayerMovement } from "./playerMovement";
import { PlayerAction } from "./playerAction";
import { PlayerModel } from "./playerModel";
import PlayerStateMachine from "./playerStateMachine";

class Player {
    scene: Scene;
    canvas: HTMLCanvasElement;
    player: Mesh;
    camera: ArcRotateCamera;
    movement: PlayerMovement;
    actions: PlayerAction;
    model: PlayerModel;
    stateMachine: PlayerStateMachine<any>;

    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        this.scene = scene;
        this.canvas = canvas;

        this.player = MeshBuilder.CreateCapsule("player", { height: 1.5, radius: 0.3 }, this.scene);
        this.player.isVisible = false;

        this.camera = new ArcRotateCamera("camera", 0, 1, 7, this.player.position, this.scene);
        this.camera.attachControl(this.canvas, true);
        this.camera.lockedTarget = this.player;

        this.movement = new PlayerMovement(this);
        this.actions = new PlayerAction(this);
        this.model = new PlayerModel(this);

        this.model.init();
        this.movement.init();
        this.actions.init();
    }
}

export { Player };
