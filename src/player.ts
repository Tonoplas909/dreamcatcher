import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, StandardMaterial, Texture, Color3 } from "@babylonjs/core";

class Player {
    // varaibles
    mesh: Mesh;
    jump: boolean = false;
    jump_height: number = 0;
    speed: number = 0.1;
    
    constructor (scene: Scene) {
        this.mesh = MeshBuilder.CreateCapsule("player", { height: 1, radius: 0.3 }, scene);
        this.mesh.position.y = 0.5;

        // material
        var material = new StandardMaterial("playerMaterial", scene);
        material.diffuseColor = new Color3(1, 0, 0);
        this.mesh.material = material;
    }
}

export { Player };