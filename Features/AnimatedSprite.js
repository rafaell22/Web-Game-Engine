/**
 * @property {number}           animationSpeed
 * @property {boolean}          loop
 * @property {boolean}          updateAnchor
 * @property {function}         onComplete
 * @property {function}         onFrameChange
 * @property {function}         onLoop
 * @property {boolean}          _playing
 * @property {PIXI.Texture[]}   _textures
 * @property {boolean}         _autoUpdate
 * @property {boolean}         _isConnectedToTicker
 * @property {number}         _currentTime
 * @property {number}         _previousFrame
 * @type {[type]}
 */
export default class AnimatedSprite extends PIXI.Sprite {
    /**
     * @param textures - An array of {@link PIXI.Texture} or frame
     *  objects that make up the animation.
     * @param {boolean} [autoUpdate=true] - Whether to use PIXI.Ticker.shared to auto update animation time.
     */
    constructor(textures, animations, initialAnimation, autoUpdate = false) {
        super(textures[animations[initialAnimation].textures[0]]);

        this._textures = null;
        this._animations = null;
        this._autoUpdate = autoUpdate;
        this._isConnectedToTicker = false;

        this.animationSpeed = 1;
        this.loop = true;
        this.updateAnchor = false;
        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;

        this._currentTime = 0;
        this._timeForNextFrame = 0;
        this._currentAnimation = null;

        this._playing = false;
        this._previousFrame = null;
        this.animations = animations;
        this.textures = textures;
        this.currentAnimation = initialAnimation;
    }
    
    set animations(animations) {
        this.stop();
        this._animations = animations;
    }
    
    get animations() {
        return this._animations;
    }
    
    // get current animation
    get animation() {
        return this._animations[this._currentAnimation];
    }
    
    /**
     * Change the current running animation
     * @param  {string}  animationName                     Name of the animation to switch to
     * @param  {boolean} [afterFinish=false]               Whether to wait for the current animation to finish before changing to the new one
     */
    set currentAnimation(animationName) {
        // if animation is not found, we keep the same animation
        if(!this._animations[animationName]) {
          return;
        }
        
        this._currentAnimation = animationName;
        this._resetAnimation();
        this._updateTexture();
        // TODO - implement logic for whether to switch animation during or after the previous one finished
        // Use onLoop and onComplete
    }
    
    get currentAnimation() {
      return this._currentAnimation;
    }
    
    _resetAnimation() {
      this._currentFrame = 0;
      this._previousFrame = null;
      this._currentTime = 0;
      this._timeForNextFrame = this.frameDuration;
    }

    /** Stops the AnimatedSprite. */
    stop() {
        if (!this._playing) {
            return;
        }

        this._playing = false;
        if (this._autoUpdate && this._isConnectedToTicker) {
            PIXI.Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
        }
    }

    /** Plays the AnimatedSprite. */
    play() {
        if (this._playing) {
            return;
        }

        this._playing = true;

        if (
          this._timeForNextFrame === 0 || 
          this._timeForNextFrame === null ||
          typeof this._timeForNextFrame === typeof void 0
        ) {
          this._timeForNextFrame = this.frameDuration;
        }

        if (this._autoUpdate && !this._isConnectedToTicker) {
            PIXI.Ticker.shared.add(this.update, this, PIXI.UPDATE_PRIORITY.HIGH);
            this._isConnectedToTicker = true;
        }
    }
    
    playOnce() {
      if (this._playing) {
          this.stop();
      }
      
      this.loop = false;
      this._resetAnimation();
      this.play();
    }

    /**
     * Stops the AnimatedSprite and goes to a specific frame.
     * @param {number} frameNumber - Frame index to stop at.
     */
    gotoAndStop(frameNumber) {
        this.stop();

        this._currentFrame = frameNumber;
        this._updateTexture();
    }

    /**
     * Goes to a specific frame and begins playing the AnimatedSprite.
     * @param {number} frameNumber - Frame index to start at.
     */
    gotoAndPlay(frameNumber) {
        const previousFrame = this.currentFrame;
        this._currentFrame = frameNumber;
        if (previousFrame !== this.currentFrame) {
            this._updateTexture();
        }

        this.play();
    }
    
    get frameDuration() {
      const animation = this._animations[this._currentAnimation];
      
      if(typeof animation.durations === 'number') {
          return animation.durations;
      } else {
          return animation.durations[this._currentFrame];
      }
    }

