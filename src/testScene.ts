import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture } from "@babylonjs/core";
import { Player } from "./player"; // import of the other class

class TestScene {
    constructor  (canvas: HTMLCanvasElement, scene: Scene) {
        // camera
        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        // light
        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        // ground
        var ground: Mesh = MeshBuilder.CreateGround("ground", { width: 10, height: 10}, scene);

        // import class Player
        var player = new Player(scene);
    }
}

export { TestScene };