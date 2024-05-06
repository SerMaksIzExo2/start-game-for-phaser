import Phaser from 'phaser'

import HelloWorldScene from './scenes/HelloWorldScene'
import StartScene from './scenes/StartScene'

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
			debug: false
		}
	},
	scene: [StartScene, HelloWorldScene]
}

export default new Phaser.Game(config)
