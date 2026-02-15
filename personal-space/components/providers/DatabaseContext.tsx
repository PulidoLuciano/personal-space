import React, { createContext, useContext, useMemo, useCallback } from "react";
import { SQLiteDatabase } from "expo-sqlite";
import { DependenciesManager } from "@/core/DependenciesManager";
import { deleteDatabase } from "@/database/initializeDatabase";

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

interface ResetDatabaseContextType {
  resetDatabase: () => Promise<void>;
}

const ResetDatabaseContext = createContext<ResetDatabaseContextType | null>(null);

export const ResetDatabaseProvider: React.FC<{ children: React.ReactNode; onReset: () => void }> = ({ children, onReset }) => {
  const resetDatabase = useCallback(async () => {
    try {
      await deleteDatabase();
      onReset();
    } catch (error) {
      console.error("Error resetting database:", error);
    }
  }, [onReset]);

  return (
    <ResetDatabaseContext.Provider value={{ resetDatabase }}>
      {children}
    </ResetDatabaseContext.Provider>
  );
};

export const useResetDatabase = () => {
  const context = useContext(ResetDatabaseContext);
  if (!context) {
    throw new Error("useResetDatabase must be used within ResetDatabaseProvider");
  }
  return context;
};
