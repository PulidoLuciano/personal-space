import { Alert } from "react-native";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
}

export function showErrorAlert(error: unknown, fallback = "An unexpected error occurred"): void {
  const message = getErrorMessage(error) || fallback;
  Alert.alert("Error", message);
}
