import { View, StyleSheet } from "react-native";
import { MyText } from "@/components/ui/MyText";
import { useTheme } from "@/hooks/useTheme";

export default function CalendarScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MyText variant="h2">Calendar</MyText>
      <MyText color="textMuted">Events for this project will appear here</MyText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
