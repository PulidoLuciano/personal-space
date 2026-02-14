import { NodusLayout } from "@/components/ui/NodusLayout";
import { useLocale } from "@/hooks/useLocale";
import { Text } from "react-native";

export default function DataScreen() {
  const { t } = useLocale();

  return (
    <NodusLayout>
      <Text>{t("tabs.data")}</Text>
    </NodusLayout>
  );
}
