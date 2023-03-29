import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import { api } from "../utils/api";
import { tokenAtom } from "../utils/store";

const Schedule: React.FC = () => {
  const [token] = useAtom(tokenAtom);
  const reminders = api.schedule.getAll.useQuery({
    token: token as string,
  });

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Schedule" }} />
      <View className="w-full h-full px-4">
        <Text className="text-2xl font-bold text-[#011627]">
          Schedule Meals
        </Text>
        <TouchableOpacity
          onPress={() => {
            // newReminder.mutate();
          }}
          activeOpacity={0.5}
        >
          <Text
            style={{ width: Dimensions.get("screen").width - 48 }}
            className="uppercase w-full text-center bg-[#41EAD4] p-2 text-white mx-2 mt-4"
          >
            Create Reminder
          </Text>
        </TouchableOpacity>
        {reminders.data && reminders.data.length ? null : <Text className="text-base mt-2 w-full text-center">No reminders set</Text>}
        <View className="mt-2">
          {reminders.data?.map((reminder, index) => {
            return <Text key={index}>{reminder.title}</Text>;
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Schedule;
