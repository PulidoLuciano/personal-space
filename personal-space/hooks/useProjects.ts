import { useState, useEffect, useCallback } from "react";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { ProjectEntity } from "@/core/entities/ProjectEntity";

export const useProjects = () => {
  const controller = useDependencies();

  const [projects, setProjects] = useState<ProjectEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga la lista completa de proyectos desde la base de datos
   */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await controller.getAllProjects.execute();
      setProjects(data);
    } catch (err) {
      setError("No se pudieron cargar los proyectos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [controller.getAllProjects]);

  /**
   * Crea un nuevo proyecto y actualiza la lista local
   */
  const createProject = async (data: {
    name: string;
    color?: string;
    icon?: string;
  }) => {
    try {
      await controller.createProject.execute(data);
      await fetchProjects(); // Recargar lista
    } catch (err: any) {
      throw new Error(err.message || "Error al crear el proyecto");
    }
  };

  /**
   * Actualiza un proyecto existente
   */
  const updateProject = async (
    id: number,
    data: { name?: string; color?: string; icon?: string },
  ) => {
    try {
      await controller.updateProject.execute(id, data);
      await fetchProjects(); // Recargar lista
    } catch (err: any) {
      throw new Error(err.message || "Error al actualizar el proyecto");
    }
  };

  /**
   * Elimina un proyecto
   */
  const deleteProject = async (id: number) => {
    try {
      await controller.deleteProject.execute(id);
      await fetchProjects(); // Recargar lista
    } catch (err: any) {
      throw new Error(err.message || "Error al eliminar el proyecto");
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refresh: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};
