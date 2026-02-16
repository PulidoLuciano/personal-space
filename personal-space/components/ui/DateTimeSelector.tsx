import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform, Modal, SafeAreaView } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";

export type DateTimeMode = "date" | "datetime" | "time";

interface DateTimeSelectorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  mode?: DateTimeMode;
  label?: string;
  placeholder?: string;
}

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  value,
  onChange,
  mode = "date",
  label,
  placeholder,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [showPicker, setShowPicker] = useState(false);

  const parsedDate = value ? new Date(value) : null;

  const formatDisplayValue = () => {
    if (!parsedDate) return placeholder || t("common.select_date", { defaultValue: "Seleccionar fecha" });
    
    if (mode === "date") {
      return parsedDate.toLocaleDateString();
    } else if (mode === "time") {
      return parsedDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
      return parsedDate.toLocaleString();
    }
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    
    if (event.type === "set" && selectedDate) {
      if (mode === "date") {
        selectedDate.setHours(23, 59, 59, 999);
      }
      onChange(selectedDate.toISOString());
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setShowPicker(false);
  };

  const getPickerMode = (): "date" | "time" | "datetime" => {
    if (mode === "date") return "date";
    if (mode === "time") return "time";
    return "datetime";
  };

  return (
    <View style={styles.container}>
      {label && (
        <MyText variant="small" color="textMuted" style={styles.label}>
          {label}
        </MyText>
      )}
      
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          styles.selector,
          { backgroundColor: colors.surface, borderColor: colors.hover },
        ]}
      >
        <MyText variant="body" style={{ color: parsedDate ? colors.text : colors.textMuted }}>
          {formatDisplayValue()}
        </MyText>
        <Ionicons name="calendar" size={20} color={colors.textMuted} />
      </Pressable>

      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.pickerHeader}>
              <Pressable onPress={handleClear} style={styles.headerButton}>
                <MyText variant="body" style={{ color: colors.textMuted }}>
                  {t("common.clear", { defaultValue: "Limpiar" })}
                </MyText>
              </Pressable>
              <Pressable onPress={handleConfirm} style={styles.headerButton}>
                <MyText variant="body" weight="semi" style={{ color: colors.primary }}>
                  {t("common.accept", { defaultValue: "Aceptar" })}
                </MyText>
              </Pressable>
            </View>
            
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={parsedDate || new Date()}
                mode={getPickerMode()}
                display="spinner"
                onChange={handleChange}
                textColor={colors.text}
              />
            </View>
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
  selector: {
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
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pickerWrapper: {
    alignItems: "center",
    paddingVertical: 20,
  },
});
