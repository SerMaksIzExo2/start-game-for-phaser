import Phaser from 'phaser'
import sky from '../assets/sky.png'
import star from '../assets/star.png'
import ground from '../assets/platform.png'
import dude from '../assets/dude.png'
import bomb from '../assets/bomb.png'

export default class HelloWorldScene extends Phaser.Scene {
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private stars!: Phaser.Physics.Arcade.Group;
    private bombs!: Phaser.Physics.Arcade.Group;
    private bullets!: Phaser.Physics.Arcade.Group;

    private isMoving = true;
    private score = 0;
    private scoreText?: Phaser.GameObjects.Text;

    constructor() {
        super('HelloWorldScene')
    }

    preload() {
        this.load.image('sky', sky);
        this.load.image('ground', ground);
        this.load.image('star', star);
        this.load.image('bomb', bomb);
        this.load.spritesheet('dude',
            dude,
            { frameWidth: 32, frameHeight: 48 }
        );
    }

    create() {
        this.createBackground();
        this.createPlatforms();
        this.createPlayer();
        this.createStars();
        this.createText();
        this.createBombs();
        this.createBullet();
        this.createColliders();
        this.createOverlap()
    }

    update() {
        this.updatePlayer()
    }



    createBackground() {
        this.add.image(400, 300, 'sky');
    }

    createPlatforms() {
        this.platforms = this.physics.add.staticGroup();

        const ground = this.platforms?.create(400, 568, 'ground') as Phaser.Physics.Arcade.Sprite;
        ground.setScale(2).refreshBody();

        this.platforms?.create(600, 400, 'ground');
        this.platforms?.create(50, 250, 'ground');
        this.platforms?.create(750, 220, 'ground');
    }

    createPlayer() {
        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'shoot',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 8 }),
            frameRate: 10,
            repeat: 0
        });


    }

    createStars() {
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        this.stars.children.iterate(c => {
            const child = c as Phaser.Physics.Arcade.Image

            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        })
    }

    createText() {
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#000'
        })
    }

    createBombs() {
        this.bombs = this.physics.add.group();
    }

    createColliders() {
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.bombs, this.platforms);
        this.physics.add.collider(this.player, this.bombs, this.handleHitPlayer, undefined, this);
        this.physics.add.collider(this.bullets, this.platforms, this.handleHitPlatform, undefined, this)
        this.physics.add.collider(this.bullets, this.bombs, this.handleHitBomb, undefined, this)
    }

    createOverlap() {
        this.physics.add.overlap(this.player, this.stars, this.handleCollectStar, undefined, this);
    }

    createBullet() {
        this.bullets = this.physics.add.group({
            defaultKey: 'bomb',
        });

        this.input.on('pointerdown', this.handleHitShoot, this);
    }

    updatePlayer() {
        this.cursors = this.input.keyboard.createCursorKeys();

        if (this.cursors?.left.isDown) {

            this.player?.setVelocityX(-460);

            this.player?.anims.play('left', true);

            this.isMoving = false;
        }

        else if (this.cursors?.right.isDown) {
            this.player?.setVelocityX(460);

            this.player?.anims.play('right', true)

            this.isMoving = true;
        }
        else {
            this.player?.setVelocityX(0);

            this.player?.anims.play('turn');
        }

        if (this.cursors?.up.isDown && this.player?.body.touching.down) {
            this.player.setVelocityY(-330);
        }

    }

    private handleCollectStar(player: Phaser.GameObjects.GameObject, s: Phaser.GameObjects.GameObject) {

        const star = s as Phaser.Physics.Arcade.Image;
        star.disableBody(true, true)

        this.score += 10;
        this.scoreText?.setText('Score:' + this.score);

        if (this.stars?.countActive(true) === 0) {
            this.stars.children.iterate(c => {
                const child = c as Phaser.Physics.Arcade.Image;
                child.enableBody(true, child.x, 0, true, true);
            });
            if (this.player) {

                const x = this.player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

                const bomb = Phaser.Physics.Arcade.Image = this.bombs?.create(x, 16, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(true);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        };

    }

    private handleHitPlayer(player: Phaser.GameObjects.GameObject, b: Phaser.GameObjects.GameObject) {
        this.physics.pause();
        this.player?.setTint((0xff0000));
        this.player?.anims.play('turn');
        this.scene.start('StartScene', { score: this.score });
        this.score = 0;
    }

    private handleHitShoot() {
        if (this.score > 0) {

            const bullet = this.bullets?.get(this.player?.x, this.player?.y)

            if (bullet) {

                if (this.cursors?.left.isDown || this.isMoving === false) {

                    bullet.setVelocityX(-1000);
                    bullet.setVelocityY(-100);
                }
                else if (this.cursors?.right.isDown || this.isMoving === true) {
                    bullet.setVelocityX(1000);
                    bullet.setVelocityY(-100);
                }
                else {
                    bullet.setVelocityX(1000);
                    bullet.setVelocityY(-100);
                }
            }
            this.score -= 1;
            this.scoreText?.setText('Score:' + this.score);
        }
    }

    private handleHitPlatform(b: Phaser.GameObjects.GameObject) {
        const bullet = b as Phaser.Physics.Arcade.Image;
        bullet.destroy()
    }

    private handleHitBomb(bul: Phaser.GameObjects.GameObject, bom: Phaser.GameObjects.GameObject) {
        const bullet = bul as Phaser.Physics.Arcade.Image;
        bullet.destroy();

        const bomb = bom as Phaser.Physics.Arcade.Image;
        bomb.destroy();
    }

}


