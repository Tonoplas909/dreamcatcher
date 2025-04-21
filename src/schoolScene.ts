import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Scene, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture, SceneLoader } from "@babylonjs/core";
import { Player } from "./Player/player"; // import of the other class

class SchoolScene {
    constructor(canvas: HTMLCanvasElement, scene: Scene) {
        scene.collisionsEnabled = true;

        // light
        new HemisphericLight("light1", new Vector3(1, 1, 0), scene);

        // model
        SceneLoader.ImportMesh(
            null, // Import all meshes
            "/assets/models/map/", // Path to the folder containing the model
            "school.glb", // Name of the model file
            scene,
            (meshes) => {
            meshes.forEach(mesh => {
                mesh.checkCollisions = true; // Enable collisions for the imported meshes
            });
            },
            null,
            (scene, message, exception) => {
            console.error("Error loading school.glb:", message, exception);
            }
        );
        

        // import class Player
        const player: Player = new Player(canvas, scene, new Vector3(60, 0, -75)); // Create a new player instance
        // Move the player to a starting position
    }

}

export { SchoolScene };