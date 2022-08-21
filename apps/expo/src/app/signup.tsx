import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { api } from "../utils/api";
import { TOKEN } from "../utils/constants";
import { tokenAtom } from "../utils/store";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [height, setHeight] = useState("0");
  const [weight, setWeight] = useState("0");
  const [age, setAge] = useState("0");
  const [sportsDropdownOpen, setSportsDropdownOpen] = useState(false);
  const [sports, setSports] = useState<number | null>(null);

  const router = useRouter();

  const [_, setToken] = useAtom(tokenAtom);

  const register = api.auth.signup.useMutation({
    async onSuccess(data) {
      router.back();
      await SecureStore.setItemAsync(TOKEN, data.session);
      setEmail("");
      setPassword("");
      setToken(data.session);
    },
  });

  return (
    <SafeAreaView className="bg-[#fdfffc]">
      <Stack.Screen options={{ title: "Register" }} />
      <ScrollView className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-4xl font-bold text-[#011627]">
          Create Account
        </Text>
        <View className="mx-2 -z-10">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">Name</Text>
          <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
            <View className="mr-2">
              <FontAwesomeIcon icon="person" size={20} color="#011627" />
            </View>
            <TextInput
              className="text-[#011627] flex-grow"
              placeholder="Enter your name"
              placeholderTextColor="#01162750"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
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
              keyboardType="email-address"
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
        <View className="mx-2 -z-10">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">
            Height (cm)
          </Text>
          <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
            <View className="mr-2">
              <FontAwesomeIcon icon="ruler" size={20} color="#011627" />
            </View>
            <TextInput
              className="text-[#011627] flex-grow"
              placeholder="Enter your height"
              placeholderTextColor="#01162750"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />
          </View>
        </View>
        <View className="mx-2 -z-10">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">
            Weight (kg)
          </Text>
          <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
            <View className="mr-2">
              <FontAwesomeIcon icon="weight-scale" size={20} color="#011627" />
            </View>
            <TextInput
              className="text-[#011627] flex-grow"
              placeholder="Enter your weight"
              placeholderTextColor="#01162750"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>
        </View>
        <View className="mx-2 -z-10">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">Age</Text>
          <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
            <View className="mr-2">
              <FontAwesomeIcon icon="leaf" size={20} color="#011627" />
            </View>
            <TextInput
              className="text-[#011627] flex-grow"
              placeholder="Enter your age"
              placeholderTextColor="#01162750"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />
          </View>
        </View>
        <View className="z-10 mx-2">
          <Text className="text-gray-400/60 text-lg mt-4 uppercase">
            Activity
          </Text>
          <DropDownPicker
            open={sportsDropdownOpen}
            value={sports}
            items={[
              { label: "Inactive", value: 0 },
              { label: "Occasionaly Active", value: 1 },
              { label: "Active", value: 2 },
              { label: "Very Active", value: 3 },
              { label: "Proffesional Athlete", value: 4 },
            ]}
            placeholder="Activity Level"
            setOpen={setSportsDropdownOpen}
            setValue={setSports}
            autoScroll={false}
            scrollViewProps={{ scrollEnabled: false }}
          />
        </View>
        <TouchableOpacity
          onPress={() =>
            register.mutate({
              name,
              email,
              password,
              height: parseInt(height, 10),
              weight: parseInt(weight, 10),
              age: parseInt(age, 10),
              sports: sports as number,
            })
          }
          activeOpacity={0.5}
        >
          <Text
            style={{ width: Dimensions.get("screen").width - 48 }}
            className="uppercase w-full text-center bg-[#41EAD4] p-2 text-white mx-2 mt-4"
          >
            Register
          </Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.back()}>
          <Text className="text-[#011627] w-full text-center mt-4">
            Already have an account? Signin.
          </Text>
        </TouchableOpacity>
        <View className="mb-96"></View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Index;
