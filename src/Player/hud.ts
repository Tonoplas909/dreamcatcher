import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";
import { AdvancedDynamicTexture, Rectangle, TextBlock, Control } from "@babylonjs/gui";
import { Player } from "./player";

class Hud {
    private playerInstance: Player;
    private lifeBar: Rectangle;
    private lifeText: TextBlock;

    constructor(playerInstance: Player) {
        this.playerInstance = playerInstance;
    }

    init() {
        const guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Create the life bar container
        const lifeBarContainer = new Rectangle();
        lifeBarContainer.width = "200px";
        lifeBarContainer.height = "30px";
        lifeBarContainer.cornerRadius = 20;
        lifeBarContainer.color = "white";
        lifeBarContainer.thickness = 2;
        lifeBarContainer.background = "black";
        lifeBarContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        lifeBarContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        lifeBarContainer.left = "20px";
        lifeBarContainer.top = "20px";
        guiTexture.addControl(lifeBarContainer);

        // Create the life bar
        this.lifeBar = new Rectangle();
        this.lifeBar.width = "98%";
        this.lifeBar.height = "80%";
        this.lifeBar.cornerRadius = 20;
        this.lifeBar.color = "green";
        this.lifeBar.thickness = 0;
        this.lifeBar.background = "green";
        lifeBarContainer.addControl(this.lifeBar);

        // Create the life text
        this.lifeText = new TextBlock();
        this.lifeText.text = `Life: ${this.playerInstance.life}`;
        this.lifeText.color = "white";
        this.lifeText.fontSize = 14;
        this.lifeText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.lifeText.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        lifeBarContainer.addControl(this.lifeText);

        // Update the life bar when the player's life changes
        this.updateLifeBar();
    }

    updateLifeBar() {
        const lifePercentage = Math.max(0, this.playerInstance.life) / 100;
        this.lifeBar.width = `${lifePercentage * 98}%`;
        this.lifeBar.background = lifePercentage > 0.5 ? "green" : lifePercentage > 0.2 ? "orange" : "red";
        this.lifeText.text = `Life: ${Math.max(0, Math.floor(this.playerInstance.life))}`;
    }
}

export { Hud };