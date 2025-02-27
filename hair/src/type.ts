import type { FilesetResolver } from "@mediapipe/tasks-vision";

export const CATEGORY_HAIR = 1;

export type WasmFileset = Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>
export type RunningMode = "IMAGE" | "VIDEO";
export type RenderMode = "category" | "confidence";
