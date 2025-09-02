import type { PieceTemplate } from "../../types";

const src = "./d4/d4.gltf";

export const d4 = {
  // Asset originally created by Misha Tsyatksko for Garbo Succus
  name: "D4 Dice",
  src,
  scale: [0.016, 0.016, 0.016],    //Scaled to fit inside a 16mm^3 cube
  faces: [
    { name: "1", rotation: [0, 0, 0] },
    { name: "2", rotation: [120, 120, 0] },
    { name: "3", rotation: [120, 120, 120] },
    { name: "4", rotation: [120, 0, 0] },
  ],
} as PieceTemplate;
