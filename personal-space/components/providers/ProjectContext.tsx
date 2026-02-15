import {
  createContext,
  useContext,
  useMemo,
} from "react";
import { useLocalSearchParams } from "expo-router";
import { useProjects } from "@/hooks/useProjects";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

interface ProjectContextProps {
  projectId: string | undefined;
  currentProject: ProjectEntity | null;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(
  undefined,
);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { projects } = useProjects();

  const currentProject = useMemo(() => {
    if (!projectId) return null;
    return projects.find((p) => p.id?.toString() === projectId) || null;
  }, [projects, projectId]);

  return (
    <ProjectContext.Provider value={{ projectId, currentProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useCurrentProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useCurrentProject must be used within a ProjectProvider");
  }
  return context;
};
