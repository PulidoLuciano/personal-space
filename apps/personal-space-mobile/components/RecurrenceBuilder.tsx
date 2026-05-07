import { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  useColorScheme,
  type ViewStyle,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "@/constants/theme";
import { Spacing, BorderRadius, FontSize } from "@/constants/spacing";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";

type Frequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type EndType = "NEVER" | "UNTIL" | "COUNT";
type DayOfWeek = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
type MonthDayType = "dayOfMonth" | "nthWeekday";
type NthWeekday = "1" | "2" | "3" | "4" | "-1";

interface RecurrenceState {
  frequency: Frequency;
  interval: string;
  daysOfWeek: DayOfWeek[];
  dayOfMonth: string;
  monthDayType: MonthDayType;
  nthWeekday: NthWeekday;
  nthWeekdayDay: DayOfWeek | null;
  yearMonth: string;
  yearDayType: MonthDayType;
  yearNthWeekday: NthWeekday;
  yearNthWeekdayDay: DayOfWeek | null;
  endType: EndType;
  endDate: Date | null;
  endCount: string;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
  { value: "MO", label: "M" },
  { value: "TU", label: "T" },
  { value: "WE", label: "W" },
  { value: "TH", label: "T" },
  { value: "FR", label: "F" },
  { value: "SA", label: "S" },
  { value: "SU", label: "S" },
];

const DAYS_FULL: Record<DayOfWeek, string> = {
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
  SU: "Sunday",
};

const NTH_OPTIONS: { value: NthWeekday; label: string }[] = [
  { value: "1", label: "1st" },
  { value: "2", label: "2nd" },
  { value: "3", label: "3rd" },
  { value: "4", label: "4th" },
  { value: "-1", label: "Last" },
];

const MONTHS: { value: string; label: string }[] = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const FREQUENCIES: { value: Frequency; label: string; description: string }[] = [
  { value: "DAILY", label: "Daily", description: "Every day" },
  { value: "WEEKLY", label: "Weekly", description: "Once a week" },
  { value: "MONTHLY", label: "Monthly", description: "Once a month" },
  { value: "YEARLY", label: "Yearly", description: "Once a year" },
];

interface RecurrenceBuilderProps {
  value: string;
  onChange: (rrule: string) => void;
  onClose: () => void;
}

export function RecurrenceBuilder({ value, onChange, onClose }: RecurrenceBuilderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = isDark ? Colors.dark : Colors.light;

  const parseInitialValue = (rrule: string): RecurrenceState => {
    if (!rrule) {
      return {
        frequency: "DAILY",
        interval: "1",
        daysOfWeek: [],
        dayOfMonth: "1",
        monthDayType: "dayOfMonth",
        nthWeekday: "1",
        nthWeekdayDay: null,
        yearMonth: "1",
        yearDayType: "dayOfMonth",
        yearNthWeekday: "1",
        yearNthWeekdayDay: null,
        endType: "NEVER",
        endDate: null,
        endCount: "10",
      };
    }

    try {
      const rule = rrule.toUpperCase();
      const parts: Record<string, string> = {};
      rule.split(";").forEach((part) => {
        const [key, val] = part.split("=");
        if (key && val) parts[key] = val;
      });

      const byday = parts.BYDAY || "";
      const hasNthWeekday = /^[+-]?\d+[A-Z]{2}$/.test(byday);

      return {
        frequency: (parts.FREQ as Frequency) || "DAILY",
        interval: parts.INTERVAL || "1",
        daysOfWeek: parts.BYDAY && !hasNthWeekday ? (parts.BYDAY.split(",") as DayOfWeek[]) : [],
        dayOfMonth: parts.BYMONTHDAY || "1",
        monthDayType: hasNthWeekday ? "nthWeekday" : "dayOfMonth",
        nthWeekday: hasNthWeekday ? (byday.replace(/[A-Z]/g, "") as NthWeekday) : "1",
        nthWeekdayDay: hasNthWeekday ? (byday.replace(/\d/g, "") as DayOfWeek) : null,
        yearMonth: parts.BYMONTH || "1",
        yearDayType: hasNthWeekday && parts.BYYEARDAY ? "nthWeekday" : "dayOfMonth",
        yearNthWeekday: hasNthWeekday ? (byday.replace(/[A-Z]/g, "") as NthWeekday) : "1",
        yearNthWeekdayDay: hasNthWeekday ? (byday.replace(/\d/g, "") as DayOfWeek) : null,
        endType: parts.UNTIL ? "UNTIL" : parts.COUNT ? "COUNT" : "NEVER",
        endDate: parts.UNTIL ? new Date(parts.UNTIL.split("T")[0]) : null,
        endCount: parts.COUNT || "10",
      };
    } catch {
      return {
        frequency: "DAILY",
        interval: "1",
        daysOfWeek: [],
        dayOfMonth: "1",
        monthDayType: "dayOfMonth",
        nthWeekday: "1",
        nthWeekdayDay: null,
        yearMonth: "1",
        yearDayType: "dayOfMonth",
        yearNthWeekday: "1",
        yearNthWeekdayDay: null,
        endType: "NEVER",
        endDate: null,
        endCount: "10",
      };
    }
  };

  const [state, setState] = useState<RecurrenceState>(() => parseInitialValue(value));
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateState = useCallback(
    <K extends keyof RecurrenceState>(field: K, value: RecurrenceState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleDay = useCallback(
    (day: DayOfWeek) => {
      const current = state.daysOfWeek.includes(day)
        ? state.daysOfWeek.filter((d) => d !== day)
        : [...state.daysOfWeek, day].sort(
            (a, b) => DAYS_OF_WEEK.findIndex((d) => d.value === a) - DAYS_OF_WEEK.findIndex((d) => d.value === b)
          );
      updateState("daysOfWeek", current);
    },
    [state.daysOfWeek, updateState]
  );

  const generateRRule = useCallback((): string => {
    const parts: string[] = [`FREQ=${state.frequency}`];

    if (state.interval !== "1") {
      parts.push(`INTERVAL=${state.interval}`);
    }

    if (state.frequency === "WEEKLY" && state.daysOfWeek.length > 0) {
      parts.push(`BYDAY=${state.daysOfWeek.join(",")}`);
    }

    if (state.frequency === "MONTHLY") {
      if (state.monthDayType === "nthWeekday" && state.nthWeekdayDay) {
        parts.push(`BYDAY=${state.nthWeekday}${state.nthWeekdayDay}`);
      } else if (state.dayOfMonth) {
        parts.push(`BYMONTHDAY=${state.dayOfMonth}`);
      }
    }

    if (state.frequency === "YEARLY") {
      parts.push(`BYMONTH=${state.yearMonth}`);
      if (state.yearDayType === "nthWeekday" && state.yearNthWeekdayDay) {
        parts.push(`BYDAY=${state.yearNthWeekday}${state.yearNthWeekdayDay}`);
      } else if (state.dayOfMonth) {
        parts.push(`BYMONTHDAY=${state.dayOfMonth}`);
      }
    }

    if (state.endType === "UNTIL" && state.endDate) {
      const dateStr = state.endDate.toISOString().split("T")[0];
      parts.push(`UNTIL=${dateStr}T235959`);
    } else if (state.endType === "COUNT" && state.endCount) {
      parts.push(`COUNT=${state.endCount}`);
    }

    return parts.join(";");
  }, [state]);

  const getNthLabel = (nth: NthWeekday, day: DayOfWeek | null): string => {
    if (!day) return "";
    const ordinal = nth === "-1" ? "Last" : `${["1st", "2nd", "3rd", "4th"][parseInt(nth) - 1]}`;
    return `${ordinal} ${DAYS_FULL[day]}`;
  };

  const getPreviewText = (): string => {
    const interval = state.interval === "1" ? "" : ` every ${state.interval}`;

    switch (state.frequency) {
      case "DAILY":
        return `Every${interval} day${state.interval === "1" ? "" : "s"}`;

      case "WEEKLY":
        if (state.daysOfWeek.length > 0) {
          return `Every${interval} week on ${state.daysOfWeek.map((d) => DAYS_FULL[d]).join(", ")}`;
        }
        return `Every${interval} week`;

      case "MONTHLY":
        if (state.monthDayType === "nthWeekday" && state.nthWeekdayDay) {
          return `Monthly on the ${getNthLabel(state.nthWeekday, state.nthWeekdayDay)}`;
        }
        return `Monthly on day ${state.dayOfMonth}`;

      case "YEARLY": {
        const monthLabel = MONTHS.find((m) => m.value === state.yearMonth)?.label || "";
        if (state.yearDayType === "nthWeekday" && state.yearNthWeekdayDay) {
          return `Yearly on ${getNthLabel(state.yearNthWeekday, state.yearNthWeekdayDay)} of ${monthLabel}`;
        }
        return `Yearly on ${monthLabel} ${state.dayOfMonth}`;
      }

      default:
        return "";
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer as ViewStyle}>
      <ThemedText type="title">
        How often?
      </ThemedText>
      <View style={styles.options as ViewStyle}>
        {FREQUENCIES.map((freq) => (
          <TouchableOpacity
            key={freq.value}
            style={[
              styles.optionCard,
              { borderColor: colors.border },
              state.frequency === freq.value && {
                backgroundColor: colors.tintLight,
                borderColor: colors.tint,
              },
            ]}
            onPress={() => {
              updateState("frequency", freq.value);
              setStep(2);
            }}
          >
            <ThemedText type="defaultSemiBold">{freq.label}</ThemedText>
            <ThemedText type="default" style={{ color: colors.textSecondary }}>
              {freq.description}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => {
    const showInterval = true;
    const showDays = state.frequency === "WEEKLY";
    const showMonthDay = state.frequency === "MONTHLY";
    const showYearMonth = state.frequency === "YEARLY";

    return (
      <View style={styles.stepContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
          <IconSymbol size={20} name="chevron.right" color={colors.tint} />
          <ThemedText type="default" style={{ color: colors.tint, marginLeft: 4 }}>
            Back
          </ThemedText>
        </TouchableOpacity>

        <ThemedText type="title" style={styles.stepTitle}>
          Details
        </ThemedText>

        {showInterval && (
          <View style={styles.field}>
            <ThemedText type="subtitle">Every</ThemedText>
            <View style={styles.intervalRow}>
              <TextInput
                style={[
                  styles.intervalInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                value={state.interval}
                onChangeText={(text) => updateState("interval", text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
              />
              <ThemedText type="default" style={{ color: colors.textSecondary }}>
                {state.frequency === "DAILY"
                  ? "day(s)"
                  : state.frequency === "WEEKLY"
                  ? "week(s)"
                  : state.frequency === "MONTHLY"
                  ? "month(s)"
                  : "year(s)"}
              </ThemedText>
            </View>
          </View>
        )}

        {showDays && (
          <View style={styles.field}>
            <ThemedText type="subtitle">On days</ThemedText>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = state.daysOfWeek.includes(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayButton,
                      { borderColor: colors.border },
                      isSelected && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <ThemedText
                      type="defaultSemiBold"
                      style={{ color: isSelected ? "#fff" : colors.text }}
                    >
                      {day.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
            {state.daysOfWeek.length > 0 && (
              <ThemedText
                type="default"
                style={[styles.selectedDays, { color: colors.textSecondary }]}
              >
                {state.daysOfWeek.map((d) => DAYS_FULL[d]).join(", ")}
              </ThemedText>
            )}
          </View>
        )}

        {showMonthDay && (
          <View style={styles.field}>
            <ThemedText type="subtitle">On</ThemedText>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: colors.border },
                  state.monthDayType === "dayOfMonth" && { backgroundColor: colors.tint },
                ]}
                onPress={() => updateState("monthDayType", "dayOfMonth")}
              >
                <ThemedText
                  type="default"
                  style={{ color: state.monthDayType === "dayOfMonth" ? "#fff" : colors.text }}
                >
                  Day of month
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  { borderColor: colors.border },
                  state.monthDayType === "nthWeekday" && { backgroundColor: colors.tint },
                ]}
                onPress={() => updateState("monthDayType", "nthWeekday")}
              >
                <ThemedText
                  type="default"
                  style={{ color: state.monthDayType === "nthWeekday" ? "#fff" : colors.text }}
                >
                  Nth weekday
                </ThemedText>
              </TouchableOpacity>
            </View>

            {state.monthDayType === "dayOfMonth" ? (
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                value={state.dayOfMonth}
                onChangeText={(text) =>
                  updateState("dayOfMonth", text.replace(/[^0-9]/g, "").slice(0, 2))
                }
                placeholder="1"
                keyboardType="number-pad"
              />
            ) : (
              <View style={styles.nthWeekdayRow}>
                <View style={styles.nthRow}>
                  {NTH_OPTIONS.map((nth) => (
                    <TouchableOpacity
                      key={nth.value}
                      style={[
                        styles.nthButton,
                        { borderColor: colors.border },
                        state.nthWeekday === nth.value && { backgroundColor: colors.tint },
                      ]}
                      onPress={() => updateState("nthWeekday", nth.value)}
                    >
                      <ThemedText
                        type="default"
                        style={{
                          color: state.nthWeekday === nth.value ? "#fff" : colors.text,
                        }}
                      >
                        {nth.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.daysRow}>
                  {DAYS_OF_WEEK.slice(0, 5).map((day) => {
                    const isSelected = state.nthWeekdayDay === day.value;
                    return (
                      <TouchableOpacity
                        key={day.value}
                        style={[
                          styles.dayButton,
                          { borderColor: colors.border },
                          isSelected && { backgroundColor: colors.tint },
                        ]}
                        onPress={() => updateState("nthWeekdayDay", day.value)}
                      >
                        <ThemedText
                          type="defaultSemiBold"
                          style={{ color: isSelected ? "#fff" : colors.text }}
                        >
                          {day.label}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {showYearMonth && (
          <>
            <View style={styles.field}>
              <ThemedText type="subtitle">In month</ThemedText>
              <View style={styles.monthsGrid}>
                {MONTHS.map((month) => (
                  <TouchableOpacity
                    key={month.value}
                    style={[
                      styles.monthButton,
                      { borderColor: colors.border },
                      state.yearMonth === month.value && { backgroundColor: colors.tint },
                    ]}
                    onPress={() => updateState("yearMonth", month.value)}
                  >
                    <ThemedText
                      type="default"
                      style={{
                        color: state.yearMonth === month.value ? "#fff" : colors.text,
                        fontSize: FontSize.xs,
                      }}
                    >
                      {month.label.slice(0, 3)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <ThemedText type="subtitle">On</ThemedText>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    state.yearDayType === "dayOfMonth" && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => updateState("yearDayType", "dayOfMonth")}
                >
                  <ThemedText
                    type="default"
                    style={{ color: state.yearDayType === "dayOfMonth" ? "#fff" : colors.text }}
                  >
                    Day of month
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    { borderColor: colors.border },
                    state.yearDayType === "nthWeekday" && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => updateState("yearDayType", "nthWeekday")}
                >
                  <ThemedText
                    type="default"
                    style={{ color: state.yearDayType === "nthWeekday" ? "#fff" : colors.text }}
                  >
                    Nth weekday
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {state.yearDayType === "dayOfMonth" ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  value={state.dayOfMonth}
                  onChangeText={(text) =>
                    updateState("dayOfMonth", text.replace(/[^0-9]/g, "").slice(0, 2))
                  }
                  placeholder="1"
                  keyboardType="number-pad"
                />
              ) : (
                <View style={styles.nthWeekdayRow}>
                  <View style={styles.nthRow}>
                    {NTH_OPTIONS.map((nth) => (
                      <TouchableOpacity
                        key={nth.value}
                        style={[
                          styles.nthButton,
                          { borderColor: colors.border },
                          state.yearNthWeekday === nth.value && { backgroundColor: colors.tint },
                        ]}
                        onPress={() => updateState("yearNthWeekday", nth.value)}
                      >
                        <ThemedText
                          type="default"
                          style={{
                            color: state.yearNthWeekday === nth.value ? "#fff" : colors.text,
                          }}
                        >
                          {nth.label}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.daysRow}>
                    {DAYS_OF_WEEK.slice(0, 5).map((day) => {
                      const isSelected = state.yearNthWeekdayDay === day.value;
                      return (
                        <TouchableOpacity
                          key={day.value}
                          style={[
                            styles.dayButton,
                            { borderColor: colors.border },
                            isSelected && { backgroundColor: colors.tint },
                          ]}
                          onPress={() => updateState("yearNthWeekdayDay", day.value)}
                        >
                          <ThemedText
                            type="defaultSemiBold"
                            style={{ color: isSelected ? "#fff" : colors.text }}
                          >
                            {day.label}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={() => setStep(3)}
        >
          <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
            Next
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
        <IconSymbol size={20} name="chevron.right" color={colors.tint} />
        <ThemedText type="default" style={{ color: colors.tint, marginLeft: 4 }}>
          Back
        </ThemedText>
      </TouchableOpacity>

      <ThemedText type="title" style={styles.stepTitle}>
        End condition
      </ThemedText>

      <View style={styles.options}>
        <TouchableOpacity
          style={[
            styles.optionCard,
            { borderColor: colors.border },
            state.endType === "NEVER" && {
              backgroundColor: colors.tintLight,
              borderColor: colors.tint,
            },
          ]}
          onPress={() => updateState("endType", "NEVER")}
        >
          <ThemedText type="defaultSemiBold">Never</ThemedText>
          <ThemedText type="default" style={{ color: colors.textSecondary }}>
            Repeat forever
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            { borderColor: colors.border },
            state.endType === "UNTIL" && {
              backgroundColor: colors.tintLight,
              borderColor: colors.tint,
            },
          ]}
          onPress={() => {
            updateState("endType", "UNTIL");
            if (!state.endDate) {
              setShowDatePicker(true);
            }
          }}
        >
          <ThemedText type="defaultSemiBold">On date</ThemedText>
          <ThemedText type="default" style={{ color: colors.textSecondary }}>
            End on specific date
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionCard,
            { borderColor: colors.border },
            state.endType === "COUNT" && {
              backgroundColor: colors.tintLight,
              borderColor: colors.tint,
            },
          ]}
          onPress={() => updateState("endType", "COUNT")}
        >
          <ThemedText type="defaultSemiBold">After times</ThemedText>
          <ThemedText type="default" style={{ color: colors.textSecondary }}>
            End after N occurrences
          </ThemedText>
        </TouchableOpacity>
      </View>

      {state.endType === "UNTIL" && state.endDate && (
        <View style={styles.targetDateRow}>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText type="default">
              {state.endDate?.toLocaleDateString()}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearDateButton}
            onPress={() => updateState("endDate", null)}
          >
            <ThemedText type="default" style={{ color: colors.error }}>
              Clear
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {state.endType === "COUNT" && (
        <View style={styles.field}>
          <ThemedText type="subtitle">Number of times</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            value={state.endCount}
            onChangeText={(text) =>
              updateState("endCount", text.replace(/[^0-9]/g, ""))
            }
            placeholder="10"
            keyboardType="number-pad"
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.nextButton, { backgroundColor: colors.tint }]}
        onPress={() => setStep(4)}
      >
        <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
          Review
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderStep4 = () => {
    const rrule = generateRRule();
    const previewText = getPreviewText();

    const endText =
      state.endType === "NEVER"
        ? ", no end date"
        : state.endType === "UNTIL"
        ? `, until ${state.endDate?.toLocaleDateString()}`
        : `, ${state.endCount} times`;

    return (
      <View style={styles.stepContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
          <IconSymbol size={20} name="chevron.right" color={colors.tint} />
          <ThemedText type="default" style={{ color: colors.tint, marginLeft: 4 }}>
            Back
          </ThemedText>
        </TouchableOpacity>

        <ThemedText type="title" style={styles.stepTitle}>
          Preview
        </ThemedText>

        <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
          <ThemedText type="defaultSemiBold" style={styles.previewTitle}>
            {previewText}
            {endText}
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="subtitle">RRule</ThemedText>
          <ThemedText
            type="default"
            style={[styles.rruleText, { color: colors.textSecondary }]}
          >
            {rrule}
          </ThemedText>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton, { backgroundColor: colors.tint }]}
            onPress={() => {
              onChange(rrule);
              onClose();
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
              Confirm
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}

      {showDatePicker && state.endType === "UNTIL" && (
        <DateTimePicker
          value={state.endDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowDatePicker(Platform.OS === "ios");
            if (date) {
              updateState("endDate", date);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  options: {
    gap: Spacing.md,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  field: {
    marginTop: Spacing.xl,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  intervalInput: {
    width: 60,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
  },
  daysRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDays: {
    marginTop: Spacing.sm,
  },
  typeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  nthWeekdayRow: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  nthRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  nthButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  monthButton: {
    width: "calc(25% - 6px)",
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  nextButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: "auto",
  },
  previewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  previewTitle: {
    fontSize: FontSize.lg,
  },
  rruleText: {
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontFamily: "monospace",
  },
  targetDateRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  clearDateButton: {
    padding: Spacing.md,
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
  submitButton: {},
});