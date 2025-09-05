import type { PieceTemplate } from "../../types";

const src = "./pawn/pawn.gltf";

export const pawn = {
  // Asset originally created by Misha Tsyatksko for Garbo Succus
  name: "pawn",
  src,
  scale: [0.0332, 0.0332, 0.0332], //Scaled To Be 33.2mm Tall To Mimic Life Scale
} as PieceTemplate;
