import type { TaskWithProgress } from "personal-space-core";

export interface TaskWithSection extends TaskWithProgress {
  section_id: string;
}

export interface SectionWithTasks {
  section: import("personal-space-core").Section;
  tasks: TaskWithSection[];
}