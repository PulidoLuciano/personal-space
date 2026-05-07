import { ReactNode } from "react";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useCore } from "@/lib/core-context";

interface CoreGateProps {
  children: ReactNode;
  pageLoading?: boolean;
  notFound?: boolean;
  notFoundMessage?: string;
}

export function CoreGate({
  children,
  pageLoading = false,
  notFound = false,
  notFoundMessage = "Not found",
}: CoreGateProps) {
  const { isLoading: isCoreLoading, error: coreError, core } = useCore();

  if (isCoreLoading || pageLoading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (coreError || !core) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <ThemedText type="defaultSemiBold">Failed to initialize</ThemedText>
        <ThemedText style={{ textAlign: "center", marginTop: 8 }}>
          {coreError?.message || "Unknown error"}
        </ThemedText>
      </ThemedView>
    );
  }

  if (notFound) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>{notFoundMessage}</ThemedText>
      </ThemedView>
    );
  }

  return <>{children}</>;
}
