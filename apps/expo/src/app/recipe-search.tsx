import { useState } from "react";
import {
  Dimensions,
  Image,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { api } from "../utils/api";
import { tokenAtom } from "../utils/store";

const RecipeSearch = () => {
  const [search, setSearch] = useState("");

  const [token] = useAtom(tokenAtom);

  const searchQuery = api.search.search.useQuery(
    {
      token: token as string,
      query: search,
    },
    {
      enabled: false,
    },
  );

  return (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Recipe Search" }} />
      <View className="w-full h-full px-4">
        <View className="flex flex-row flex-nowrap z-10 bg-white">
          <TextInput
            className="text-[#011627] border border-r-0 border-slate-400/50 rounded-l-lg p-2 flex-grow"
            placeholder="Search for a recipe"
            placeholderTextColor="#01162750"
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              void searchQuery.refetch();
            }}
            className="border border-l-0 border-slate-400/50 rounded-r-lg p-2 bg-blue-400"
          >
            <FontAwesomeIcon icon="magnifying-glass" color="white" />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex flex-wrap gap-y-4 mt-4">
          {searchQuery.data &&
            searchQuery.data.map((recipe) => {
              return (
                <TouchableOpacity
                  onPress={() => void Linking.openURL(recipe.url)}
                  activeOpacity={0.8}
                  style={{ width: Dimensions.get("screen").width - 40 }}
                  className="flex flex-row flex-nowrap gap-x-4 items-center mx-1 bg-gray-600/10 rounded-lg"
                  key={recipe.id}
                >
                  <Image
                    // @ts-expect-error -- width highlighted by ts? check react-native typing options
                    width={100}
                    height={100}
                    className="rounded-lg"
                    source={{ uri: recipe.image }}
                    alt={recipe.name}
                  />
                  <View className="flex flex-wrap justify-center flex-grow">
                    <View className="flex flex-row flex-wrap gap-x-1 items-center w-[90%]">
                      {recipe.name.split(" ").map((word, index) => (
                        <Text className="text-lg" key={index}>
                          {word}
                        </Text>
                      ))}
                      <View
                        style={{ height: 24 }}
                        className="px-1 bg-yellow-400 rounded-lg"
                      >
                        <Text className="text-sm font-semibold">
                          Calories: {recipe.calories}
                        </Text>
                      </View>
                    </View>
                    <View className="flex flex-row gap-x-4">
                      <View>
                        <View className="flex flex-row items-center gap-x-1">
                          <View className="w-[14px] h-[14px] rounded-full bg-green-400" />
                          <Text className="text-sm">Proteins</Text>
                        </View>
                        <View className="flex flex-row items-center gap-x-1">
                          <View className="w-[14px] h-[14px] rounded-full bg-blue-400" />
                          <Text className="text-sm">Carbs</Text>
                        </View>
                        <View className="flex flex-row items-center gap-x-1">
                          <View className="w-[14px] h-[14px] rounded-full bg-red-400" />
                          <Text className="text-sm">Fat</Text>
                        </View>
                      </View>
                      <View>
                        <Text className="text-sm font-semibold">
                          {recipe.protein}g
                        </Text>
                        <Text className="text-sm font-semibold">
                          {recipe.carbs}g
                        </Text>
                        <Text className="text-sm font-semibold">
                          {recipe.fat}g
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          <View className="h-10" />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default RecipeSearch;
