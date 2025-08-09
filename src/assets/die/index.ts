import type { PieceTemplate } from '../../types'
import src from './die.gltf'

export const die = {
  name: "Classic die",
  src,
  scale: [0.016, 0.016, 0.016], // 16mm^3
  faces: [
    { name: "1", rotation: [90, 0, 0] },
    { name: "2", rotation: [0, 0, 0] },
    { name: "3", rotation: [0, 0, 90] },
    { name: "4", rotation: [0, 0, -90] },
    { name: "5", rotation: [180, 0, 0] },
    { name: "6", rotation: [-90, 0, 0] },
  ],
} as PieceTemplate;
