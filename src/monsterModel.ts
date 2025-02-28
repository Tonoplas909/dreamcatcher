import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Mesh, AssetsManager, AnimationGroup } from "@babylonjs/core";
import { Monster } from "./monster";

class MonsterModel {
    private monsterInstance: Monster;
    private idleAnimation: AnimationGroup;

    constructor(monsterInstance: Monster) {
        this.monsterInstance = monsterInstance;
    }

    init() {
        this.load();
    }

    load() {
        const assetsManager = new AssetsManager(this.monsterInstance.scene);
        const meshTask = assetsManager.addMeshTask(
            "monster task",
            "",
            "/assets/models/monsters/",
            this.monsterInstance.monsterName + ".gltf"
        );

        meshTask.onSuccess = async (task) => {
            const monsterModel = task.loadedMeshes[0] as Mesh;
            monsterModel.parent = this.monsterInstance.monster; // Attach the model to the monster hitbox

            // parameter
            monsterModel.scaling = this.monsterInstance.monsterScaling;
        };

        meshTask.onError = (task, message, exception) => {
            console.error(message, exception);
        };

        assetsManager.load();
    }
}

export { MonsterModel };