    /**
     * Updates the object transform for rendering.
     * @param {number} deltaTime - Time since last tick.
     */
    update(deltaTime) {
        if (!this._playing) {
            return;
        }
        

        if (this.frameDuration === 0) {
          this.stop();
        }
        
        const animation = this._animations[this._currentAnimation];

        if (!this.loop && this._currentFrame >= animation.textures.length) {
          return;
        }

        const elapsed = this.animationSpeed * deltaTime;
        const previousFrame = this.currentFrame;
        this._currentTime += elapsed;
        
        // in case it is time to switch to the next frame
        if(this._currentTime >= this._timeForNextFrame) {
            this._currentFrame += 1;
            this._timeForNextFrame += this.frameDuration;

           // in case we need to restart animation from the first frame
           if(this._currentFrame >= animation.textures.length && this.loop) {
                this._currentFrame = 0;
                this._currentTime = 0;
                this._timeForNextFrame = this.frameDuration;
            }
        }

        if (!this.loop && this._currentFrame >= animation.textures.length) {
          this._playing = false;
          if (this.onComplete) {
              this.onComplete();
          }
        } else if(previousFrame !== this.currentFrame) {
          if (this.loop && this.onLoop) {
            this.onLoop();
          }

          this._updateTexture();
        }
    }

    /** Updates the displayed texture to match the current frame index. */
    _updateTexture() {
        if (
          !this._animations ||
          !this._textures ||
          !this._currentAnimation
        ) {
          return;
        }
        const currentFrame = this.currentFrame;

        if (this._previousFrame === currentFrame) {
            return;
        }
        
        this._previousFrame = currentFrame;

        this._texture = this._textures[this._animations[this._currentAnimation].textures[currentFrame]];
        this._textureID = -1;
        this._textureTrimmedID = -1;
        this._cachedTint = 0xFFFFFF;
        this.uvs = this._texture._uvs.uvsFloat32;

        if (this.updateAnchor) {
            this._anchor.copyFrom(this._texture.defaultAnchor);
        }

        if (this.onFrameChange) {
            this.onFrameChange(this.currentFrame);
        }
    }

    /**
     * Stops the AnimatedSprite and destroys it.
     * @param {object|boolean} [options] - Options parameter. A boolean will act as if all options
     *  have been set to that value.
     * @param {boolean} [options.children=false] - If set to true, all the children will have their destroy
     *      method called as well. 'options' will be passed on to those calls.
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the sprite as well.
     * @param {boolean} [options.baseTexture=false] - Should it destroy the base texture of the sprite as well.
     */
    destroy(options) {
        this.stop();
        super.destroy(options);

        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;
    }

    /**
     * The total number of frames in the AnimatedSprite. This is the same as number of textures
     * assigned to the AnimatedSprite.
     * @readonly
     * @return {number} Returns the number of textures
     */
    get totalFrames() {
        return this.animations[this._currentAnimation].textures.length;
    }

    /** The array of textures used for this AnimatedSprite.
     ** @return {number} Returns the textures
     */
    get textures() {
        return this._textures;
    }

    /**
     * Set the sprites textures
     * @param  {PIXI.Texture} value
     */
    set textures(value) {
      this._textures = value;
      this._previousFrame = null;
      this.gotoAndStop(0);
    }

    /**
     * The AnimatedSprites current frame index.
     * @return {number} Index of the current animation frame
     */
    get currentFrame() {
        return this._currentFrame;
    }

    /**
     * Indicates if the AnimatedSprite is currently playing.
     * @return {boolean} Returns true if the sprite is running an animation
     */
    get playing() {
        return this._playing;
    }

    /**
     * Whether to use PIXI.Ticker.shared to auto update animation time.
     * @return {boolean}         Returns true if the sprite animation is tied to PIXI.Ticker
     */
    get autoUpdate() {
        return this._autoUpdate;
    }

    /**
     * Sets whether to use PIXI.Ticker.shared to auto update animation time.
     * @param  {boolean} value
     */
    set autoUpdate(value) {
        if (value !== this._autoUpdate) {
            this._autoUpdate = value;

            if (!this._autoUpdate && this._isConnectedToTicker) {
                PIXI.Ticker.shared.remove(this.update, this);
                this._isConnectedToTicker = false;
            } else if (this._autoUpdate && !this._isConnectedToTicker && this._playing) {
                PIXI.Ticker.shared.add(this.update, this);
                this._isConnectedToTicker = true;
            }
        }
    }
}
