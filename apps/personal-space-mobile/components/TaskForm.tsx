import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  useColorScheme,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius, FontSize } from "@/constants/spacing";
import { ThemedText } from "./themed-text";
import { RecurrenceBuilder } from "./RecurrenceBuilder";

type TaskType = "by time" | "by executions" | "note";

interface TaskFormData {
  name: string;
  location: string;
  dueRule: string;
  type: TaskType;
  objective: string;
  objectiveUnit: "hours" | "minutes" | "seconds";
  recurrency: string;
  isRecurrent: boolean;
  startTime: string;
}

interface TaskFormProps {
  onSubmit: (data: {
    name: string;
    location: string | null;
    due_rule: string | null;
    type: TaskType;
    objective: number;
    recurrency: string | null;
    start_time: string | null;
    section_id: string;
  }) => void;
  sectionId: string;
  onCancel: () => void;
  initialData?: {
    name: string;
    location: string | null;
    due_rule: string | null;
    type: TaskType;
    objective: number;
    recurrency: string | null;
    start_time?: string | null;
  };
}

export function TaskForm({ onSubmit, sectionId, onCancel, initialData }: TaskFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const getTodayDefault = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dateStr = now.toISOString().split("T")[0];
    const hours = "00";
    const minutes = "00";
    const seconds = "00";
    return `${dateStr} ${hours}:${minutes}:${seconds}`;
  };

  const [formData, setFormData] = useState<TaskFormData>(() => {
    if (initialData) {
      let objectiveUnit: TaskFormData["objectiveUnit"] = "minutes";
      let objectiveValue = String(initialData.objective);
      if (initialData.type === "by time" && initialData.objective > 0) {
        const seconds = initialData.objective;
        if (seconds >= 3600 && seconds % 3600 === 0) {
          objectiveUnit = "hours";
          objectiveValue = String(seconds / 3600);
        } else if (seconds >= 60 && seconds % 60 === 0) {
          objectiveUnit = "minutes";
          objectiveValue = String(seconds / 60);
        } else {
          objectiveUnit = "seconds";
          objectiveValue = String(seconds);
        }
      }
      const isRecurrent = !!initialData.recurrency;
      return {
        name: initialData.name,
        location: initialData.location ?? "",
        dueRule: initialData.due_rule ?? "",
        type: initialData.type,
        objective: objectiveValue,
        objectiveUnit,
        recurrency: initialData.recurrency ?? "",
        isRecurrent,
        startTime: initialData.start_time ?? (isRecurrent ? getTodayDefault() : ""),
      };
    }
    return {
      name: "",
      location: "",
      dueRule: "",
      type: "by executions",
      objective: "1",
      objectiveUnit: "minutes",
      recurrency: "",
      isRecurrent: false,
      startTime: "",
    };
  });

  const [showRecurrenceBuilder, setShowRecurrenceBuilder] = useState(false);
  const [showDueRuleBuilder, setShowDueRuleBuilder] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const updateField = useCallback(
    <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const formatFixedDueDate = useCallback((date: Date, time: Date | null): string => {
    const dateStr = date.toISOString().split("T")[0];
    let timeStr = "23:59:59";
    if (time) {
      const hours = time.getHours().toString().padStart(2, "0");
      const minutes = time.getMinutes().toString().padStart(2, "0");
      timeStr = `${hours}:${minutes}:00`;
    }
    return `${dateStr} ${timeStr}`;
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) return;

    let dueRule: string | null = null;
    if (formData.dueRule) {
      dueRule = formData.dueRule;
    }

    let objectiveValue = parseInt(formData.objective, 10) || 1;
    if (formData.type === "by time") {
      const unitMultiplier: Record<string, number> = {
        hours: 3600,
        minutes: 60,
        seconds: 1,
      };
      objectiveValue = objectiveValue * (unitMultiplier[formData.objectiveUnit] || 60);
    }

    onSubmit({
      name: formData.name.trim(),
      location: formData.location.trim() || null,
      due_rule: dueRule,
      type: formData.type,
      objective: objectiveValue,
      recurrency: formData.isRecurrent ? formData.recurrency || null : null,
      start_time: formData.isRecurrent ? formData.startTime || null : null,
      section_id: sectionId,
    });
  }, [formData, onSubmit, sectionId]);

  const formatDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString();
  };

  const formatTime = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const clearDueRule = useCallback(() => {
    updateField("dueRule", "");
  }, [updateField]);

  const clearStartTime = useCallback(() => {
    updateField("startTime", "");
  }, [updateField]);

  const formatStartTime = useCallback((startTime: string): string => {
    if (!startTime) return "";
    const parts = startTime.split(" ");
    if (parts.length < 2) return "";
    const date = new Date(parts[0]);
    const time = new Date(`2000-01-01 ${parts[1]}`);
    return `${date.toLocaleDateString()} ${time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }, []);

  const parseDueRule = (dueRule: string): { days: string; time: string } => {
    if (!dueRule) return { days: "", time: "23:59:59" };
    
    const parts = dueRule.split(" ");
    if (parts.length < 2) return { days: "", time: parts[0] || "23:59:59" };
    
    const timePart = parts[1] || "23:59:59";
    const relativePart = parts[0] || "";
    const daysMatch = relativePart.match(/^\+(\d+)([dwmy])$/);
    const days = daysMatch ? daysMatch[1] : "";
    const unit = daysMatch ? daysMatch[2] : "d";
    
    return { days, time: timePart };
  };

  const taskTypes: { value: TaskType; label: string }[] = [
    { value: "by executions", label: "Count" },
    { value: "by time", label: "Timer" },
    { value: "note", label: "Note" },
  ];

  const showObjective = formData.type !== "note";
  const showRecurringAndDue = formData.type !== "note";

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <ThemedText type="subtitle">Name *</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          placeholder="Task name"
          placeholderTextColor={colors.textTertiary}
          value={formData.name}
          onChangeText={(text) => updateField("name", text)}
          autoFocus
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="subtitle">Location</ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          placeholder="Where?"
          placeholderTextColor={colors.textTertiary}
          value={formData.location}
          onChangeText={(text) => updateField("location", text)}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="subtitle">Type</ThemedText>
        <View style={[styles.segmentedControl, { borderColor: colors.border }]}>
          {taskTypes.map((taskType, index) => (
            <TouchableOpacity
              key={taskType.value}
              style={[
                styles.segment,
                formData.type === taskType.value && {
                  backgroundColor: colors.tint,
                },
                index === 0 && styles.segmentFirst,
                index === taskTypes.length - 1 && styles.segmentLast,
              ]}
              onPress={() => updateField("type", taskType.value)}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.segmentText,
                  {
                    color:
                      formData.type === taskType.value
                        ? "#fff"
                        : colors.textSecondary,
                  },
                ]}
              >
                {taskType.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {showObjective && (
        <View style={styles.field}>
          <ThemedText type="subtitle">
            Target {formData.type === "by time" ? "(time)" : "count"}
          </ThemedText>
          {formData.type === "by time" ? (
            <View style={styles.objectiveRow}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputSmall,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="60"
                placeholderTextColor={colors.textTertiary}
                value={formData.objective}
                onChangeText={(text) => updateField("objective", text)}
                keyboardType="number-pad"
              />
              <View style={styles.unitsRow}>
                {[
                  { value: "hours", label: "hours" },
                  { value: "minutes", label: "min" },
                  { value: "seconds", label: "sec" },
                ].map((unitOption) => (
                  <TouchableOpacity
                    key={unitOption.value}
                    style={[
                      styles.unitButton,
                      { borderColor: colors.border },
                      formData.objectiveUnit === unitOption.value && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => updateField("objectiveUnit", unitOption.value as "hours" | "minutes" | "seconds")}
                  >
                    <ThemedText
                      type="default"
                      style={{
                        color: formData.objectiveUnit === unitOption.value ? "#fff" : colors.text,
                      }}
                    >
                      {unitOption.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              placeholder="1"
              placeholderTextColor={colors.textTertiary}
              value={formData.objective}
              onChangeText={(text) => updateField("objective", text)}
              keyboardType="number-pad"
            />
          )}
        </View>
      )}

      {showRecurringAndDue && (
        <View style={styles.field}>
          <View style={styles.recurrentToggle}>
            <ThemedText type="subtitle">Recurring</ThemedText>
            <TouchableOpacity
              style={[
                styles.toggle,
                {
                  backgroundColor: formData.isRecurrent
                    ? colors.tint
                    : colors.borderLight,
                },
              ]}
              onPress={() => updateField("isRecurrent", !formData.isRecurrent)}
            >
              <View
                style={[
                  styles.toggleKnob,
                  formData.isRecurrent && { right: 2 },
                  formData.isRecurrent && { left: undefined },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showRecurringAndDue && formData.isRecurrent && (
        <View style={styles.field}>
          <TouchableOpacity
            style={[
              styles.recurrenceButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            onPress={() => setShowRecurrenceBuilder(true)}
          >
            <ThemedText type="default" style={{ color: colors.textSecondary }}>
              {formData.recurrency
                ? "Edit recurrence"
                : "Set up recurrence"}
            </ThemedText>
          </TouchableOpacity>
          {formData.recurrency && (
            <ThemedText
              type="default"
              style={[styles.recurrencePreview, { color: colors.textSecondary }]}
            >
              {formData.recurrency}
            </ThemedText>
          )}
        </View>
      )}

      {showRecurringAndDue && formData.isRecurrent && (
        <View style={styles.field}>
          {!formData.startTime ? (
            <View style={styles.dueDateRow}>
              <ThemedText type="subtitle">Start time</ThemedText>
              <TouchableOpacity
                style={[styles.toggle, { backgroundColor: colors.borderLight }]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <ThemedText type="default" style={{ color: colors.textSecondary }}>
                  Set
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.dueDateRow}>
              <ThemedText type="subtitle">Start time</ThemedText>
              <View style={styles.dateTimeRow}>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <ThemedText type="default">
                    {formatDate(new Date(formData.startTime.split(" ")[0]))}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <ThemedText type="default">
                    {formatTime(new Date(`2000-01-01 ${formData.startTime.split(" ")[1] || "00:00:00"}`))}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={clearStartTime}>
                  <ThemedText type="default" style={{ color: colors.error }}>
                    Clear
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {showRecurringAndDue && !formData.dueRule && (
        <View style={styles.field}>
          <View style={styles.dueDateRow}>
            <ThemedText type="subtitle">Due date</ThemedText>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: colors.borderLight }]}
              onPress={() => formData.isRecurrent ? setShowDueRuleBuilder(true) : setShowDatePicker(true)}
            >
              <ThemedText type="default" style={{ color: colors.textSecondary }}>
                Set
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showRecurringAndDue && formData.dueRule && (
        <View style={styles.field}>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[
                styles.dateButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              onPress={() => formData.isRecurrent ? setShowDueRuleBuilder(true) : setShowDatePicker(true)}
            >
              <ThemedText type="default">
                {formData.isRecurrent ? formData.dueRule : formatDate(new Date(formData.dueRule.split(" ")[0]))}
              </ThemedText>
            </TouchableOpacity>
            {!formData.isRecurrent && (
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText type="default">
                  {formData.dueRule.split(" ")[1] 
                    ? formatTime(new Date(`2000-01-01 ${formData.dueRule.split(" ")[1]}`))
                    : "Set time"}
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.clearButton} onPress={clearDueRule}>
              <ThemedText type="default" style={{ color: colors.error }}>
                Clear
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            !formData.name.trim() && styles.buttonDisabled,
            {
              backgroundColor: formData.name.trim() ? colors.tint : colors.borderLight,
            },
          ]}
          onPress={handleSubmit}
          disabled={!formData.name.trim()}
        >
          <ThemedText
            type="defaultSemiBold"
            style={{ color: formData.name.trim() ? "#fff" : colors.textTertiary }}
          >
            {initialData ? "Save" : "Create"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showRecurrenceBuilder}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowRecurrenceBuilder(false)}
      >
        <RecurrenceBuilder
          value={formData.recurrency}
          onChange={(rrule) => updateField("recurrency", rrule)}
          onClose={() => setShowRecurrenceBuilder(false)}
        />
      </Modal>

      {showDueRuleBuilder && (
        <Modal
          visible={showDueRuleBuilder}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowDueRuleBuilder(false)}
        >
          <DueRuleBuilder
            value={formData.dueRule}
            onChange={(dueRule) => updateField("dueRule", dueRule)}
            onClose={() => setShowDueRuleBuilder(false)}
          />
        </Modal>
      )}

      {showDatePicker && (
        <DateTimePicker
          value={formData.dueRule ? new Date(formData.dueRule.split(" ")[0]) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (date) {
              const time = formData.dueRule?.split(" ")[1]
                ? new Date(`2000-01-01 ${formData.dueRule.split(" ")[1]}`)
                : null;
              updateField("dueRule", formatFixedDueDate(date, time));
            }
            setShowDatePicker(Platform.OS === "ios");
            if (Platform.OS !== "ios") {
              setShowDatePicker(false);
            }
          }}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={formData.dueRule?.split(" ")[1]
            ? new Date(`2000-01-01 ${formData.dueRule.split(" ")[1]}`)
            : new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (date) {
              const dateStr = formData.dueRule?.split(" ")[0] || new Date().toISOString().split("T")[0];
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              updateField("dueRule", `${dateStr} ${hours}:${minutes}:00`);
            }
            setShowTimePicker(Platform.OS === "ios");
            if (Platform.OS !== "ios") {
              setShowTimePicker(false);
            }
          }}
        />
      )}

      {showStartDatePicker && (
        <DateTimePicker
          value={formData.startTime ? new Date(formData.startTime.split(" ")[0]) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (date) {
              const timePart = formData.startTime?.split(" ")[1] || "00:00:00";
              const dateStr = date.toISOString().split("T")[0];
              updateField("startTime", `${dateStr} ${timePart}`);
            }
            setShowStartDatePicker(Platform.OS === "ios");
            if (Platform.OS !== "ios") {
              setShowStartDatePicker(false);
            }
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={formData.startTime?.split(" ")[1]
            ? new Date(`2000-01-01 ${formData.startTime.split(" ")[1]}`)
            : new Date(`2000-01-01 00:00:00`)}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (date) {
              const dateStr = formData.startTime?.split(" ")[0] || new Date().toISOString().split("T")[0];
              const hours = date.getHours().toString().padStart(2, "0");
              const minutes = date.getMinutes().toString().padStart(2, "0");
              updateField("startTime", `${dateStr} ${hours}:${minutes}:00`);
            }
            setShowStartTimePicker(Platform.OS === "ios");
            if (Platform.OS !== "ios") {
              setShowStartTimePicker(false);
            }
          }}
        />
      )}
    </View>
  );
}

interface DueRuleBuilderProps {
  value: string;
  onChange: (dueRule: string) => void;
  onClose: () => void;
}

function DueRuleBuilder({ value, onChange, onClose }: DueRuleBuilderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const parseValue = (v: string): { days: string; unit: string; time: string } => {
    if (!v) return { days: "0", unit: "d", time: "23:59:59" };
    
    const parts = v.split(" ");
    if (parts.length < 2) return { days: "0", unit: "d", time: parts[0] || "23:59:59" };
    
    const timePart = parts[1] || "23:59:59";
    const relativePart = parts[0] || "+0d";
    const match = relativePart.match(/^\+(\d+)([dwmy])$/);
    
    return {
      days: match ? match[1] : "0",
      unit: match ? match[2] : "d",
      time: timePart,
    };
  };

  const [state, setState] = useState(() => parseValue(value));
  const [showTimePicker, setShowTimePicker] = useState(false);

  const units = [
    { value: "d", label: "days" },
    { value: "w", label: "weeks" },
    { value: "m", label: "months" },
    { value: "y", label: "years" },
  ];

  const formatTime = (t: string): string => {
    const [h, m] = t.split(":");
    const date = new Date();
    date.setHours(parseInt(h || "23", 10));
    date.setMinutes(parseInt(m || "59", 10));
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const generateDueRule = (): string => {
    const timeParts = state.time.split(":");
    const date = new Date();
    date.setHours(parseInt(timeParts[0] || "23", 10));
    date.setMinutes(parseInt(timeParts[1] || "59", 10));
    const timeStr = `${timeParts[0]}:${timeParts[1]}:00`;
    return `+${state.days || "0"}${state.unit} ${timeStr}`;
  };

  const renderContent = () => (
    <View style={styles.builderContainer}>
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
          Cancel
        </ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={styles.builderTitle}>
        Due after
      </ThemedText>

      <View style={styles.field}>
        <View style={styles.intervalRow}>
          <TextInput
            style={[
              styles.input,
              styles.inputSmall,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            value={state.days}
            onChangeText={(text) => setState((prev) => ({ ...prev, days: text.replace(/[^0-9]/g, "") }))}
            keyboardType="number-pad"
          />
          <View style={styles.unitsRow}>
            {units.map((unitOption) => (
              <TouchableOpacity
                key={unitOption.value}
                style={[
                  styles.unitButton,
                  { borderColor: colors.border },
                  state.unit === unitOption.value && { backgroundColor: colors.tint },
                ]}
                onPress={() => setState((prev) => ({ ...prev, unit: unitOption.value }))}
              >
                <ThemedText
                  type="default"
                  style={{
                    color: state.unit === unitOption.value ? "#fff" : colors.text,
                  }}
                >
                  {unitOption.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="subtitle">Due at</ThemedText>
        <TouchableOpacity
          style={[
            styles.input,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => setShowTimePicker(true)}
        >
          <ThemedText type="default">{formatTime(state.time)}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.previewRow}>
        <ThemedText type="subtitle">Preview</ThemedText>
        <ThemedText
          type="default"
          style={[styles.previewText, { color: colors.textSecondary }]}
        >
          {generateDueRule()}
        </ThemedText>
      </View>

      <TouchableOpacity
        style={[styles.confirmButton, { backgroundColor: colors.tint }]}
        onPress={() => {
          onChange(generateDueRule());
          onClose();
        }}
      >
        <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
          Confirm
        </ThemedText>
      </TouchableOpacity>

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01 ${state.time}`)}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (date) {
              const h = date.getHours().toString().padStart(2, "0");
              const m = date.getMinutes().toString().padStart(2, "0");
              setState((prev) => ({ ...prev, time: `${h}:${m}:00` }));
            }
            setShowTimePicker(Platform.OS === "ios");
            if (Platform.OS !== "ios") {
              setShowTimePicker(false);
            }
          }}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.dueRuleBuilderContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.dueRuleBuilderHeader, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
            Cancel
          </ThemedText>
        </TouchableOpacity>
        <ThemedText type="defaultSemiBold">Due after</ThemedText>
        <TouchableOpacity
          onPress={() => {
            onChange(generateDueRule());
            onClose();
          }}
        >
          <ThemedText type="defaultSemiBold" style={{ color: colors.tint }}>
            Done
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.dueRuleBuilderContent}>
        <View style={styles.field}>
          <ThemedText type="subtitle">After</ThemedText>
          <View style={styles.intervalRow}>
            <TextInput
              style={[
                styles.input,
                styles.inputSmall,
                {
                  color: colors.text,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              value={state.days}
              onChangeText={(text) => setState((prev) => ({ ...prev, days: text.replace(/[^0-9]/g, "") }))}
              keyboardType="number-pad"
              placeholder="0"
            />
            <View style={styles.unitsRow}>
              {units.map((unitOption) => (
                <TouchableOpacity
                  key={unitOption.value}
                  style={[
                    styles.unitButton,
                    { borderColor: colors.border },
                    state.unit === unitOption.value && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setState((prev) => ({ ...prev, unit: unitOption.value }))}
                >
                  <ThemedText
                    type="default"
                    style={{
                      color: state.unit === unitOption.value ? "#fff" : colors.text,
                    }}
                  >
                    {unitOption.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="subtitle">Due at</ThemedText>
          <TouchableOpacity
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            onPress={() => setShowTimePicker(true)}
          >
            <ThemedText type="default">{formatTime(state.time)}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.previewRow}>
          <ThemedText type="subtitle">Preview</ThemedText>
          <ThemedText
            type="default"
            style={[styles.previewText, { color: colors.textSecondary }]}
          >
            {generateDueRule()}
          </ThemedText>
        </View>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01 ${state.time}`)}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            if (date) {
              const h = date.getHours().toString().padStart(2, "0");
              const m = date.getMinutes().toString().padStart(2, "0");
              setState((prev) => ({ ...prev, time: `${h}:${m}:00` }));
            }
            setShowTimePicker(Platform.OS === "ios");
            if (Platform.OS !== "ios") {
              setShowTimePicker(false);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  field: {
    marginBottom: Spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  segmentedControl: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentFirst: {
    borderTopLeftRadius: BorderRadius.md - 1,
    borderBottomLeftRadius: BorderRadius.md - 1,
  },
  segmentLast: {
    borderTopRightRadius: BorderRadius.md - 1,
    borderBottomRightRadius: BorderRadius.md - 1,
  },
  segmentText: {
    fontSize: FontSize.sm,
  },
  dueDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  clearButton: {
    padding: Spacing.md,
  },
  toggle: {
    width: 44,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleKnob: {
    position: "absolute",
    left: 2,
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    backgroundColor: "#fff",
  },
  recurrentToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recurrenceButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  recurrencePreview: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    fontFamily: "monospace",
  },
  buttons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  builderWrapper: {
    flex: 1,
  },
  dueRuleBuilderContainer: {
    flex: 1,
    padding: Spacing.lg,
  },
  dueRuleBuilderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  dueRuleBuilderContent: {
    flex: 1,
    paddingTop: Spacing.lg,
  },
  builderContainer: {
    flex: 1,
  },
  builderTitle: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.lg,
  },
  backButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  intervalRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  inputSmall: {
    width: 60,
    flexGrow: 0,
  },
  objectiveRow: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  unitsRow: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xs,
  },
  unitButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: 50,
    alignItems: "center",
  },
  previewRow: {
    marginTop: Spacing.xl,
  },
  previewText: {
    fontSize: FontSize.md,
    fontFamily: "monospace",
    marginTop: Spacing.sm,
  },
  confirmButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: "auto",
  },
});