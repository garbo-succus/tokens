import type { PieceTemplate } from "../../types";

const src = "./d4/d4.gltf";

export const d4 = {
  // Asset originally created by Misha Tsyatksko for Garbo Succus
  name: "Classic d4",
  src: "pieces/d4/d4.gltf",
  scale: [0.016, 0.016, 0.016],
  faces: [
    { name: "1", rotation: [0, 0, 0] },
    { name: "2", rotation: [120, 120, 0] },
    { name: "3", rotation: [120, 120, 120] },
    { name: "4", rotation: [120, 0, 0] },
  ],
} as PieceTemplate;