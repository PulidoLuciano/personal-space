import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useLocale } from "@/hooks/useLocale";
import { MyText } from "./MyText";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  const { colors } = useTheme();
  const { t } = useLocale();

  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handlePrev}
        disabled={currentPage <= 1}
        style={[
          styles.button,
          {
            backgroundColor: currentPage <= 1 ? colors.hover : colors.surface,
            opacity: currentPage <= 1 ? 0.5 : 1,
          },
        ]}
      >
        <MyText variant="body" style={{ color: currentPage <= 1 ? colors.textMuted : colors.text }}>
          ← {t("common.previous", { defaultValue: "Anterior" })}
        </MyText>
      </Pressable>

      <View style={styles.pageInfo}>
        <MyText variant="caption" color="textMuted">
          {currentPage} / {totalPages}
        </MyText>
        {totalItems !== undefined && (
          <MyText variant="caption" color="textMuted" style={{ marginLeft: 8 }}>
            ({totalItems} {t("common.items", { defaultValue: "elementos" })})
          </MyText>
        )}
      </View>

      <Pressable
        onPress={handleNext}
        disabled={currentPage >= totalPages}
        style={[
          styles.button,
          {
            backgroundColor: currentPage >= totalPages ? colors.hover : colors.surface,
            opacity: currentPage >= totalPages ? 0.5 : 1,
          },
        ]}
      >
        <MyText variant="body" style={{ color: currentPage >= totalPages ? colors.textMuted : colors.text }}>
          {t("common.next", { defaultValue: "Siguiente" })} →
        </MyText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  pageInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
});
