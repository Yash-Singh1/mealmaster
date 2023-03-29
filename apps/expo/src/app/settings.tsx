import { useCallback, useEffect, useState } from "react";
import { Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { useAtom } from "jotai";

import { api } from "../utils/api";
import { getPushToken } from "../utils/getPushToken";
import { tokenAtom } from "../utils/store";

// Plan for settings page:
// - Change password
// - Modify all other user fields
// - Delete account
// - Logout
// - Enable/disable notifications

const Settings: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const [isEnabled, setIsEnabled] = useState(false);

  const register = api.device.register.useMutation();

  const unregister = api.device.unregister.useMutation();

  const [pushToken, setPushToken] = useState<string | null>(null);
  const devicePresent = api.device.exists.useQuery(
    {
      device: pushToken as string,
      token: token as string,
    },
    {
      enabled: false,
      onSuccess(data) {
        setIsEnabled(data);
      },
    },
  );

  useEffect(() => {
    async function pushTokenWork() {
      const newPushToken = await getPushToken(/* greedy = */ false);
      if (newPushToken) {
        setPushToken(newPushToken);
        await devicePresent.refetch();
      } else {
        setIsEnabled(false);
      }
    }
    void pushTokenWork();
  }, []);

  const toggleSwitch = useCallback(async () => {
    const pushToken = await getPushToken(true);
    if (!pushToken) {
      setIsEnabled(false);
      return;
    }
    if (!isEnabled) {
      register.mutate({
        token: token as string,
        device: pushToken,
      });
    } else {
      unregister.mutate({
        token: token as string,
        device: pushToken,
      });
    }
    setIsEnabled((previousState) => !previousState);
  }, [isEnabled]);

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Settings" }} />
      <View className="w-full h-full">
        <Text className="pb-2 text-3xl font-bold text-[#011627] px-4">
          Settings
        </Text>
        <View className="mt-2 w-full">
          <View className="w-full flex flex-row justify-between px-4">
            <Text className="text-lg font-base text-[#011627]">
              Notifications
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor="#f4f3f4"
              ios_backgroundColor="#3e3e3e"
              value={isEnabled}
              onValueChange={toggleSwitch}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
