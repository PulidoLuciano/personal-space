import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useHabits } from "@/hooks/useHabits";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { DateTimeSelector } from "@/components/ui/DateTimeSelector";
import { TimeGoalSelector } from "@/components/ui/TimeGoalSelector";
import { BooleanSelector } from "@/components/ui/BooleanSelector";
import { RRuleSelector } from "@/components/ui/RRuleSelector";

interface HabitFormData {
  title: string;
  locationName: string;
  countGoal: string;
}

interface HabitFormProps {
  projectId: number;
  habitId?: number;
  onSave: () => void;
  onCancel: () => void;
}

const COMPLETITION_BY_COUNT = 1;
const COMPLETITION_BY_TIME = 2;

export const HabitForm: React.FC<HabitFormProps> = ({
  projectId,
  habitId,
  onSave,
  onCancel,
}) => {
  const { t } = useLocale();
  const { createHabit, updateHabit, getHabitById } = useHabits();
  const [loading, setLoading] = useState(false);
  const [isStrict, setIsStrict] = useState(false);
  const [completitionBy, setCompletitionBy] = useState<number | undefined>(COMPLETITION_BY_COUNT);
  const [beginAt, setBeginAt] = useState<string | undefined>(undefined);
  const [dueMinutes, setDueMinutes] = useState<number | undefined>(undefined);
  const [recurrenceRule, setRecurrenceRule] = useState<string>("");

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<HabitFormData>({
    defaultValues: {
      title: "",
      locationName: "",
      countGoal: "1",
    },
  });

  useEffect(() => {
    if (habitId) {
      loadHabit();
    }
  }, [habitId]);

  const loadHabit = async () => {
    if (!habitId) return;
    try {
      const habit = await getHabitById(habitId);
      if (habit) {
        setValue("title", habit.title);
        setValue("locationName", habit.locationName || "");
        setValue("countGoal", habit.countGoal?.toString() || "1");
        setIsStrict(habit.isStrict);
        setBeginAt(habit.beginAt);
        setDueMinutes(habit.dueMinutes);
        setRecurrenceRule(habit.recurrenceRule || "");
        setCompletitionBy(habit.completitionBy);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: HabitFormData) => {
    let finalCountGoal: number | undefined;

    if (completitionBy === COMPLETITION_BY_COUNT) {
      finalCountGoal = parseInt(data.countGoal, 10);
      if (isNaN(finalCountGoal) || finalCountGoal <= 0) {
        Alert.alert(t("common.error"), t("habit.count_goal_required"));
        return;
      }
    } else if (completitionBy === COMPLETITION_BY_TIME) {
      if (!dueMinutes || dueMinutes <= 0) {
        Alert.alert(t("common.error"), t("habit.time_goal_required"));
        return;
      }
      finalCountGoal = dueMinutes;
    }

    if (!recurrenceRule) {
      Alert.alert(t("common.error"), t("habit.recurrence_required"));
      return;
    }

    setLoading(true);
    try {
      if (habitId) {
        await updateHabit(habitId, {
          title: data.title,
          isStrict,
          dueMinutes,
          locationName: data.locationName || undefined,
          completitionBy: completitionBy || undefined,
          countGoal: finalCountGoal,
          beginAt: beginAt || undefined,
          recurrenceRule,
        });
      } else {
        await createHabit({
          projectId,
          title: data.title,
          isStrict,
          dueMinutes,
          locationName: data.locationName || undefined,
          completitionBy: completitionBy || undefined,
          countGoal: finalCountGoal,
          beginAt: beginAt || undefined,
          recurrenceRule,
        });
      }
      onSave();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("common.error_save");
      Alert.alert(t("common.error"), errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Controller
          control={control}
          name="title"
          rules={{
            required: t("habit.title_required"),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("habit.title_label")}
              placeholder={t("habit.title_placeholder")}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />
      </View>

      <BooleanSelector
        label={t("habit.is_strict_label")}
        helperText={t("habit.is_strict_helper")}
        value={isStrict}
        onChange={setIsStrict}
      />

      <TimeGoalSelector
        label={t("habit.due_time_label")}
        value={dueMinutes}
        onChange={setDueMinutes}
        helperText={t("task.habit_due_time_helper")}
      />

      <DateTimeSelector
        label={t("habit.begin_at_label")}
        value={beginAt}
        onChange={setBeginAt}
        mode="date"
        placeholder={t("habit.begin_at_placeholder")}
      />

      <View style={styles.field}>
        <Controller
          control={control}
          name="locationName"
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("habit.location_label")}
              placeholder={t("habit.location_placeholder")}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <MyText variant="small" color="textMuted" style={styles.label}>
          {t("habit.completion_by_label")}
        </MyText>
        <View style={styles.completionOptions}>
          <MyButton
            title={t("habit.executions_count")}
            variant={completitionBy === COMPLETITION_BY_COUNT ? "primary" : "ghost"}
            onPress={() => setCompletitionBy(COMPLETITION_BY_COUNT)}
          />
          <MyButton
            title={t("habit.execution_time")}
            variant={completitionBy === COMPLETITION_BY_TIME ? "primary" : "ghost"}
            onPress={() => setCompletitionBy(COMPLETITION_BY_TIME)}
          />
        </View>
      </View>

      {completitionBy === COMPLETITION_BY_COUNT && (
        <View style={styles.field}>
          <Controller
            control={control}
            name="countGoal"
            rules={{
              required: true,
              min: 1,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <MyInput
                label={t("habit.count_goal_label")}
                placeholder={t("habit.count_goal_placeholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="number-pad"
                error={errors.countGoal ? t("habit.count_goal_required") : undefined}
              />
            )}
          />
        </View>
      )}

      {completitionBy === COMPLETITION_BY_TIME && (
        <TimeGoalSelector
          label={t("task.time_goal_label")}
          value={dueMinutes}
          onChange={setDueMinutes}
        />
      )}

      <RRuleSelector
        label={t("habit.recurrence_label")}
        value={recurrenceRule}
        onChange={setRecurrenceRule}
      />

      <View style={styles.buttons}>
        <View style={styles.buttonWrapper}>
          <MyButton
            title={t("common.cancel")}
            variant="ghost"
            onPress={onCancel}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <MyButton
            title={t("common.save")}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  completionOptions: {
    flexDirection: "row",
    gap: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
  },
  buttonWrapper: {
    flex: 1,
  },
});
