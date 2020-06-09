import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import PlayerShield from 'components/game/player-health/PlayerShieldV2';

export default function PlayerHealth({
  health,
  player,
  shieldPoints,
  wasAttacked
}) {
  const [animation, setAnimation] = useState(false);
  // const [context, setContext] = useState();
  var context;
  var targetContainer;
  var time = null;
  var dt = null;
  var currentFillPercentage = 0;
  var fillPercentage = 0;

  var foregroundFluidLayer = {
    fillStyle: 'purple',
    angle: 0,
    horizontalPosition: 0,
    angularSpeed: 0,
    maxAmplitude: 9,
    frequency: 30,
    horizontalSpeed: -150,
    initialHeight: 0
  };

  var backgroundFluidLayer = {
    fillStyle: 'pink',
    angle: 0,
    horizontalPosition: 0,
    angularSpeed: 140,
    maxAmplitude: 12,
    frequency: 40,
    horizontalSpeed: 150,
    initialHeight: 0
  };

  const options = {
    drawShadow: true,
    drawText: false,
    drawPercentageSign: true,
    drawBubbles: false,
    fontSize: '70px',
    fontFamily: 'Arial',
    fontFillStyle: 'white',
    size: 150,
    borderWidth: 1,
    backgroundColor: '#e2e2e2',
    foregroundColor: '#fafafa'
  };

  var bubblesLayer = {
    bubbles: [],
    amount: 12,
    speed: 20,
    current: 0,
    swing: 0,
    size: 2,
    reset: function (bubble) {
      // calculate the area where to spawn the bubble based on the fluid area
      var meterBottom =
        options.size -
        (options.size - getMeterRadius()) / 2 -
        options.borderWidth;
      var fluidAmount =
        (currentFillPercentage * (getMeterRadius() - options.borderWidth * 2)) /
        100;

      bubble.r = random(this.size, this.size * 2) / 2;
      bubble.x = random(0, options.size);
      bubble.y = random(meterBottom, meterBottom - fluidAmount);
      bubble.velX = 0;
      bubble.velY = random(this.speed, this.speed * 2);
      bubble.swing = random(0, 2 * Math.PI);
    },
    init() {
      for (var i = 0; i < this.amount; i++) {
        var meterBottom =
          options.size -
          (options.size - getMeterRadius()) / 2 -
          options.borderWidth;
        var fluidAmount =
          (currentFillPercentage *
            (getMeterRadius() - options.borderWidth * 2)) /
          100;
        this.bubbles.push({
          x: random(0, options.size),
          y: random(meterBottom, meterBottom - fluidAmount),
          r: random(this.size, this.size * 2) / 2,
          velX: 0,
          velY: random(this.speed, this.speed * 2)
        });
      }
    }
  };

  function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
  }

  function getMeterRadius() {
    return options.size * 0.9;
  }

  function random(min, max) {
    var delta = max - min;
    return max === min ? min : Math.random() * delta + min;
  }

  function getFontSize() {
    return options.fontSize + ' ' + options.fontFamily;
  }

  /**
   * initializes and mount the canvas element on the document
   */
  function setupCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width = options.size;
    canvas.height = options.size;
    canvas.imageSmoothingEnabled = true;
    context = canvas.getContext('2d');
    targetContainer.appendChild(canvas);

    // shadow is not required  to be on the draw loop
    //#region shadow
    if (options.drawShadow) {
      context.save();
      context.beginPath();
      context.filter = 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))';
      context.arc(
        options.size / 2,
        options.size / 2,
        getMeterRadius() / 2,
        0,
        2 * Math.PI
      );
      context.closePath();
      context.fill();
      context.restore();
    }
    //#endregion
  }

  /**
   * draw cycle
   */
  function draw() {
    var now = new Date().getTime();
    dt = (now - (time || now)) / 1000;
    time = now;

    requestAnimationFrame(draw);
    context.clearRect(0, 0, options.width, options.height);
    drawMeterBackground();
    drawFluid(dt);
    if (options.drawText) {
      drawText();
    }
    drawMeterForeground();
  }

  function drawMeterBackground() {
    context.save();
    context.fillStyle = options.backgroundColor;
    context.beginPath();
    context.arc(
      options.size / 2,
      options.size / 2,
      getMeterRadius() / 2 - options.borderWidth,
      0,
      2 * Math.PI
    );
    context.closePath();
    context.fill();
    context.restore();
  }

  function drawMeterForeground() {
    context.save();
    context.lineWidth = options.borderWidth;
    context.strokeStyle = options.foregroundColor;
    context.beginPath();
    context.arc(
      options.size / 2,
      options.size / 2,
      getMeterRadius() / 2 - options.borderWidth / 2,
      0,
      2 * Math.PI
    );
    context.closePath();
    context.stroke();
    context.restore();
  }

  /**
   * draws the fluid contents of the meter
   * @param  {} dt elapsed time since last frame
   */
  function drawFluid(dt) {
    context.save();
    context.arc(
      options.size / 2,
      options.size / 2,
      getMeterRadius() / 2 - options.borderWidth,
      0,
      Math.PI * 2
    );
    context.clip();
    drawFluidLayer(backgroundFluidLayer, dt);
    drawFluidLayer(foregroundFluidLayer, dt);

    if (options.drawBubbles) {
      drawFluidMask(foregroundFluidLayer, dt);
      drawBubblesLayer(dt);
    }

    context.restore();
  }

  /**
   * draws the foreground fluid layer
   * @param  {} dt elapsed time since last frame
   */
  function drawFluidLayer(layer, dt) {
    // calculate wave angle
    if (layer.angularSpeed > 0) {
      layer.angle += layer.angularSpeed * dt;
      layer.angle = layer.angle < 0 ? layer.angle + 360 : layer.angle;
    }

    // calculate horizontal position
    layer.horizontalPosition += layer.horizontalSpeed * dt;
    if (layer.horizontalSpeed > 0) {
      layer.horizontalPosition > Math.pow(2, 53) ? 0 : layer.horizontalPosition;
    } else if (layer.horizontalPosition < 0) {
      layer.horizontalPosition < -1 * Math.pow(2, 53)
        ? 0
        : layer.horizontalPosition;
    }

    let x = 0;
    let y = 0;
    let amplitude =
      layer.maxAmplitude * Math.sin((layer.angle * Math.PI) / 180);

    let meterBottom =
      options.size -
      (options.size - getMeterRadius()) / 2 -
      options.borderWidth;
    let fluidAmount =
      (currentFillPercentage * (getMeterRadius() - options.borderWidth * 2)) /
      100;

    if (currentFillPercentage < fillPercentage) {
      currentFillPercentage += 15 * dt;
    } else if (currentFillPercentage > fillPercentage) {
      currentFillPercentage -= 15 * dt;
    }

    layer.initialHeight = meterBottom - fluidAmount;

    context.save();
    context.beginPath();

    context.lineTo(0, layer.initialHeight);

    while (x < options.size) {
      y =
        layer.initialHeight +
        amplitude * Math.sin((x + layer.horizontalPosition) / layer.frequency);
      context.lineTo(x, y);
      x++;
    }

    context.lineTo(x, options.size);
    context.lineTo(0, options.size);
    context.closePath();

    context.fillStyle = layer.fillStyle;
    context.fill();
    context.restore();
  }

  /**
   * clipping mask for objects within the fluid constrains
   * @param {Object} layer layer to be used as a mask
   */
  function drawFluidMask(layer) {
    var x = 0;
    var y = 0;
    var amplitude =
      layer.maxAmplitude * Math.sin((layer.angle * Math.PI) / 180);

    context.beginPath();

    context.lineTo(0, layer.initialHeight);

    while (x < options.size) {
      y =
        layer.initialHeight +
        amplitude * Math.sin((x + layer.horizontalPosition) / layer.frequency);
      context.lineTo(x, y);
      x++;
    }
    context.lineTo(x, options.size);
    context.lineTo(0, options.size);
    context.closePath();
    context.clip();
  }

  function drawBubblesLayer(dt) {
    context.save();
    for (var i = 0; i < bubblesLayer.bubbles.length; i++) {
      var bubble = bubblesLayer.bubbles[i];

      context.beginPath();
      context.strokeStyle = 'white';
      context.arc(bubble.x, bubble.y, bubble.r, 2 * Math.PI, false);
      context.stroke();
      context.closePath();

      var currentSpeed = bubblesLayer.current * dt;

      bubble.velX =
        Math.abs(bubble.velX) < Math.abs(bubblesLayer.current)
          ? bubble.velX + currentSpeed
          : bubblesLayer.current;
      bubble.y = bubble.y - bubble.velY * dt;
      bubble.x =
        bubble.x +
        (bubblesLayer.swing
          ? 0.4 * Math.cos((bubblesLayer.swing += 0.03)) * bubblesLayer.swing
          : 0) +
        bubble.velX * 0.5;

      // determine if current bubble is outside the safe area
      var meterBottom =
        options.size -
        (options.size - getMeterRadius()) / 2 -
        options.borderWidth;
      var fluidAmount =
        (currentFillPercentage * (getMeterRadius() - options.borderWidth * 2)) /
        100;

      if (bubble.y <= meterBottom - fluidAmount) {
        bubblesLayer.reset(bubble);
      }
    }
    context.restore();
  }

  function drawText() {
    var text = options.drawPercentageSign
      ? currentFillPercentage.toFixed(0) + '%'
      : currentFillPercentage.toFixed(0);

    context.save();
    context.font = getFontSize();
    context.fillStyle = options.fontFillStyle;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.filter = 'drop-shadow(0px 0px 5px rgba(0,0,0,0.4))';
    context.fillText(text, options.size / 2, options.size / 2);
    context.restore();
  }

  function init(env) {
    if (!env.targetContainer) throw 'empty or invalid container';

    targetContainer = env.targetContainer;
    fillPercentage = clamp(env.fillPercentage, 0, 100);

    if (env.options) {
      options.drawShadow = env.options.drawShadow === false ? false : true;
      options.size = env.options.size;
      options.drawBubbles = env.options.drawBubbles === false ? false : true;
      options.borderWidth = env.options.borderWidth || options.borderWidth;
      options.foregroundFluidColor =
        env.options.foregroundFluidColor || options.foregroundFluidColor;
      options.backgroundFluidColor =
        env.options.backgroundFluidColor || options.backgroundFluidColor;
      options.backgroundColor =
        env.options.backgroundColor || options.backgroundColor;
      options.foregroundColor =
        env.options.foregroundColor || options.foregroundColor;

      options.drawText = env.options.drawText === false ? false : true;
      options.drawPercentageSign =
        env.options.drawPercentageSign === false ? false : true;
      options.fontSize = env.options.fontSize || options.fontSize;
      options.fontFamily = env.options.fontFamily || options.fontFamily;
      options.fontFillStyle =
        env.options.fontFillStyle || options.fontFillStyle;
      // fluid settings

      if (env.options.foregroundFluidLayer) {
        foregroundFluidLayer.fillStyle =
          env.options.foregroundFluidLayer.fillStyle ||
          foregroundFluidLayer.fillStyle;
        foregroundFluidLayer.angularSpeed =
          env.options.foregroundFluidLayer.angularSpeed ||
          foregroundFluidLayer.angularSpeed;
        foregroundFluidLayer.maxAmplitude =
          env.options.foregroundFluidLayer.maxAmplitude ||
          foregroundFluidLayer.maxAmplitude;
        foregroundFluidLayer.frequency =
          env.options.foregroundFluidLayer.frequency ||
          foregroundFluidLayer.frequency;
        foregroundFluidLayer.horizontalSpeed =
          env.options.foregroundFluidLayer.horizontalSpeed ||
          foregroundFluidLayer.horizontalSpeed;
      }

      if (env.options.backgroundFluidLayer) {
        backgroundFluidLayer.fillStyle =
          env.options.backgroundFluidLayer.fillStyle ||
          backgroundFluidLayer.fillStyle;
        backgroundFluidLayer.angularSpeed =
          env.options.backgroundFluidLayer.angularSpeed ||
          backgroundFluidLayer.angularSpeed;
        backgroundFluidLayer.maxAmplitude =
          env.options.backgroundFluidLayer.maxAmplitude ||
          backgroundFluidLayer.maxAmplitude;
        backgroundFluidLayer.frequency =
          env.options.backgroundFluidLayer.frequency ||
          backgroundFluidLayer.frequency;
        backgroundFluidLayer.horizontalSpeed =
          env.options.backgroundFluidLayer.horizontalSpeed ||
          backgroundFluidLayer.horizontalSpeed;
      }
    }

    bubblesLayer.init();
    setupCanvas();
    draw();
  }

  function setPercentage(percentage) {
    fillPercentage = clamp(percentage, 0, 100);
  }

  useEffect(() => {
    setAnimation(true);
    setTimeout(() => {
      setAnimation(false);
    }, 200);
  }, [wasAttacked]);

  useEffect(() => {
    init({
      targetContainer: document.getElementById('fluid-meter'),
      fillPercentage: 100,
      options
    });
  }, []);

  return (
    <Component data-file="player-health/PlayerHealth" player={player}>
      {/* <HealthValue animation={animation} health={health}>
        {health}
      </HealthValue> */}
      <PlayerShield player={player} shieldPoints={shieldPoints} />
      <div id="fluid-meter" className="mx-auto" />
      <Badge src={`assets/card-assets/Class_Skill_Sphere.png`} />
    </Component>
  );
}

