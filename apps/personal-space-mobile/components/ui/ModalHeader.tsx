import { StyleSheet, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/spacing";

export interface ModalHeaderProps {
  title: string;
  leftLabel?: string;
  onLeftPress?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
}

export function ModalHeader({
  title,
  leftLabel = "Cancel",
  onLeftPress,
  rightLabel,
  onRightPress,
}: ModalHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLeftPress} disabled={!onLeftPress}>
        <ThemedText type="link">{leftLabel}</ThemedText>
      </TouchableOpacity>
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      <TouchableOpacity onPress={onRightPress} disabled={!onRightPress}>
        <ThemedText type="link">{rightLabel}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
});