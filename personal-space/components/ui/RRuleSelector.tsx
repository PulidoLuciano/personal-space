import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, Pressable, Modal, SafeAreaView, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RRule, Frequency, Weekday } from "rrule";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";
import { MyInput } from "./MyInput";
import { DateTimeSelector } from "./DateTimeSelector";

export type RRuleFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface RRuleConfig {
  freq: RRuleFrequency;
  interval: number;
  weekdays: number[];
  monthdays: number[];
  endType: "NEVER" | "UNTIL" | "COUNT";
  until: string | null;
  count: number | null;
}

const WEEKDAYS = [
  { key: 1, label: "Mo" },
  { key: 2, label: "Tu" },
  { key: 3, label: "We" },
  { key: 4, label: "Th" },
  { key: 5, label: "Fr" },
  { key: 6, label: "Sa" },
  { key: 0, label: "Su" },
];

const FREQUENCIES: { key: RRuleFrequency; label: string }[] = [
  { key: "DAILY", label: "Daily" },
  { key: "WEEKLY", label: "Weekly" },
  { key: "MONTHLY", label: "Monthly" },
  { key: "YEARLY", label: "Yearly" },
];

const getFrequencyFromRRule = (freq: number): RRuleFrequency => {
  switch (freq) {
    case Frequency.DAILY:
      return "DAILY";
    case Frequency.WEEKLY:
      return "WEEKLY";
    case Frequency.MONTHLY:
      return "MONTHLY";
    case Frequency.YEARLY:
      return "YEARLY";
    default:
      return "WEEKLY";
  }
};

const getFrequencyValue = (freq: RRuleFrequency): Frequency => {
  switch (freq) {
    case "DAILY":
      return Frequency.DAILY;
    case "WEEKLY":
      return Frequency.WEEKLY;
    case "MONTHLY":
      return Frequency.MONTHLY;
    case "YEARLY":
      return Frequency.YEARLY;
    default:
      return Frequency.WEEKLY;
  }
};

const getWeekdayValue = (weekday: number): Weekday => {
  return new Weekday(weekday);
};

const defaultConfig: RRuleConfig = {
  freq: "WEEKLY",
  interval: 1,
  weekdays: [1],
  monthdays: [1],
  endType: "NEVER",
  until: null,
  count: 10,
};

interface RRuleSelectorProps {
  value: string;
  onChange: (rrule: string) => void;
  label?: string;
}

