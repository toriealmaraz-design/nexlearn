export const CURRICULUM_PHASES = [
  {
    id: "foundations",
    label: "Foundations",
    description: "Set up the tools and a clear starting point.",
  },
  {
    id: "build-debug",
    label: "Build & Debug",
    description: "Turn ideas into working features and fix what breaks.",
  },
  {
    id: "scale-deploy",
    label: "Scale & Deploy",
    description: "Ship to production and secure the important edges.",
  },
  {
    id: "optimize",
    label: "Optimize",
    description: "Improve quality, performance, and operating costs.",
  },
  {
    id: "grow-product",
    label: "Grow Your Product",
    description: "Help the right people discover what you built.",
  },
] as const;

export type CurriculumPhase = (typeof CURRICULUM_PHASES)[number]["id"];

export function getCurriculumPhase(phase: string) {
  return CURRICULUM_PHASES.find((item) => item.id === phase) ?? CURRICULUM_PHASES[0];
}
