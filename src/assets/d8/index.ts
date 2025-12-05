import type { PieceTemplate } from "../../types";

const src = "./d8/d8.gltf";

export const d8 = {
  // Asset originally created by Misha Tsyatksko for Garbo Succus
  name: "D8 Dice",
  src,
  scale: [0.016, 0.016, 0.016], //Scaled to fit inside a 16mm^3 cube
  rotation: [-55, 0, 0],
  faces: [
    { name: "1", rotation: [-55, 0, 0] },
    { name: "2", rotation: [125, 0, 0] },
    { name: "3", rotation: [-125, 0, -90] },
    { name: "4", rotation: [55, 0, -90] },
    { name: "5", rotation: [55, 0, 0] },
    { name: "6", rotation: [-125, 0, 0] },
    { name: "7", rotation: [-125, 0, 90] },
    { name: "8", rotation: [55, 0, 90] },
  ],
} as PieceTemplate;
