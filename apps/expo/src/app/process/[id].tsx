import { ScrollView, Text, View } from "react-native";
import Markdown from "react-native-markdown-renderer";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useSearchParams } from "expo-router";
import { useAtom } from "jotai";

import { api } from "../../utils/api";
import { tokenAtom } from "../../utils/store";

const Process = () => {
  const { id } = useSearchParams();
  if (!id) throw new Error("ID required for meal plan.");

  const [token] = useAtom(tokenAtom);

  const processQuery = api.process.openai.useQuery({
    token: token as string,
    planId: id,
  });

  return processQuery.data ? (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Recommendations" }} />
      <View className="w-full h-full px-4">
        <Text className="text-2xl font-bold">Recommendations</Text>
        <View className="mt-2">
          <ScrollView>
            {/** @ts-expect-error -- TODO: contribute to react-native-markdown-renderer typings  */}
            <Markdown>{processQuery.data}</Markdown>
            <View className="h-10" />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  ) : null;
};

export default Process;
