import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";

export type ElementType = "event" | "task" | "finance" | "note";

interface TypeSelectorProps {
  selectedType: ElementType;
  onSelect: (type: ElementType) => void;
  accentColor?: string;
}

const TYPES: { key: ElementType; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "event", icon: "calendar" },
  { key: "task", icon: "checkbox" },
  { key: "finance", icon: "wallet" },
  { key: "note", icon: "document-text" },
];

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  selectedType,
  onSelect,
  accentColor,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const activeColor = accentColor || colors.primary;

  return (
    <View style={styles.container}>
      {TYPES.map((type) => {
        const isSelected = selectedType === type.key;
        return (
          <Pressable
            key={type.key}
            onPress={() => onSelect(type.key)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? activeColor + "20"
                  : colors.surface,
                borderColor: isSelected ? activeColor : colors.hover,
              },
            ]}
          >
            <Ionicons
              name={type.icon}
              size={24}
              color={isSelected ? activeColor : colors.textMuted}
            />
            <MyText
              variant="small"
              weight="semi"
              style={[
                { marginTop: 4 },
                { color: isSelected ? activeColor : colors.textMuted },
              ]}
            >
              {t(`create.${type.key}`)}
            </MyText>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
});
