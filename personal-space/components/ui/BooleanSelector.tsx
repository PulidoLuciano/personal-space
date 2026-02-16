import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";

interface BooleanSelectorProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  helperText?: string;
  trueLabel?: string;
  falseLabel?: string;
}

export const BooleanSelector: React.FC<BooleanSelectorProps> = ({
  value,
  onChange,
  label,
  helperText,
  trueLabel,
  falseLabel,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  const yesLabel = trueLabel || t("common.yes", { defaultValue: "Sí" });
  const noLabel = falseLabel || t("common.no", { defaultValue: "No" });

  const isPrimaryLight = colors.primary === "#FFFFFF" || colors.primary === "#FFF" || colors.primary.toLowerCase() === "#ffffff";
  const selectedTextColor = isPrimaryLight ? "#000000" : "#FFFFFF";

  return (
    <View style={styles.container}>
      {label && (
        <MyText variant="small" color="textMuted" style={styles.label}>
          {label}
        </MyText>
      )}
      {helperText && (
        <MyText variant="small" color="textMuted" style={styles.helperText}>
          {helperText}
        </MyText>
      )}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => onChange(true)}
          style={[
            styles.option,
            {
              backgroundColor: value ? colors.primary : colors.surface,
              borderColor: value ? colors.primary : colors.hover,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={value ? selectedTextColor : colors.textMuted}
          />
          <MyText
            variant="body"
            weight="semi"
            style={{ color: value ? selectedTextColor : colors.textMuted, marginLeft: 6 }}
          >
            {yesLabel}
          </MyText>
        </Pressable>
        <Pressable
          onPress={() => onChange(false)}
          style={[
            styles.option,
            {
              backgroundColor: !value ? colors.danger + "20" : colors.surface,
              borderColor: !value ? colors.danger : colors.hover,
            },
          ]}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={!value ? colors.danger : colors.textMuted}
          />
          <MyText
            variant="body"
            weight="semi"
            style={{ color: !value ? colors.danger : colors.textMuted, marginLeft: 6 }}
          >
            {noLabel}
          </MyText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    marginLeft: 4,
  },
  helperText: {
    marginBottom: 8,
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
