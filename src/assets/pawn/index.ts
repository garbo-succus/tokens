import type { PieceTemplate } from "../../types";

const src = "./pawn/pawn.gltf";

export const pawn = {
  // Asset originally created by Misha Tsyatksko for Garbo Succus
  name: "pawn",
  src,
  scale: [0.025, 0.025, 0.025], //Scaled To Be 25mm Tall To Mimic Life Scale
} as PieceTemplate;
