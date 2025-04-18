import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Mesh, AssetsManager, Vector3, AnimationGroup, SceneLoader, Scene } from "@babylonjs/core";
import { Player } from "./player";
import PlayerStateMachine from "./playerStateMachine";

class PlayerModel {
    private playerInstance: Player;
    private animations: { [key: string]: AnimationGroup } = {};

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;
    }

    init() {
        this.load();
    }

    async load() {
        const assetsManager = new AssetsManager(this.playerInstance.scene);
        const meshTask = assetsManager.addMeshTask("player task", "", "/assets/models/", "Untitled.glb");

        meshTask.onSuccess = async (task) => {
            const playerModel = task.loadedMeshes[0] as Mesh;
            playerModel.parent = this.playerInstance.player;
            playerModel.position = Vector3.Zero();
            playerModel.scaling = new Vector3(1, 1, 1);
            playerModel.rotate(Vector3.Up(), Math.PI);
            playerModel.position.y = -0.5;

            const animationNameMap = {
                "idle": "idle",
                "walking": "forward",
                // Ajoute d'autres correspondances ici si nécessaire
            };
            

            task.loadedAnimationGroups.forEach(ag => {
                const rawName = ag.name.toLowerCase(); // Nom brut depuis le .glb
                console.log(rawName)
            
                if (animationNameMap[rawName]) {
                    const stateKey = animationNameMap[rawName];
                    this.animations[stateKey] = ag;
                    ag.stop(); // Stopper l'animation au cas où elle jouerait automatiquement
                    console.log(`Animation "${stateKey}" mappée depuis "${ag.name}"`);
                } else {
                    console.warn(`AnimationGroup non reconnue ou non utilisée: "${ag.name}"`);
                    // ag.dispose(); // Libérer si non utilisée
                }
            });
            

            if (!this.animations['idle'] || !this.animations['forward']) {
                console.error("Certaines animations essentielles n'ont pas été trouvées après le chargement!");
                return;
           }

            // Initialise le state machine avec les animations
            this.setupStateMachine();
            console.log("State machine configurée avec les animations :", this.playerInstance.stateMachine);

            // Joue l'animation idle
            this.playerInstance.stateMachine.changeState("idle");
        };

        meshTask.onError = (task, message, exception) => {
            console.error(message, exception);
        };

        assetsManager.load();
        console.log("Modèle chargé");
    }

    /*async loadAnimations() {
        const animationFiles: { [key: string]: string } = {
            idle: "Idle.glb",
            jump: "great sword jump attack.glb",
            attack: "great sword attack.glb",
            forward: "Walking.glb",
        };

        for (const [key, fileName] of Object.entries(animationFiles)) {
            const anim = await this.load_animation("/assets/animations/", fileName);
            if (anim) {
                this.animations[key] = anim;
            } else {
                console.warn(`Animation "${key}" non chargée.`);
            }
        }

        console.log("Animations chargées :", this.animations);
    }*/

    setupStateMachine() {
        const states = Object.entries(this.animations).reduce((acc, [key, animation]) => {
            acc[key] = {
                onEnter: () => {
                    this.play_animation(animation, true);
                    console.log(`Animation "${key}" jouée.`);
                },
                onExit: () => {
                    animation.stop();
                    console.log(`Animation "${key}" arrêtée.`);
                }
            };
            return acc;
        }, {} as { [key: string]: { onEnter: () => void; onExit: () => void } });

        this.playerInstance.stateMachine = new PlayerStateMachine(states);
    }

    /*async load_animation(path: string, fileName: string): Promise<AnimationGroup | null> {
        try {
            const result = await SceneLoader.ImportAnimationsAsync(path, fileName, this.playerInstance.scene);
            if (result.animationGroups.length > 0) {
                return result.animationGroups[0];
            }
        } catch (error) {
            console.error(`Erreur lors du chargement de ${fileName}:`, error);
        }
        return null;
    }*/

    play_animation(animation: AnimationGroup, loop: boolean) {
        // ... (le code reste le même, utilisez la version corrigée)
         if (!animation) return;
         animation.loopAnimation = loop;
         console.log(`Tentative de démarrage de l'animation <span class="math-inline">\{animation\.name\} avec loop\=</span>{loop}`);
         animation.start(loop, 1.0, animation.from, animation.to, false);
         console.log(`Animation ${animation.name} démarrée.`);
    }
}

export { PlayerModel };

