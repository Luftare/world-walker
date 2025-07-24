import cogwheelUrl from "../assets/cogwheel.png";
import zombieIdle0Url from "../assets/zombie-idle0.png";
import zombieIdle1Url from "../assets/zombie-idle1.png";
import zombieWalk0Url from "../assets/zombie-walk0.png";
import zombieWalk1Url from "../assets/zombie-walk1.png";
import healthPackUrl from "../assets/healthpack.png";
import potatoUrl from "../assets/potato.png";
import sapling0 from "../assets/sapling0.png";
import sapling1 from "../assets/sapling1.png";
import sapling2 from "../assets/sapling2.png";
import characterUrl from "../assets/character.png";
import characterThrowUrl from "../assets/character-throw.png";
import characterAutoGunUrl from "../assets/character-auto-gun.png";
import characterSingleFireUrl from "../assets/character-single-fire.png";
import characterThunderGunUrl from "../assets/character-thunder.png";
import characterMultiGunUrl from "../assets/character-multi-gun.png";
import characterNoGunUrl from "../assets/character-no-gun.png";
import characterSpudblasterUrl from "../assets/character-spudblaster.png";
import zombieTractorUrl from "../assets/zombie-tractor.png";
import fieldTileUrl from "../assets/field-tile.png";

import themeUrl from "../assets/audio/theme.m4a";
import fxZombie1Url from "../assets/audio/fx-zombie-1.m4a";
import fxZombie2Url from "../assets/audio/fx-zombie-2.m4a";
import fxZombie3Url from "../assets/audio/fx-zombie-3.m4a";
import fxZombie4Url from "../assets/audio/fx-zombie-4.m4a";
import fxZombie5Url from "../assets/audio/fx-zombie-5.m4a";
import FXHitUrl from "../assets/audio/fx-hit.m4a";
import FXPlayerHitUrl from "../assets/audio/fx-player-hit.m4a";
import FXPlayerKilledUrl from "../assets/audio/fx-player-killed.m4a";
import FXKillUrl from "../assets/audio/fx-kill.m4a";
import FXPickPotatoUrl from "../assets/audio/fx-pick-potato.m4a";
import FXPickPowerUpUrl from "../assets/audio/fx-pick-powerup.m4a";
import FXSpudBlasterUrl from "../assets/audio/fx-spud-blaster.m4a";
import FXSpudMultiplierUrl from "../assets/audio/fx-spud-multiplier.m4a";
import FXSpudSower3000Url from "../assets/audio/fx-spud-sower-3000.m4a";
import FXSpudThunderUrl from "../assets/audio/fx-spud-thunder.m4a";
import FXThrowUrl from "../assets/audio/fx-throw.m4a";

export const loadAssets = (scene: Phaser.Scene) => {
  scene.load.image("character", characterUrl);
  scene.load.image("character-auto-gun", characterAutoGunUrl);
  scene.load.image("character-single-fire", characterSingleFireUrl);
  scene.load.image("character-thunder", characterThunderGunUrl);
  scene.load.image("character-multi-gun", characterMultiGunUrl);
  scene.load.image("character-no-gun", characterNoGunUrl);
  scene.load.image("character-spudblaster", characterSpudblasterUrl);
  scene.load.image("character-throw", characterThrowUrl);
  scene.load.image("zombie-idle0", zombieIdle0Url);
  scene.load.image("zombie-idle1", zombieIdle1Url);
  scene.load.image("zombie-walk0", zombieWalk0Url);
  scene.load.image("zombie-walk1", zombieWalk1Url);
  scene.load.image("ammo-pack", potatoUrl);

  scene.load.image("sapling-0", sapling0);
  scene.load.image("sapling-1", sapling1);
  scene.load.image("sapling-2", sapling2);
  scene.load.image("cogwheel", cogwheelUrl);
  scene.load.image("projectile", potatoUrl);
  scene.load.image("health-pack", healthPackUrl);
  scene.load.image("zombie-tractor", zombieTractorUrl);
  scene.load.image("field-tile", fieldTileUrl);

  scene.load.audio("theme", themeUrl);
  scene.load.audio("death-music", themeUrl);
  scene.load.audio("fx-zombie-1", fxZombie1Url);
  scene.load.audio("fx-zombie-2", fxZombie2Url);
  scene.load.audio("fx-zombie-3", fxZombie3Url);
  scene.load.audio("fx-zombie-4", fxZombie4Url);
  scene.load.audio("fx-zombie-5", fxZombie5Url);
  scene.load.audio("fx-player-hit", FXPlayerHitUrl);
  scene.load.audio("fx-player-killed", FXPlayerKilledUrl);
  scene.load.audio("fx-hit", FXHitUrl);
  scene.load.audio("fx-kill", FXKillUrl);
  scene.load.audio("fx-pick-potato", FXPickPotatoUrl);
  scene.load.audio("fx-pick-power-up", FXPickPowerUpUrl);
  scene.load.audio("fx-spud-blaster", FXSpudBlasterUrl);
  scene.load.audio("fx-spud-multiplier", FXSpudMultiplierUrl);
  scene.load.audio("fx-spud-sower-3000", FXSpudSower3000Url);
  scene.load.audio("fx-spud-thunder", FXSpudThunderUrl);
  scene.load.audio("fx-throw", FXThrowUrl);
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
