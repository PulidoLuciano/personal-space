import { MyText } from "@/components/ui/MyText";
import { MyButton } from "@/components/ui/MyButton";
import { NodusLayout } from "@/components/ui/NodusLayout";
import { MyInput } from "@/components/ui/MyInput";

export default function HomeScreen() {
  return (
    <NodusLayout>
      <MyText variant="h1">Title 1</MyText>
      <MyText variant="h2">Title 2</MyText>
      <MyText variant="body">Body text</MyText>
      <MyText variant="body" weight="bold">
        Body text
      </MyText>
      <MyText variant="body" weight="semi">
        Body text
      </MyText>
      <MyText variant="caption">Caption text</MyText>
      <MyText variant="small">Small text</MyText>
      <MyInput label="Esto es prueba" />
      <MyInput label="Esto es prueba" error="Esto es un error de campo" />
      <MyButton title="Okay" onPress={() => {}} />
      <MyButton title="Okay" onPress={() => {}} variant="secondary" />
      <MyButton title="Okay" onPress={() => {}} variant="danger" />
      <MyButton title="Okay" onPress={() => {}} variant="ghost" />
      <MyButton title="Okay" onPress={() => {}} loading={true} />
      <MyButton title="Okay" onPress={() => {}} disabled={true} />
    </NodusLayout>
  );
}
