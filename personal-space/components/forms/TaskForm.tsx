import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useTasks } from "@/hooks/useTasks";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { DateTimeSelector } from "@/components/ui/DateTimeSelector";
import { TimeGoalSelector } from "@/components/ui/TimeGoalSelector";

interface TaskFormData {
  title: string;
  locationName: string;
  countGoal: string;
}

interface TaskFormProps {
  projectId: number;
  taskId?: number;
  onSave: () => void;
  onCancel: () => void;
}

const COMPLETITION_BY_COUNT = 1;
const COMPLETITION_BY_TIME = 2;

export const TaskForm: React.FC<TaskFormProps> = ({
  projectId,
  taskId,
  onSave,
  onCancel,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { createTask, updateTask, getTaskById } = useTasks();
  const [loading, setLoading] = useState(false);
  const [completitionBy, setCompletitionBy] = useState<number | undefined>(COMPLETITION_BY_COUNT);
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);
  const [timeGoalMinutes, setTimeGoalMinutes] = useState<number | undefined>(undefined);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      locationName: "",
      countGoal: "1",
    },
  });

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    if (!taskId) return;
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setValue("title", task.title);
        setValue("locationName", task.locationName || "");
        setValue("countGoal", task.countGoal?.toString() || "1");
        setDueDate(task.dueDate);
        setCompletitionBy(task.completitionBy);
        if (task.completitionBy === COMPLETITION_BY_TIME && task.countGoal) {
          setTimeGoalMinutes(task.countGoal);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    let finalCountGoal: number | undefined;

    if (completitionBy === COMPLETITION_BY_COUNT) {
      finalCountGoal = parseInt(data.countGoal, 10);
      if (isNaN(finalCountGoal) || finalCountGoal <= 0) {
        Alert.alert(t("common.error"), t("task.count_goal_required"));
        return;
      }
    } else if (completitionBy === COMPLETITION_BY_TIME) {
      if (!timeGoalMinutes || timeGoalMinutes <= 0) {
        Alert.alert(t("common.error"), t("task.time_goal_required"));
        return;
      }
      finalCountGoal = timeGoalMinutes;
    }

    setLoading(true);
    try {
      if (taskId) {
        await updateTask(taskId, {
          title: data.title,
          dueDate,
          locationName: data.locationName || undefined,
          completitionBy: completitionBy || undefined,
          countGoal: finalCountGoal,
        });
      } else {
        await createTask({
          projectId,
          title: data.title,
          dueDate,
          locationName: data.locationName || undefined,
          completitionBy: completitionBy || undefined,
          countGoal: finalCountGoal,
        });
      }
      onSave();
    } catch (error: any) {
      Alert.alert(t("common.error"), error.message || t("common.error_save"));
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
            required: t("task.title_required"),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("task.title_label")}
              placeholder={t("task.title_placeholder")}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />
      </View>

      <DateTimeSelector
        label={t("task.due_date_label")}
        value={dueDate}
        onChange={setDueDate}
        mode="date"
        placeholder={t("task.due_date_placeholder")}
      />

      <View style={styles.field}>
        <Controller
          control={control}
          name="locationName"
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("task.location_label")}
              placeholder={t("task.location_placeholder")}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <MyText variant="small" color="textMuted" style={styles.label}>
          {t("task.completion_by_label")}
        </MyText>
<View style={styles.completionOptions}>
          <MyButton
            title={t("task.executions_count")}
            variant={completitionBy === COMPLETITION_BY_COUNT ? "primary" : "ghost"}
            onPress={() => setCompletitionBy(COMPLETITION_BY_COUNT)}
          />
          <MyButton
            title={t("task.execution_time")}
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
                label={t("task.count_goal_label")}
                placeholder={t("task.count_goal_placeholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                keyboardType="number-pad"
                error={errors.countGoal ? t("task.count_goal_required") : undefined}
              />
            )}
          />
        </View>
      )}

      {completitionBy === COMPLETITION_BY_TIME && (
        <TimeGoalSelector
          label={t("task.time_goal_label")}
          value={timeGoalMinutes}
          onChange={setTimeGoalMinutes}
        />
      )}

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
