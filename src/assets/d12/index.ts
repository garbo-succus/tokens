import type { PieceTemplate } from "../../types";

const src = "./d12/d12.gltf";

export const d12 = {
  // Asset originally created by Misha Tsyatksko for Garbo Succus
  name: "D12 Dice",
  src,
  scale: [0.016, 0.016, 0.016], //Scaled to fit inside a 16mm^3 cube
  rotation: [90, 0, 30], //Default Rotation
  faces: [
      { name: "1", rotation: [90, 0, 30] },
      { name: "2", rotation: [-3, -90, 0] },
      { name: "3", rotation: [0, 60, 0] },
      { name: "4", rotation: [30, 0, 0] },
      { name: "5", rotation: [0, -60, 0] },
      { name: "6", rotation: [-30, 0, 0] },
      { name: "7", rotation: [-90, 30, 0] },
      { name: "8", rotation: [-90, -30, 0] },
      { name: "9", rotation: [0, 120, 0] },
      { name: "10", rotation: [-150, 0, 0] },
      { name: "11", rotation: [0, -120, 0] },
      { name: "12", rotation: [150, 0, 0] },
    ], 

} as PieceTemplate;
