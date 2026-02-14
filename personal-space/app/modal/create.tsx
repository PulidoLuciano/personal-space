import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";

export default function CreateModal() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <NodusLayout useSafeArea={true}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Nuevo Elemento
        </Text>

        {/* Botón para cerrar el modal */}
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

      <View style={styles.content}>
        {/* Aquí irá el formulario de creación rápida */}
        <Text style={{ color: colors.textMuted, textAlign: "center" }}>
          El contenido del modal aparecerá aquí.
        </Text>
      </View>
    </NodusLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
