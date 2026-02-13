import React, { createContext, useContext, useMemo } from "react";
import { SQLiteDatabase } from "expo-sqlite";
import { DependenciesManager } from "@/core/DependenciesManager";

const DependenciesContext = createContext<DependenciesManager | null>(null);

interface Props {
  db: SQLiteDatabase;
  children: React.ReactNode;
}

export const DependenciesProvider: React.FC<Props> = ({ db, children }) => {
  const manager = useMemo(() => new DependenciesManager(db), [db]);

  return (
    <DependenciesContext.Provider value={manager}>
      {children}
    </DependenciesContext.Provider>
  );
};

export const useDependencies = () => {
  const context = useContext(DependenciesContext);
  if (!context) {
    throw new Error(
      "useDependencies debe usarse dentro de un DependenciesProvider",
    );
  }
  return context;
};
