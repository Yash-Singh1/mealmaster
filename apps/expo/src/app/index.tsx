import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { api } from "../utils/api";
import { TOKEN } from "../utils/constants";
import { tokenAtom } from "../utils/store";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const [_, setToken] = useAtom(tokenAtom);

  const login = api.auth.login.useMutation({
    async onSuccess(data) {
      await SecureStore.setItemAsync(TOKEN, data.session);
      setEmail("");
      setPassword("");
      setToken(data.session);
    },
  });

  return (
    <SafeAreaView className="bg-[#fdfffc]">
      <Stack.Screen options={{ title: "MealMaster" }} />
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-4xl font-bold text-[#011627]">
          Welcome Back!
        </Text>
        <View className="mx-2 -z-10">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">Email</Text>
          <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
            <View className="mr-2">
              <FontAwesomeIcon icon="envelope" size={20} color="#011627" />
            </View>
            <TextInput
              className="text-[#011627] flex-grow"
              placeholder="Enter your email"
              placeholderTextColor="#01162750"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>
        <View className="mx-2 -z-10">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">
            Password
          </Text>
          <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
            <View className="mr-2">
              <FontAwesomeIcon icon="key" size={20} color="#011627" />
            </View>
            <TextInput
              className="text-[#011627] flex-grow"
              placeholder="Enter your password"
              placeholderTextColor="#01162750"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={() =>
            login.mutate({
              email,
              password,
            })
          }
          activeOpacity={0.5}
        >
          <Text
            style={{ width: Dimensions.get("screen").width - 48 }}
            className="uppercase w-full text-center bg-[#41EAD4] p-2 text-white mx-2 mt-4"
          >
            Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/signup")}
        >
          <Text className="text-[#011627] w-full text-center mt-4">
            Don&apos;t have an account? Signup.
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const Landing: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const selfQuery = api.user.self.useQuery({
    token: token as string,
  });

  const router = useRouter();

  return selfQuery.data ? (
    <SafeAreaView>
      <Stack.Screen options={{ title: "MealMaster" }} />
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-2xl font-bold text-[#011627]">
          Welcome {selfQuery.data.name}!
        </Text>
        <TouchableOpacity
          className="w-full my-2 py-2 bg-[#41EAD4] rounded-lg"
          activeOpacity={0.5}
          onPress={() => router.push("/meal-plans")}
        >
          <Text className="text-center text-lg">Meal Plans</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full my-2 py-2 bg-[#41EAD4] rounded-lg"
          activeOpacity={0.5}
          onPress={() => router.push("/recipe-search")}
        >
          <Text className="text-center text-lg">Recipe Search</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full my-2 py-2 bg-[#41EAD4] rounded-lg"
          activeOpacity={0.5}
          onPress={() => router.push("/schedule")}
        >
          <Text className="text-center text-lg">Schedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-full my-2 py-2 bg-[#41EAD4] rounded-lg"
          activeOpacity={0.5}
          onPress={() => router.push("/settings")}
        >
          <Text className="text-center text-lg">Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  ) : null;
};

const Index: React.FC = () => {
  const [token, setToken] = useAtom(tokenAtom);

  const verify = api.auth.verify.useQuery(
    {
      token: token as string,
    },
    {
      enabled: false,
      onError() {
        void SecureStore.deleteItemAsync(TOKEN);
      },
    },
  );

  useEffect(() => {
    if (token) {
      void verify.refetch();
    } else {
      async function setIt() {
        const newToken = await SecureStore.getItemAsync(TOKEN);
        setToken(newToken);
      }
      void setIt();
    }
  }, [token]);

  return verify.data ? <Landing /> : <Login />;
};

export default Index;
