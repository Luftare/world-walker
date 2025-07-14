import compassUrl from "../assets/compass.png";
import ammoPackUrl from "../assets/ammo-pack.png";
import coinUrl from "../assets/coin.png";
import debugCompassSquare from "../assets/debug-compass-square.png";
import debugCompassCircle from "../assets/debug-compass-circle.png";
import zombieIdle0Url from "../assets/zombie-idle0.png";
import zombieIdle1Url from "../assets/zombie-idle1.png";
import zombieWalk0Url from "../assets/zombie-walk0.png";
import zombieWalk1Url from "../assets/zombie-walk1.png";
import healthPackUrl from "../assets/health-pack.png";

export const loadAssets = (scene: Phaser.Scene) => {
  scene.load.image("character", compassUrl);
  scene.load.image("compass-square", debugCompassSquare);
  scene.load.image("compass-circle", debugCompassCircle);
  scene.load.image("zombie-idle0", zombieIdle0Url);
  scene.load.image("zombie-idle1", zombieIdle1Url);
  scene.load.image("zombie-walk0", zombieWalk0Url);
  scene.load.image("zombie-walk1", zombieWalk1Url);
  scene.load.image("ammo-pack", ammoPackUrl);
  scene.load.image("coin", coinUrl);
  scene.load.image("projectile", debugCompassCircle); // Using same texture for now
  scene.load.image("health-pack", healthPackUrl);
};
