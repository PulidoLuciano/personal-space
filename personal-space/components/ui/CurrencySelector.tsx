import React, { useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Modal, FlatList, SafeAreaView } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";
import { CurrencyEntity } from "@/core/entities/CurrencyEntity";

interface CurrencySelectorProps {
  currencies: CurrencyEntity[];
  selectedCurrency: CurrencyEntity | null;
  onSelect: (currency: CurrencyEntity) => void;
  accentColor?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currencies,
  selectedCurrency,
  onSelect,
  accentColor,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();
  const activeColor = accentColor || colors.primary;
  const [modalVisible, setModalVisible] = useState(false);

  const uniqueCurrencies = useMemo(() => {
    const currencyMap = new Map<number, CurrencyEntity>();
    currencies.forEach((currency) => {
      if (currency.id && !currencyMap.has(currency.id)) {
        currencyMap.set(currency.id, currency);
      }
    });
    return Array.from(currencyMap.values());
  }, [currencies]);

  if (uniqueCurrencies.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <MyText color="textMuted">{t("finance.currency_required")}</MyText>
      </View>
    );
  }

  const handleSelect = (currency: CurrencyEntity) => {
    onSelect(currency);
    setModalVisible(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          styles.selector,
          {
            backgroundColor: colors.surface,
            borderColor: colors.hover,
          },
        ]}
      >
        <View style={styles.selectedContent}>
          <MyText variant="body" weight="semi" style={{ color: colors.text }}>
            {selectedCurrency?.symbol || t("common.select", { defaultValue: "Seleccionar" })}
          </MyText>
          <MyText variant="caption" style={{ color: colors.textMuted, marginLeft: 4 }}>
            {selectedCurrency?.name}
          </MyText>
        </View>
        <MyText variant="caption" style={{ color: colors.textMuted }}>▼</MyText>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <MyText variant="body" weight="bold">{t("finance.currency_label")}</MyText>
              <Pressable onPress={() => setModalVisible(false)}>
                <MyText variant="body" style={{ color: activeColor }}>✕</MyText>
              </Pressable>
            </View>
            <FlatList
              data={uniqueCurrencies}
              keyExtractor={(item) => item.id?.toString() || ""}
              renderItem={({ item }) => {
                const isSelected = selectedCurrency?.id === item.id;
                return (
                  <Pressable
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: isSelected ? activeColor + "15" : "transparent",
                        borderColor: isSelected ? activeColor : "transparent",
                      },
                    ]}
                  >
                    <MyText
                      variant="body"
                      weight={isSelected ? "semi" : "normal"}
                      style={{ color: isSelected ? activeColor : colors.text }}
                    >
                      {item.symbol}
                    </MyText>
                    <MyText
                      variant="caption"
                      style={{ color: isSelected ? activeColor : colors.textMuted, marginLeft: 8 }}
                    >
                      {item.name}
                    </MyText>
                  </Pressable>
                );
              }}
            />
          </SafeAreaView>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
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
  selectedContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: "70%",
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
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
    marginVertical: 2,
  },
});
