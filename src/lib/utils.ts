import { Ball } from "../main";

export const getRandomColor = (alpha?: number) => {
  const r = Math.random() * 255;
  const g = Math.random() * 255;
  const b = Math.random() * 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha ?? 1})`;
};

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
};

export const randomIntFromRange = (start: number, end: number) => {
  return Math.floor(start + Math.random() * (end - start));
};

export const rotate = (velocity: { x: number; y: number }, angle: number) => {
  return {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };
};

export const collision = (particle1: Ball, particle2: Ball, cR = 1) => {
  const xVelocityDiff = particle1.velocity.x - particle2.velocity.x;
  const yVelocityDiff = particle1.velocity.y - particle2.velocity.y;

  const xDist = particle2.x - particle1.x;
  const yDist = particle2.y - particle1.y;

  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    const angle = -Math.atan2(
      particle2.y - particle1.y,
      particle2.x - particle1.x
    );

    const m1 = particle1.mass;
    const m2 = particle2.mass;

    const u1 = rotate(particle1.velocity, angle);
    const u2 = rotate(particle2.velocity, angle);

    const v1 = {
      x: (cR * (m2 * (u2.x - u1.x)) + m1 * u1.x + m2 * u2.x) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (cR * (m1 * (u1.x - u2.x)) + m1 * u1.x + m2 * u2.x) / (m1 + m2),
      y: u2.y,
    };

    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    particle1.velocity.x = vFinal1.x;
    particle1.velocity.y = vFinal1.y;

    particle2.velocity.x = vFinal2.x;
    particle2.velocity.y = vFinal2.y;
  }
};
