import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { PersonalCore } from "personal-space-core";
import { db } from "./db";
import { createDatabase } from "personal-space-core";

interface CoreContextType {
  core: PersonalCore | null;
  isLoading: boolean;
  error: Error | null;
}

const CoreContext = createContext<CoreContextType>({
  core: null,
  isLoading: true,
  error: null,
});

export function useCore() {
  return useContext(CoreContext);
}

export function CoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CoreContextType>({
    core: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    (async () => {
      try {
        await createDatabase(db);
        const core = await PersonalCore.initialize(db);
        setState({ core, isLoading: false, error: null });
      } catch (error) {
        setState({
          core: null,
          isLoading: false,
          error: error instanceof Error ? error : new Error("Unknown error"),
        });
      }
    })();
  }, []);

  return (
    <CoreContext.Provider value={state}>
      {children}
    </CoreContext.Provider>
  );
}