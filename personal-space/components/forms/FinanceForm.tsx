import React, { useEffect, useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useFinances } from "@/hooks/useFinances";
import { useCurrencies } from "@/hooks/useCurrencies";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import { CurrencyEntity } from "@/core/entities/CurrencyEntity";

interface FinanceFormData {
  title: string;
  amount: string;
}

interface FinanceFormProps {
  projectId: number;
  taskId?: number;
  eventId?: number;
  habitId?: number;
  financeId?: number;
  onSave: () => void;
  onCancel: () => void;
}

export const FinanceForm: React.FC<FinanceFormProps> = ({
  projectId,
  taskId,
  eventId,
  habitId,
  financeId,
  onSave,
  onCancel,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const { createFinance, updateFinance, getFinanceById } = useFinances();
  const { currencies } = useCurrencies();
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEntity | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FinanceFormData>({
    defaultValues: {
      title: "",
      amount: "",
    },
  });

  useEffect(() => {
    if (financeId) {
      loadFinance();
    }
  }, [financeId]);

  useEffect(() => {
    if (currencies.length > 0 && !selectedCurrency) {
      const defaultCurrency = currencies.find((c) => c.symbol === "ARS$");
      setSelectedCurrency(defaultCurrency || currencies[0]);
    }
  }, [currencies]);

  const loadFinance = async () => {
    if (!financeId) return;
    try {
      const finance = await getFinanceById(financeId);
      if (finance) {
        setValue("title", finance.title);
        setValue("amount", finance.amount.toString());
        const currency = currencies.find((c) => c.id === finance.currencyId);
        if (currency) {
          setSelectedCurrency(currency);
        }
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("common.error_save"));
    }
  };

  const onSubmit = async (data: FinanceFormData) => {
    if (!selectedCurrency) {
      Alert.alert(t("common.error"), t("finance.currency_required"));
      return;
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t("common.error"), t("finance.amount_required"));
      return;
    }

    setLoading(true);
    try {
      if (financeId) {
        await updateFinance(financeId, {
          title: data.title,
          amount,
          currencyId: selectedCurrency.id!,
        });
      } else {
        await createFinance({
          projectId,
          title: data.title,
          amount,
          currencyId: selectedCurrency.id!,
          taskId,
          eventId,
          habitId,
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
            required: t("finance.title_required"),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <MyInput
              label={t("finance.title_label")}
              placeholder={t("finance.title_placeholder")}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.title?.message}
            />
          )}
        />
      </View>

      <View style={styles.field}>
        <Controller
          control={control}
          name="amount"
          rules={{
            required: t("finance.amount_required"),
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <MyInput
                label={t("finance.amount_label")}
                placeholder={t("finance.amount_placeholder")}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.amount?.message}
                keyboardType="decimal-pad"
              />
              <MyText variant="caption" color="textMuted" style={styles.amountHint}>
                {t("finance.amount_hint", { defaultValue: "Los valores negativos son para gastos" })}
              </MyText>
            </View>
          )}
        />
      </View>

      <View style={styles.field}>
        <MyText variant="small" color="textMuted" style={styles.label}>
          {t("finance.currency_label").toUpperCase()}
        </MyText>
        <CurrencySelector
          currencies={currencies}
          selectedCurrency={selectedCurrency}
          onSelect={setSelectedCurrency}
          accentColor={colors.primary}
        />
      </View>

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
  amountHint: {
    marginTop: 4,
    marginLeft: 4,
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