export const RRuleSelector: React.FC<RRuleSelectorProps> = ({
  value,
  onChange,
  label,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  const isPrimaryLight = colors.primary === "#FFFFFF" || colors.primary === "#FFF" || colors.primary.toLowerCase() === "#ffffff";
  const selectedTextColor = isPrimaryLight ? "#000000" : "#FFFFFF";

  const [config, setConfig] = useState<RRuleConfig>(defaultConfig);

  const parsedRule = useMemo(() => {
    if (!value) return null;
    try {
      const rule = RRule.fromString(value);
      return rule;
    } catch {
      return null;
    }
  }, [value]);

  useEffect(() => {
    if (parsedRule) {
      let weekdays: number[] = [];
      let monthdays: number[] = [];
      
      const byweekday = parsedRule.options.byweekday;
      if (byweekday) {
        const days = Array.isArray(byweekday) ? byweekday : [byweekday];
        weekdays = days.map((w) => {
          if (typeof w === 'number') return w;
          return (w as unknown as { weekday: number }).weekday;
        });
      }
      
      const bymonthday = parsedRule.options.bymonthday;
      if (bymonthday) {
        const days = Array.isArray(bymonthday) ? bymonthday : [bymonthday];
        monthdays = days.filter((d): d is number => typeof d === 'number');
      }

      setConfig({
        freq: getFrequencyFromRRule(parsedRule.options.freq),
        interval: parsedRule.options.interval || 1,
        weekdays: weekdays.length > 0 ? weekdays : [1],
        monthdays: monthdays.length > 0 ? monthdays : [1],
        endType: parsedRule.options.until ? "UNTIL" : (parsedRule.options.count ? "COUNT" : "NEVER"),
        until: parsedRule.options.until ? parsedRule.options.until.toISOString().split("T")[0] : null,
        count: parsedRule.options.count || 10,
      });
    }
  }, [parsedRule]);

  const generateRRule = useMemo(() => {
    const ruleConfig: { freq: Frequency; interval: number; byweekday?: Weekday[]; bymonthday?: number[]; until?: Date; count?: number } = {
      freq: getFrequencyValue(config.freq),
      interval: config.interval,
    };

    if (config.freq === "WEEKLY" && config.weekdays.length > 0) {
      ruleConfig.byweekday = config.weekdays.map(getWeekdayValue);
    }

    if (config.freq === "MONTHLY" && config.monthdays.length > 0) {
      ruleConfig.bymonthday = config.monthdays;
    }

    if (config.endType === "UNTIL" && config.until) {
      ruleConfig.until = new Date(config.until + "T23:59:59");
    } else if (config.endType === "COUNT" && config.count) {
      ruleConfig.count = config.count;
    }

    try {
      const rule = new RRule(ruleConfig);
      return rule.toString();
    } catch {
      return "";
    }
  }, [config]);

  useEffect(() => {
    onChange(generateRRule);
  }, [generateRRule, onChange]);

  const freqLabel = FREQUENCIES.find((f) => f.key === config.freq)?.label || "Weekly";

  const intervalLabel = t(`common.${config.freq.toLowerCase().slice(0, -1)}s`, { defaultValue: freqLabel });

  const renderPreview = () => {
    if (!generateRRule) return null;
    try {
      const rule = RRule.fromString(generateRRule);
      const nextDates = rule.all((_d, i) => {
        const idx = i as number;
        return idx < 3;
      });
      if (nextDates.length === 0) return null;
      const next3 = nextDates.map((d) => d.toLocaleDateString()).join(", ");
      return (
        <MyText variant="small" color="textMuted" style={styles.preview}>
          {next3}
        </MyText>
      );
    } catch {
      return null;
    }
  };

  const [showModal, setShowModal] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <MyText variant="small" color="textMuted" style={styles.label}>
          {label}
        </MyText>
      )}

      <Pressable
        onPress={() => setShowModal(true)}
        style={[
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.hover },
        ]}
      >
        <MyText variant="body" style={{ color: colors.text }}>
          {t("habit.every", { defaultValue: "Every" })} {config.interval} {intervalLabel}
          {config.endType === "COUNT" && ` (${config.count}x)`}
          {config.endType === "UNTIL" && ` ${t("habit.until", { defaultValue: "until" })} ${config.until}`}
        </MyText>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      {renderPreview()}

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <SafeAreaView 
            style={[styles.modalContent, { backgroundColor: colors.background }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <MyText variant="h2" weight="bold">
                {t("habit.recurrence", { defaultValue: "Recurrence" })}
              </MyText>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.section}>
                <MyText variant="small" color="textMuted" style={styles.sectionLabel}>
                  {t("habit.frequency", { defaultValue: "Frequency" })}
                </MyText>
                <View style={styles.optionsRow}>
                  {FREQUENCIES.map((freq) => (
                    <Pressable
                      key={freq.key}
                      onPress={() => setConfig({ ...config, freq: freq.key })}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: config.freq === freq.key ? colors.primary + "20" : colors.surface,
                          borderColor: config.freq === freq.key ? colors.primary : colors.hover,
                        },
                      ]}
                    >
                      <MyText
                        variant="small"
                        weight={config.freq === freq.key ? "semi" : "normal"}
                        style={{ color: config.freq === freq.key ? colors.primary : colors.text }}
                      >
                        {t(`habit.${freq.key.toLowerCase()}`, { defaultValue: freq.label })}
                      </MyText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <MyText variant="small" color="textMuted" style={styles.sectionLabel}>
                  {t("habit.interval", { defaultValue: "Every" })}
                </MyText>
                <View style={styles.intervalRow}>
                  <MyText variant="body">{t("habit.every", { defaultValue: "Every" })}</MyText>
                  <View style={styles.intervalInput}>
                    <MyInput
                      value={config.interval.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text, 10);
                        if (!isNaN(num) && num > 0) {
                          setConfig({ ...config, interval: num });
                        }
                      }}
                      keyboardType="number-pad"
                    />
                  </View>
                  <MyText variant="body">
                    {config.interval === 1
                      ? t(`common.${config.freq.toLowerCase().slice(0, -1)}`, { defaultValue: freqLabel })
                      : t(`common.${config.freq.toLowerCase()}`, { defaultValue: freqLabel + "s" })}
                  </MyText>
                </View>
              </View>

              {config.freq === "WEEKLY" && (
                <View style={styles.section}>
                  <MyText variant="small" color="textMuted" style={styles.sectionLabel}>
                    {t("habit.on_days", { defaultValue: "On days" })}
                  </MyText>
                  <View style={styles.weekdaysRow}>
                    {WEEKDAYS.map((day) => {
                      const isSelected = config.weekdays.includes(day.key);
                      return (
                        <Pressable
                          key={day.key}
                          onPress={() => {
                            const newWeekdays = isSelected
                              ? config.weekdays.filter((w) => w !== day.key)
                              : [...config.weekdays, day.key];
                            setConfig({ ...config, weekdays: newWeekdays.length > 0 ? newWeekdays : [day.key] });
                          }}
                          style={[
                            styles.weekdayButton,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.surface,
                              borderColor: isSelected ? colors.primary : colors.hover,
                            },
                          ]}
                        >
                          <MyText
                            variant="small"
                            weight="semi"
                            style={{ color: isSelected ? selectedTextColor : colors.text }}
                          >
                            {day.label}
                          </MyText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              )}

              {config.freq === "MONTHLY" && (
                <View style={styles.section}>
                  <MyText variant="small" color="textMuted" style={styles.sectionLabel}>
                    {t("habit.on_day_of_month", { defaultValue: "On day of month" })}
                  </MyText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.monthdaysRow}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const isSelected = config.monthdays.includes(day);
                        return (
                          <Pressable
                            key={day}
                            onPress={() => {
                              const newMonthdays = isSelected
                                ? config.monthdays.filter((m) => m !== day)
                                : [...config.monthdays, day];
                              setConfig({ ...config, monthdays: newMonthdays.length > 0 ? newMonthdays : [day] });
                            }}
                            style={[
                              styles.monthdayButton,
                              {
                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                borderColor: isSelected ? colors.primary : colors.hover,
                              },
                            ]}
                          >
                            <MyText
                              variant="small"
                              weight="semi"
                              style={{ color: isSelected ? selectedTextColor : colors.text }}
                            >
                              {day}
                            </MyText>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              )}

              <View style={styles.section}>
                <MyText variant="small" color="textMuted" style={styles.sectionLabel}>
                  {t("habit.ends", { defaultValue: "Ends" })}
                </MyText>
                <View style={styles.endOptionsRow}>
                  {(["NEVER", "COUNT", "UNTIL"] as const).map((endType) => (
                    <Pressable
                      key={endType}
                      onPress={() => setConfig({ ...config, endType })}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: config.endType === endType ? colors.primary + "20" : colors.surface,
                          borderColor: config.endType === endType ? colors.primary : colors.hover,
                        },
                      ]}
                    >
                      <MyText
                        variant="small"
                        weight={config.endType === endType ? "semi" : "normal"}
                        style={{ color: config.endType === endType ? colors.primary : colors.text }}
                      >
                        {t(`habit.end_${endType.toLowerCase()}`, {
                          defaultValue: endType === "NEVER" ? "Never" : endType === "COUNT" ? "After count" : "On date",
                        })}
                      </MyText>
                    </Pressable>
                  ))}
                </View>

                {config.endType === "COUNT" && (
                  <View style={styles.countInput}>
                    <View style={{ width: 80 }}>
                      <MyInput
                        value={config.count?.toString() || "10"}
                        onChangeText={(text) => {
                          const num = parseInt(text, 10);
                          if (!isNaN(num) && num > 0) {
                            setConfig({ ...config, count: num });
                          }
                        }}
                        keyboardType="number-pad"
                        placeholder="10"
                      />
                    </View>
                    <MyText variant="body" style={{ marginLeft: 8 }}>
                      {t("habit.times", { defaultValue: "times" })}
                    </MyText>
                  </View>
                )}

                {config.endType === "UNTIL" && (
                  <View style={styles.untilInput}>
                    <DateTimeSelector
                      value={config.until || undefined}
                      onChange={(date) => setConfig({ ...config, until: date?.split("T")[0] || null })}
                      mode="date"
                      label=""
                      placeholder={t("habit.select_end_date", { defaultValue: "Select end date" })}
                    />
                  </View>
                )}
              </View>
            </ScrollView>
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
    marginBottom: 8,
    marginLeft: 4,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  preview: {
    marginTop: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  intervalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  intervalInput: {
    width: 60,
  },
  weekdaysRow: {
    flexDirection: "row",
    gap: 6,
  },
  weekdayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  monthdaysRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
  },
  monthdayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  endOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  countInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  untilInput: {
    marginTop: 8,
  },
});
