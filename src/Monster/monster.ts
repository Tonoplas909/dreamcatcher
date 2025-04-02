import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Scene, ArcRotateCamera, Mesh, MeshBuilder, Vector3, StandardMaterial } from "@babylonjs/core";
import { MonsterModel } from "./monsterModel";
import { MonsterAI } from "./monsterAI";
import { Player } from "../Player/player";

class Monster {
    scene: Scene;
    canvas: HTMLCanvasElement;
    monster: Mesh;
    monsterName: String;
    monsterPosition: Vector3;
    monsterScaling: Vector3;
    monsterHitbox: { width: number; height: number; depth: number };
    // import
    model: MonsterModel;
    player: Player;

    constructor(
        canvas: HTMLCanvasElement,
        scene: Scene,
        player: Player,
        monsterName: String,
        monsterPosition: Vector3,
        monsterScaling: Vector3,
        monsterHitbox: { width: number; height: number; depth: number }
    ) {
        this.scene = scene;
        this.canvas = canvas;
        this.monsterName = monsterName;
        this.monsterPosition = monsterPosition;
        this.monsterScaling = monsterScaling;
        this.monsterHitbox = monsterHitbox;
        this.player = player;

        // création de la hitbox
        this.monster = MeshBuilder.CreateBox("monsterHitbox", this.monsterHitbox, this.scene);
        this.monster.isVisible = true; // Masquer la hitbox
        this.monster.position = this.monsterPosition;

        // hitbox material
        const monsterHitBoxMaterial = new StandardMaterial("monsterHitBoxMat", this.scene);
        monsterHitBoxMaterial.alpha = 0.2; // Transparent
        this.monster.material = monsterHitBoxMaterial;

        this.model = new MonsterModel(this);
        this.model.init();

        // AI
        const monsterAI = new MonsterAI(this, this.player);
        monsterAI.init();
    }
}

export { Monster };
