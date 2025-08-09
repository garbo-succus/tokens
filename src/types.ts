import type { Vector3Tuple } from "three";

export interface PieceState {
  name?: string;
  src?: string;
  template?: keyof GameState["templates"];
  position?: Vector3Tuple;
  scale?: Vector3Tuple;
  rotation?: Vector3Tuple;
  color?: string;
  locked?: boolean;
  faces?: {
    name: string;
    rotation: Vector3Tuple;
  }[];
  children?: PieceState[];
}

export type PieceTemplate = Omit<PieceState, "children">;

export interface GameState {
  modId: null | number;
  probability: "2024-01-01";
  templates: Record<string, PieceTemplate>;
  children: PieceState[];
}
