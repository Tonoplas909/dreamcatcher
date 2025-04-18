import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { Vector3, Scalar } from "@babylonjs/core";
import { Player } from "./player";

class PlayerMovement {
    private playerInstance: Player;
    private keyStatus: { [key: string]: boolean } = {};

    private walkSpeed = 0.25;
    private runSpeed = 0.4;
    private jumpHeight = 1;
    private gravity = -9.81;
    private verticalVelocity = 0;
    private isJumping = false;
    private isGrounded = true;
    private dashDistance = 25;
    private dashCooldown = 1.5;
    private lastDashTime = 0;

    private bindings = {
        forward: "z",
        backward: "s",
        left: "q",
        right: "d",
        run: "shift",
        jump: " ",
        dash: "f",
    };

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;
    }

    init() {
        this.setupKeyListeners();
        this.setupCollision();
        this.playerInstance.scene.onAfterRenderObservable.add(() => this.update());
        console.log("Movement initialized");
    }

    private setupKeyListeners() {
        for (const key in this.bindings) {
            this.keyStatus[this.bindings[key]] = false;
        }

        window.addEventListener("keydown", (event) => {
            const key = event.key.toLowerCase();
            if (key in this.keyStatus) {
                this.keyStatus[key] = true;
            }
        });

        window.addEventListener("keyup", (event) => {
            const key = event.key.toLowerCase();
            if (key in this.keyStatus) this.keyStatus[key] = false;
        });
    }

    private update() {
        if (!this.playerInstance.stateMachine)
            return;
        const deltaTime = this.playerInstance.scene.getEngine().getDeltaTime() / 1000;
        this.handleMovement(deltaTime);
        this.handleJump();
        this.applyGravity(deltaTime);
        if (this.keyStatus[this.bindings.dash]) this.handleDash();
    }

    private handleMovement(deltaTime: number) {
        const { camera, player } = this.playerInstance;
        let direction = new Vector3();

        const forward = camera.getForwardRay().direction;
        const right = Vector3.Cross(forward, Vector3.Up());

        if (!this.isGrounded) {
            this.playerInstance.stateMachine.changeState("falling");
        }

        if (this.keyStatus[this.bindings.forward]) {
            direction.addInPlace(forward);
            this.playerInstance.stateMachine.changeState("forward");
        }
        if (this.keyStatus[this.bindings.backward]) {
            direction.addInPlace(forward.scale(-1));
        }
        if (this.keyStatus[this.bindings.left]) {
            direction.addInPlace(right);
        }
        if (this.keyStatus[this.bindings.right]) {
            direction.addInPlace(right.scale(-1));
        }

        if (direction.length() === 0) {
            this.playerInstance.stateMachine.changeState("idle");
        }

        direction.y = 0;
        direction.normalize();

        // Align player rotation with camera direction
        const cameraDirection = camera.getForwardRay().direction;
        cameraDirection.y = 0;
        cameraDirection.normalize();
        const targetRotationY = Math.atan2(cameraDirection.x, cameraDirection.z);
        player.rotation.y = targetRotationY;

        const speed = this.keyStatus[this.bindings.run] ? this.runSpeed : this.walkSpeed;
        direction.scaleInPlace(speed);

        player.moveWithCollisions(direction);
    }

    private applyGravity(deltaTime: number) {
        this.verticalVelocity += this.gravity * deltaTime;
        let verticalMovement = new Vector3(0, this.verticalVelocity * deltaTime, 0);
        this.playerInstance.player.moveWithCollisions(verticalMovement);

        if (this.playerInstance.player.position.y <= 0.5) {
            this.playerInstance.player.position.y = 0.5;
            this.verticalVelocity = 0;
            this.isGrounded = true;
            this.isJumping = false;
        }
    }

    private handleJump() {
        if (this.isGrounded && this.keyStatus[this.bindings.jump]) {
            this.verticalVelocity = Math.sqrt(2 * Math.abs(this.gravity) * this.jumpHeight);
            this.isJumping = true;
            this.isGrounded = false;
        }
    }

    private handleDash() {
        const currentTime = Date.now(); // get the current time
        if (currentTime - this.lastDashTime >= this.dashCooldown * 1000) {
            this.lastDashTime = currentTime;
            const dashDirection = this.playerInstance.camera.getForwardRay().direction; // get the dash direction
            dashDirection.y = 0; // keep the dash direction horizontal
            dashDirection.normalize();
            dashDirection.scaleInPlace(this.dashDistance / 10); // scale down the dash distance

            const dashDuration = 0.2; // duration of the dash in seconds
            const dashSpeed = this.dashDistance / dashDuration / 10; // scale down the dash speed

            const dashStartTime = currentTime;
            this.playerInstance.scene.onBeforeRenderObservable.add(() => {
                const elapsedTime = (Date.now() - dashStartTime) / 1000;
                if (elapsedTime < dashDuration) {
                    const dashMovement = dashDirection.scale(
                        (dashSpeed * this.playerInstance.scene.getEngine().getDeltaTime()) / 1000
                    );
                    this.playerInstance.player.moveWithCollisions(dashMovement);
                }
            });
        }
    }

    // BUG: la moitié de la hitbox du joueur est dans le sol
    private setupCollision() {
        // Activer les collisions pour la scène et le joueur
        this.playerInstance.scene.collisionsEnabled = true;
        this.playerInstance.player.checkCollisions = true;

        // Définir la taille de l'ellipsoïde de collision
        this.playerInstance.player.ellipsoid = new Vector3(0.3, 0.3, 0.3); // Ajuste la taille en fonction de ton modèle

        // Définir l'offset de l'ellipsoïde
        this.playerInstance.player.ellipsoidOffset = new Vector3(0, 0.3, 0); // Ajuste la hauteur du joueur
    }
}

export { PlayerMovement };
