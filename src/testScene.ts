import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    Scene,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Texture,
} from "@babylonjs/core";
import { Player } from "./player"; // import of the other class

class TestScene {
    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        // light
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        // ground
        var ground: Mesh = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);

        // Apply texture to ground
        var groundMaterial: StandardMaterial = new StandardMaterial("groundMaterial", scene);
        var groundTexture: Texture = new Texture("/assets/textures/blackPrototype.png", scene);
        // set the texture scaling
        groundTexture.uScale = 5
        groundTexture.vScale = 5;

        groundMaterial.diffuseTexture = groundTexture;
        ground.material = groundMaterial;

        // import class Player
        var player: Player = new Player(scene);

        // call player movement
        player.movement();
    }
}

export { TestScene };
