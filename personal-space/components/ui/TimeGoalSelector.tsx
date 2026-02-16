import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";
import { MyInput } from "./MyInput";

export type TimeUnit = "minutes" | "hours" | "days" | "weeks" | "months" | "years";

const TIME_UNITS: { key: TimeUnit; label: string; multiplier: number }[] = [
  { key: "minutes", label: "Minutos", multiplier: 1 },
  { key: "hours", label: "Horas", multiplier: 60 },
  { key: "days", label: "Días", multiplier: 1440 },
  { key: "weeks", label: "Semanas", multiplier: 10080 },
  { key: "months", label: "Meses", multiplier: 43200 },
  { key: "years", label: "Años", multiplier: 525600 },
];

const getValueFromMinutes = (totalMinutes: number): { value: string; unit: TimeUnit } => {
  if (totalMinutes >= 525600 && totalMinutes % 525600 === 0) {
    return { value: (totalMinutes / 525600).toString(), unit: "years" };
  }
  if (totalMinutes >= 43200 && totalMinutes % 43200 === 0) {
    return { value: (totalMinutes / 43200).toString(), unit: "months" };
  }
  if (totalMinutes >= 10080 && totalMinutes % 10080 === 0) {
    return { value: (totalMinutes / 10080).toString(), unit: "weeks" };
  }
  if (totalMinutes >= 1440 && totalMinutes % 1440 === 0) {
    return { value: (totalMinutes / 1440).toString(), unit: "days" };
  }
  if (totalMinutes >= 60 && totalMinutes % 60 === 0) {
    return { value: (totalMinutes / 60).toString(), unit: "hours" };
  }
  return { value: totalMinutes.toString(), unit: "minutes" };
};

interface TimeGoalSelectorProps {
  value: number | undefined;
  onChange: (minutes: number | undefined) => void;
  label?: string;
  helperText?: string;
}

export const TimeGoalSelector: React.FC<TimeGoalSelectorProps> = ({
  value,
  onChange,
  label,
  helperText,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  
  const initial = value ? getValueFromMinutes(value) : { value: "", unit: "minutes" as TimeUnit };
  
  const [selectedUnit, setSelectedUnit] = useState<TimeUnit>(initial.unit);
  const [inputValue, setInputValue] = useState(initial.value);
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedUnitLabel = TIME_UNITS.find(u => u.key === selectedUnit)?.label || "Minutos";

  const handleUnitChange = (unit: TimeUnit) => {
    setSelectedUnit(unit);
    setShowDropdown(false);
    if (inputValue) {
      const numValue = parseInt(inputValue, 10);
      if (!isNaN(numValue) && numValue > 0) {
        const unitConfig = TIME_UNITS.find((u) => u.key === unit);
        if (unitConfig) {
          onChange(numValue * unitConfig.multiplier);
        }
      }
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    const numValue = parseInt(text, 10);
    if (!text || isNaN(numValue) || numValue <= 0) {
      onChange(undefined);
      return;
    }
    const unitConfig = TIME_UNITS.find((u) => u.key === selectedUnit);
    if (unitConfig) {
      onChange(numValue * unitConfig.multiplier);
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <MyText variant="small" color="textMuted" style={styles.label}>
          {label}
        </MyText>
      )}

      <View style={styles.inputRow}>
        <View style={styles.inputWrapper}>
          <MyInput
            placeholder={t("task.time_value_placeholder", { defaultValue: "Cantidad" })}
            value={inputValue}
            onChangeText={handleInputChange}
            keyboardType="number-pad"
          />
        </View>
        
        <Pressable
          onPress={() => setShowDropdown(true)}
          style={[
            styles.unitDropdown,
            { backgroundColor: colors.surface, borderColor: colors.hover }
          ]}
        >
          <MyText variant="body" style={{ color: colors.text }}>
            {t(`common.${selectedUnit}`, { defaultValue: selectedUnitLabel })}
          </MyText>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      {helperText && (
        <MyText variant="small" color="textMuted" style={styles.helperText}>
          {helperText}
        </MyText>
      )}

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDropdown(false)}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <MyText variant="body" weight="semi">{t("task.select_unit", { defaultValue: "Seleccionar unidad" })}</MyText>
              <Pressable onPress={() => setShowDropdown(false)}>
                <MyText variant="body" style={{ color: colors.primary }}>✕</MyText>
              </Pressable>
            </View>
            {TIME_UNITS.map((unit) => {
              const isSelected = selectedUnit === unit.key;
              return (
                <Pressable
                  key={unit.key}
                  onPress={() => handleUnitChange(unit.key)}
                  style={[
                    styles.unitOption,
                    {
                      backgroundColor: isSelected ? colors.primary + "15" : "transparent",
                    },
                  ]}
                >
                  <MyText
                    variant="body"
                    weight={isSelected ? "semi" : "normal"}
                    style={{ color: isSelected ? colors.primary : colors.text }}
                  >
                    {t(`common.${unit.key}`, { defaultValue: unit.label })}
                  </MyText>
                  {isSelected && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </SafeAreaView>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  helperText: {
    marginTop: 6,
    marginLeft: 4,
  },
  inputWrapper: {
    flex: 2,
  },
  unitDropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  unitOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
});
