import React, { useState } from "react";
import { View, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { Ionicons } from "@expo/vector-icons";
import { MyText } from "@/components/ui/MyText";
import { MyInput } from "@/components/ui/MyInput";
import { MyButton } from "@/components/ui/MyButton";
import { useDependencies } from "@/components/providers/DatabaseContext";
import { useCurrencies } from "@/hooks/useCurrencies";
import { CurrencyEntity } from "@/core/entities/CurrencyEntity";

export default function CreateFinanceExecutionModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useLocale();
  const controller = useDependencies();
  const { currencies } = useCurrencies();

  const { financeId, financeTitle, projectId } = useLocalSearchParams<{
    financeId: string;
    financeTitle?: string;
    projectId?: string;
  }>();

  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyEntity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (currencies.length > 0 && !selectedCurrency) {
      const defaultCurrency = currencies.find((c) => c.symbol === "ARS$");
      setSelectedCurrency(defaultCurrency || currencies[0]);
    }
  }, [currencies]);

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError(t("finance.amount_required"));
      return;
    }

    if (!selectedCurrency) {
      setError(t("finance.currency_required"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      await controller.createFinanceExecution.execute({
        financeId: parseInt(financeId),
        projectId: parseInt(projectId || "0"),
        date: new Date().toISOString(),
        amount: parsedAmount,
        currencyId: selectedCurrency.id!,
      });
      router.back();
    } catch (err: any) {
      setError(err.message || t("common.error_save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <NodusLayout useSafeArea={true}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <MyText variant="h2" weight="bold">
            {t("finance.add_execution", { defaultValue: "Agregar Ejecución" })}
          </MyText>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? colors.press : "transparent" },
            ]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
          {financeTitle && (
            <View style={[styles.financeInfo, { backgroundColor: colors.surface }]}>
              <MyText variant="caption" color="textMuted">
                {t("finance.for_finance", { defaultValue: "Para" })}
              </MyText>
              <MyText variant="body" weight="semi">
                {financeTitle}
              </MyText>
            </View>
          )}

          <View style={styles.field}>
            <MyInput
              label={t("finance.amount_label")}
              placeholder={t("finance.amount_placeholder")}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setError("");
              }}
              keyboardType="decimal-pad"
              error={error}
            />
          </View>

          <View style={styles.field}>
            <MyText variant="small" color="textMuted" style={styles.label}>
              {t("finance.currency_label").toUpperCase()}
            </MyText>
            {currencies.map((currency) => {
              const isSelected = selectedCurrency?.id === currency.id;
              return (
                <Pressable
                  key={currency.id}
                  onPress={() => setSelectedCurrency(currency)}
                  style={[
                    styles.currencyOption,
                    {
                      backgroundColor: isSelected ? colors.primary + "20" : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.hover,
                    },
                  ]}
                >
                  <MyText variant="body" weight={isSelected ? "semi" : "normal"} style={{ color: isSelected ? colors.primary : colors.text }}>
                    {currency.symbol}
                  </MyText>
                  <MyText variant="caption" style={{ color: colors.textMuted, marginLeft: 8 }}>
                    {currency.name}
                  </MyText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttons}>
            <View style={styles.buttonWrapper}>
              <MyButton
                title={t("common.cancel")}
                variant="ghost"
                onPress={() => router.back()}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <MyButton
                title={t("common.save")}
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </NodusLayout>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  financeInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
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
