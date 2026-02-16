import React, { useState, useEffect, useMemo } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { useCurrentProject } from "@/components/providers/ProjectContext";
import { MyText } from "@/components/ui/MyText";
import { Pagination } from "@/components/ui/Pagination";
import { useProjectFinances } from "@/hooks/useProjectFinances";
import { useFinanceExecutions } from "@/hooks/useFinanceExecutions";
import { useProjectTotalAmount } from "@/hooks/useProjectTotalAmount";
import { useFinances } from "@/hooks/useFinances";
import { useCurrencies } from "@/hooks/useCurrencies";
import { FinanceEntity } from "@/core/entities/FinanceEntity";
import { Ionicons } from "@expo/vector-icons";

const PAGE_SIZE = 10;

export default function FinancesScreen() {
  const router = useRouter();
  const { projectId } = useCurrentProject();
  const { colors } = useTheme();
  const { t } = useLocale();
  const { deleteFinance, createFinanceExecution } = useFinances();
  const { currencies } = useCurrencies();

  const [page, setPage] = useState(1);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number | undefined>(undefined);

  const projectIdNum = projectId ? parseInt(projectId) : 0;

  const { total, loading: loadingTotal, refresh: refreshTotal } = useProjectTotalAmount(projectIdNum, selectedCurrencyId);
  const { finances, loading: loadingFinances, refresh: refreshFinances } = useProjectFinances(projectIdNum);
  const { executions, total: totalExecutions, totalPages, loading: loadingExecutions, refresh: refreshExecutions } = useFinanceExecutions(projectIdNum, page, PAGE_SIZE);

  const availableCurrencies = useMemo(() => {
    const ids = new Set<number>();
    executions.forEach(e => ids.add(e.currency_id));
    finances.forEach(f => ids.add(f.currencyId));
    return currencies.filter(c => ids.has(c.id!));
  }, [currencies, executions, finances]);

  const selectedCurrency = useMemo(() => {
    if (selectedCurrencyId === undefined) return null;
    return currencies.find(c => c.id === selectedCurrencyId);
  }, [currencies, selectedCurrencyId]);

  const isPositive = total >= 0;

  const handleDeleteFinance = (finance: FinanceEntity) => {
    Alert.alert(
      t("finance.delete_title"),
      t("finance.delete_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFinance(finance.id!);
              refreshFinances();
              refreshTotal();
            } catch (err) {
              Alert.alert(t("common.error"), t("common.error_save"));
            }
          },
        },
      ]
    );
  };

  const handleAddExecution = async (finance: FinanceEntity) => {
    try {
      await createFinanceExecution({
        financeId: finance.id!,
        projectId: projectIdNum,
        date: new Date().toISOString(),
        amount: finance.amount,
        currencyId: finance.currencyId,
      });
      refreshAll();
    } catch (err) {
      Alert.alert(t("common.error"), t("common.error_save"));
    }
  };

  const handleEditFinance = (finance: FinanceEntity) => {
    const params = new URLSearchParams();
    params.set("projectId", projectId || "");
    params.set("financeId", finance.id?.toString() || "");
    router.push(`/modal/create?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getCurrencySymbol = (currencyId: number) => {
    const currency = currencies.find((c) => c.id === currencyId);
    return currency?.symbol || "$";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, { 
      dateStyle: "short", 
      timeStyle: "short" 
    });
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const refreshAll = () => {
    refreshFinances();
    refreshTotal();
    refreshExecutions();
  };

  useEffect(() => {
    refreshAll();
    if (availableCurrencies.length > 0 && selectedCurrencyId === undefined) {
      setSelectedCurrencyId(availableCurrencies[0].id);
    }
  }, [projectId]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.totalCard, { backgroundColor: isPositive ? "#22C55E20" : "#EF444420" }]}>
        <View style={styles.totalHeader}>
          <MyText variant="caption" color="textMuted">
            {t("finance.total_label")}
          </MyText>
          <Pressable
            onPress={() => {
              if (availableCurrencies.length === 0) return;
              const currentIndex = availableCurrencies.findIndex(c => c.id === selectedCurrencyId);
              const nextIndex = (currentIndex + 1) % availableCurrencies.length;
              setSelectedCurrencyId(availableCurrencies[nextIndex].id);
            }}
            style={[styles.currencySelector, { backgroundColor: colors.surface }]}
          >
            <MyText variant="caption" weight="semi">
              {selectedCurrency?.symbol || "-"}
            </MyText>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        </View>
        <MyText variant="h1" weight="bold" style={{ color: isPositive ? "#22C55E" : "#EF4444" }}>
          {isPositive ? "+" : "-"}{selectedCurrency?.symbol || "$"}{formatAmount(Math.abs(total))}
        </MyText>
      </View>

      <View style={styles.section}>
        <MyText variant="h2" weight="semi" style={styles.sectionTitle}>
          {t("finance.independent_label")}
        </MyText>

        {loadingFinances ? (
          <ActivityIndicator color={colors.primary} />
        ) : finances.length === 0 ? (
          <View style={styles.emptyState}>
            <MyText variant="body" color="textMuted">
              {t("finance.no_finances")}
            </MyText>
          </View>
        ) : (
          finances.map((finance) => (
            <View key={finance.id} style={[styles.financeCard, { backgroundColor: colors.surface }]}>
              <View style={styles.financeInfo}>
                <MyText variant="body" weight="semi">
                  {finance.title}
                </MyText>
                <MyText variant="caption" color="textMuted">
                  {getCurrencySymbol(finance.currencyId)} {formatAmount(finance.amount)}
                </MyText>
              </View>
              <View style={styles.financeActions}>
                <Pressable
                  onPress={() => handleAddExecution(finance)}
                  style={[styles.actionButton, { backgroundColor: colors.primary + "20" }]}
                >
                  <Ionicons name="add-circle" size={20} color={colors.primary} />
                </Pressable>
                <Pressable
                  onPress={() => handleEditFinance(finance)}
                  style={[styles.actionButton, { backgroundColor: colors.hover }]}
                >
                  <Ionicons name="pencil" size={18} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() => handleDeleteFinance(finance)}
                  style={[styles.actionButton, { backgroundColor: "#EF444420" }]}
                >
                  <Ionicons name="trash" size={18} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <MyText variant="h2" weight="semi" style={styles.sectionTitle}>
          {t("finance.executions_label")}
        </MyText>

        {loadingExecutions ? (
          <ActivityIndicator color={colors.primary} />
        ) : executions.length === 0 ? (
          <View style={styles.emptyState}>
            <MyText variant="body" color="textMuted">
              {t("finance.no_executions")}
            </MyText>
          </View>
        ) : (
          <>
            {executions.map((execution) => (
              <View key={execution.id} style={[styles.executionCard, { backgroundColor: colors.surface }]}>
                <View style={styles.executionInfo}>
                  <View style={styles.executionMain}>
                    <MyText variant="body" weight="semi">
                      {getCurrencySymbol(execution.currency_id)} {formatAmount(execution.amount)}
                    </MyText>
                    <MyText variant="caption" color="textMuted">
                      {execution.task_title || execution.finance_title}
                    </MyText>
                  </View>
                  <MyText variant="caption" color="textMuted">
                    {formatDateTime(execution.date)}
                  </MyText>
                </View>
              </View>
            ))}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalExecutions}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  totalCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  totalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  financeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  financeInfo: {
    flex: 1,
  },
  financeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  executionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  executionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  executionMain: {
    flex: 1,
  },
});