PlayerHealth.propTypes = {
  health: PropTypes.number,
  player: PropTypes.string,
  shieldPoints: PropTypes.number,
  wasAttacked: PropTypes.bool
};

const Badge = styled.img`
  height: calc(var(--class-skill-button-size) + 30px);
  right: -15px;
  top: -12px;
  position: absolute;
  z-index: 0;
`;

const Component = styled.div`
  align-items: center;
  border-radius: 50%;
  display: flex;
  flex-flow: column nowrap;
  font-size: 22px;
  font-weight: bold;
  height: var(--class-skill-button-size);
  justify-content: center;
  /* pointer-events: none; */
  position: absolute;
  width: var(--class-skill-button-size);
  z-index: 1;
  left: 4%;
  top: -350%;

  * {
    user-select: none;
  }

  &:after {
    border-radius: 50%;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.625);
    content: '';
    height: 100%;
    width: 100%;
    position: absolute;
  }

  #fluid-meter {
    position: relative;
    z-index: 2;
    left: 1px;
    top: 1px;
  }
`;

const HealthValue = styled.div`
  position: absolute;
  z-index: 1;
  color: ${p =>
    p.animation ? '#ff3535' : p.health < 30 ? '#ff3535' : 'white'};
  font-size: 1em;
  line-height: 1;
  font-family: 'Carter One', sans-serif;
  pointer-events: none;
  width: 45px;
  height: 45px;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  text-shadow: 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black, 0 0 1px black,
    0 0 1px black;
  transform: ${p => (p.animation ? 'scale(1.5)' : 'scale(1)')};
  transition: transform 100ms ease-in-out;
`;
