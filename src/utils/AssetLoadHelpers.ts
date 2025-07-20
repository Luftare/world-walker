import cogwheelUrl from "../assets/cogwheel.png";
import debugCompassSquare from "../assets/debug-compass-square.png";
import debugCompassCircle from "../assets/debug-compass-circle.png";
import zombieIdle0Url from "../assets/zombie-idle0.png";
import zombieIdle1Url from "../assets/zombie-idle1.png";
import zombieWalk0Url from "../assets/zombie-walk0.png";
import zombieWalk1Url from "../assets/zombie-walk1.png";
import healthPackUrl from "../assets/healthpack.png";
import potatoUrl from "../assets/potato.png";
import characterUrl from "../assets/character.png";
import characterSpudblasterUrl from "../assets/character-spudblaster.png";
import zombieTractorUrl from "../assets/zombie-tractor.png";
import fieldTileUrl from "../assets/field-tile.png";

import gunshotUrl from "../assets/audio/gunshot.m4a";
import themeUrl from "../assets/audio/theme.m4a";
import zombieGrowlUrl from "../assets/audio/zombie-growl.m4a";
import zombieMoanUrl from "../assets/audio/zombie-moan.m4a";

export const loadAssets = (scene: Phaser.Scene) => {
  scene.load.image("character", characterUrl);
  scene.load.image("character-spudblaster", characterSpudblasterUrl);
  scene.load.image("compass-square", debugCompassSquare);
  scene.load.image("compass-circle", debugCompassCircle);
  scene.load.image("zombie-idle0", zombieIdle0Url);
  scene.load.image("zombie-idle1", zombieIdle1Url);
  scene.load.image("zombie-walk0", zombieWalk0Url);
  scene.load.image("zombie-walk1", zombieWalk1Url);
  scene.load.image("ammo-pack", potatoUrl);
  scene.load.image("cogwheel", cogwheelUrl);
  scene.load.image("projectile", potatoUrl);
  scene.load.image("health-pack", healthPackUrl);
  scene.load.image("zombie-tractor", zombieTractorUrl);
  scene.load.image("field-tile", fieldTileUrl);

  scene.load.audio("gunshot", gunshotUrl);
  scene.load.audio("theme", themeUrl);
  scene.load.audio("zombie-growl", zombieGrowlUrl);
  scene.load.audio("zombie-moan", zombieMoanUrl);
};

export const createAnimations = (scene: Phaser.Scene) => {
  // Create idle animation (1000ms per frame)
  scene.anims.create({
    key: "zombie-idle",
    frames: [{ key: "zombie-idle0" }, { key: "zombie-idle1" }],
    frameRate: 0.4,
    repeat: -1,
  });

  // Create walk animation (700ms per frame)
  scene.anims.create({
    key: "zombie-walk",
    frames: [{ key: "zombie-walk0" }, { key: "zombie-walk1" }],
    frameRate: 3,
    repeat: -1,
  });
};
