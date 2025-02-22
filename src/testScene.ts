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
        scene.collisionsEnabled = true;

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
        ground.checkCollisions = true;


        // cube 1
        var cube1: Mesh = MeshBuilder.CreateBox("cube1", { size: 2 }, scene);
        cube1.position.y = 1;
        cube1.position.x = 5;
        var cubeMaterial: StandardMaterial = new StandardMaterial("cubeMaterial", scene);
        cubeMaterial.diffuseTexture = new Texture("/assets/textures/greenPrototype.png", scene);
        cube1.material = cubeMaterial;
        cube1.checkCollisions = true;

        // plane incline
        var incline: Mesh = MeshBuilder.CreateGround("incline", { width: 2, height: 2.8 }, scene);
        incline.rotation.x = Math.PI / 4;
        incline.position = new Vector3(5, 1, 2);
        var inclineMaterial: StandardMaterial = new StandardMaterial("inclineMaterial", scene);
        inclineMaterial.diffuseTexture = new Texture("/assets/textures/greenPrototype.png", scene);
        incline.material = inclineMaterial;
        incline.checkCollisions = true;

        // import class Player
        var player: Player = new Player(canvas, scene);

        // call player movement
        player.movement();
    }
}

export { TestScene };
