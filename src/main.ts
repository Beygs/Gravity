import {
  collision,
  distance,
  getRandomColor,
  randomIntFromRange,
} from "./lib/utils";
import "./style.css";
import * as lilGui from "lil-gui";

/**
 * Base
 */

const canvas = document.querySelector("canvas");

if (!canvas) throw new Error("Oups! There was an issue!");

const c = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gui = new lilGui.GUI();

/**
 * Variables
 */

const mouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  prevX: window.innerWidth / 2,
  prevY: window.innerHeight / 2,
};

const params = {
  reset: () => {
    gui.reset();
  },
  gravity: 1,
  bounce: 0.59,
  maxRadius: 30,
  maxMass: 1,
  mouseRadius: 10,
  mouseMass: 10,
  mouseColor: "#000000",
  showCursor: false,
  cR: 1,
}

/**
 * Event Listeners
 */

document.addEventListener("mousemove", (e) => {
  mouse.prevX = mouse.x;
  mouse.prevY = mouse.y;
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  init();
});

/**
 * Objects
 */

export class Ball {
  x: number;
  y: number;
  radius: number;
  color: string | CanvasGradient | CanvasPattern;
  velocity: {
    x: number;
    y: number;
  };
  mass: number;
  alpha: number;

  constructor(
    x: number,
    y: number,
    dx: number,
    dy: number,
    radius: number,
    color: string | CanvasGradient | CanvasPattern,
    mass?: number
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = {
      x: dx,
      y: dy,
    };
    this.mass = mass ?? 1;
    this.radius = radius;
    this.alpha = 0;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
  }

  update() {
    if (
      canvas &&
      (this.x <= 0 + this.radius - this.velocity.x ||
        this.x >= canvas.width - this.radius - this.velocity.x)
    ) {
      this.velocity.x = -this.velocity.x * params.bounce;
    } else {
      this.velocity.x;
    }

    if (
      canvas &&
      (this.y <= 0 + this.radius - this.velocity.y ||
        this.y >= canvas.height - this.radius - this.velocity.y)
    ) {
      this.velocity.x *= 0.99;
      this.velocity.y = -this.velocity.y * params.bounce;
    } else {
      this.velocity.y += params.gravity * this.mass;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.draw();
  }
}

class CursorBall extends Ball {
  update(balls?: Ball[]) {
    this.velocity.x = this.x - mouse.prevX;
    this.velocity.y = this.y - mouse.prevY;
    this.x = mouse.x;
    this.y = mouse.y;

    balls?.forEach((ball) => {
      if (
        distance(this.x, this.y, ball.x, ball.y) <
        this.radius + ball.radius
      ) {
        collision(this, ball, params.cR);
      }
    });

    if (params.showCursor) this.draw();
  }
}

/**
 * Implementation
 */

let cursorBall: CursorBall;
let balls: Ball[];

const init = () => {
  cursorBall = new CursorBall(mouse.x, mouse.y, 0, 0, params.mouseRadius, params.mouseColor, params.mouseMass);
  balls = new Array(100).fill(null).map(() => {
    const mass = Math.random() * params.maxMass;
    const radius = params.maxRadius * mass / params.maxMass;
    let x = randomIntFromRange(radius, canvas.width - radius);
    let y = randomIntFromRange(radius, canvas.height - radius);
    const dx = (Math.random() - 0.5) * 5;
    const dy = (Math.random() - 0.5) * 5;
    const color = getRandomColor();

    return new Ball(x, y, dx, dy, radius, color, mass);
  });
};

/**
 * GUI
 */

gui.add(params, "reset");
gui.add(params, "gravity").min(0).max(5).step(0.01);
gui.add(params, "bounce").min(0).max(2).step(0.001);
gui.add(params, "maxRadius").min(5).max(50).step(1).onFinishChange(init);
gui.add(params, "maxMass").min(0.1).max(10).step(0.1).onFinishChange(init);
gui.add(params, "mouseRadius").min(1).max(100).step(1).onFinishChange((v: number) => cursorBall.radius = v);
gui.add(params, "mouseMass").min(0.1).max(100).step(0.1).onFinishChange((v: number) => cursorBall.mass = v);
gui.addColor(params, "mouseColor").onChange((v: string) => {
  cursorBall.color = v;
  params.showCursor = true;
});
gui.add(params, "showCursor");
gui.add(params, "cR").min(0).max(1).step(0.001);

const animate = () => {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  cursorBall.update(balls);

  balls.forEach((ball) => ball.update());
};

init();
animate();
