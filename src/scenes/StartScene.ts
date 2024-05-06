import startButton from '../assets/startButton.png'
import sky from '../assets/sky.png'

export default class StartScene extends Phaser.Scene {

  private bestScore = 0;

  constructor() {
    super('StartScene');
  }

  preload() {
    this.load.image('sky', sky);
    this.load.image('startButton', startButton);
  }

  create(object?: { score: number }) {
    if (object)
      this.updateBestScore(object.score)

    this.createBackground()
    this.createBestScore()
    this.createStartButton()

  }

  createBackground() {
    this.add.image(400, 300, 'sky');
  }
  createBestScore() {
    this.add.text(100, 100, `Best Score: ${this.bestScore}`, { fontSize: '32px', color: '#fff' });
  }

  createStartButton() {
    const startButton = this.add.image(400, 300, 'startButton').setInteractive();

    startButton.setScale(0.2);

    startButton.on('pointerdown', () =>
      this.scene.start('HelloWorldScene'));
  }

  updateBestScore(bestScore: number) {
    if (bestScore > this.bestScore) {
      this.bestScore = bestScore
    }
  }
}

