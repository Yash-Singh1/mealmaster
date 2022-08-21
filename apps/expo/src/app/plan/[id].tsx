import { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useRouter, useSearchParams } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { api } from "../../utils/api";
import { tokenAtom } from "../../utils/store";

const Plan: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const { id } = useSearchParams();
  if (!id) throw new Error("ID required for meal plan.");

  const planQuery = api.plans.byId.useQuery({
    id: id as string,
    token: token as string,
  });

  const [newMealModal, setNewMealModal] = useState(false);
  const [search, setSearch] = useState("");
  const [typeAheadEnabled, setTypeAheadEnabled] = useState(false);
  const [servings, setServings] = useState('100');

  const { data: typeAheadData } = useQuery<string[]>({
    queryKey: ["typeahead", search],
    queryFn: () =>
      fetch(
        "https://api.edamam.com/auto-complete?app_id=972ce640&app_key=7525888fe50aa6df3194651b5a9c3579&q=" +
          search,
      ).then((res) => res.json()),
    enabled: typeAheadEnabled,
  });

  const inputRef = useRef<TextInput>(null);

  const util = api.useContext();
  const createMeal = api.plans.createMeal.useMutation({
    async onSuccess() {
      await util.plans.invalidate();
      setNewMealModal(false);
      setTypeAheadEnabled(false);
      setServings('100');
      setSearch("");
    },
  });

  const router = useRouter();

  return planQuery.data ? (
    <SafeAreaView>
      <Stack.Screen options={{ title: planQuery.data.name }} />
      <View className="h-full w-full p-4">
        <View className="flex flex-row gap-x-2 flex-nowrap items-center">
          <Text className="py-2 text-2xl font-bold">
            Meal Plan - {planQuery.data.name}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(`/process/${id}`)}
            className="bg-blue-500/80 p-2 rounded-full"
          >
            <FontAwesomeIcon icon="microchip" size={25} color="white" />
          </TouchableOpacity>
        </View>
        <ScrollView className="flex flex-wrap gap-y-4">
          {planQuery.data.meals.map((meal) => {
            return (
              <View
                className="flex flex-row flex-nowrap gap-x-4 items-center mx-1 p-4 bg-gray-600/10 rounded-lg"
                key={meal.id}
              >
                <Image
                  // @ts-expect-error -- width highlighted by ts? check react-native typing options
                  width={100}
                  height={100}
                  className="rounded-lg"
                  source={{ uri: meal.image }}
                  alt={meal.name}
                />
                <View className="flex flex-wrap justify-center">
                  <View className="flex flex-row items-center">
                    <Text className="text-lg">{meal.name}</Text>
                    <View
                      style={{ height: 24 }}
                      className="ml-1 px-1 bg-yellow-400 rounded-lg"
                    >
                      <Text className="text-sm font-semibold">
                        Calories: {meal.calories}
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
                        {meal.protein}g
                      </Text>
                      <Text className="text-sm font-semibold">
                        {meal.carbs}g
                      </Text>
                      <Text className="text-sm font-semibold">{meal.fat}g</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View className="w-full flex items-end">
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setNewMealModal(true)}
            className="bg-blue-400 p-3 rounded-full"
          >
            <FontAwesomeIcon icon="plus" color="white" size={25} />
          </TouchableOpacity>
        </View>
        <Modal visible={newMealModal} transparent={true} animationType="slide">
          <SafeAreaView className="w-full h-full flex justify-end items-center">
            <View className="h-3/4 w-[98%] rounded-t-lg border border-slate-400/50 bg-white shadow-lg">
              <View className="flex flex-wrap gap-y-4">
                <View className="w-full flex items-end">
                  <TouchableOpacity
                    className="pt-4 pr-4"
                    onPress={() => setNewMealModal(false)}
                  >
                    <FontAwesomeIcon icon="xmark" />
                  </TouchableOpacity>
                </View>
                <View className="px-4 flex-grow flex flex-wrap">
                  <View
                    style={{
                      width: Dimensions.get("screen").width * 0.98 - 32,
                    }}
                    className="flex justify-center px-2 w-full border-slate-400/50 border rounded-lg"
                  >
                    <TextInput
                      className="text-[#011627] text-base h-14 w-full"
                      placeholder="Search for a food"
                      placeholderTextColor="#01162750"
                      value={search}
                      onChangeText={(value) => {
                        setTypeAheadEnabled(true);
                        setSearch(value);
                      }}
                      onFocus={() => {
                        setTypeAheadEnabled(true);
                      }}
                      onBlur={() => {
                        setTypeAheadEnabled(false);
                      }}
                      ref={inputRef}
                    />
                    {typeAheadData &&
                    typeAheadEnabled &&
                    typeAheadData.length ? (
                      <View
                        className={`flex border-slate-400/50 py-2 border-t`}
                      >
                        {typeAheadData.map((item, index) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() => {
                                setSearch(item);
                                setTypeAheadEnabled(false);
                                inputRef.current?.blur();
                              }}
                              activeOpacity={0.8}
                              className="text-lg"
                            >
                              <Text>{item}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ) : null}
                  </View>

                  <View className="mx-2 -z-10">
                    <Text className="text-gray-400/60 text-lg mt-4 uppercase">
                      Grams
                    </Text>
                    <View className="mt-1 mb-1 p-2 flex flex-row items-center border-gray-400/40 border rounded">
                      <View className="mr-2">
                        <FontAwesomeIcon
                          icon="spoon"
                          size={20}
                          color="#011627"
                        />
                      </View>
                      <TextInput
                        className="text-[#011627] flex-grow"
                        placeholder="Enter your servings"
                        placeholderTextColor="#01162750"
                        keyboardType="numeric"
                        value={servings}
                        onChangeText={setServings}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      createMeal.mutate({
                        planId: planQuery.data.id,
                        name: search,
                        token: token as string,
                        servings: parseInt(servings, 10),
                      })
                    }
                    activeOpacity={0.5}
                  >
                    <Text
                      style={{ width: Dimensions.get("screen").width - 48 }}
                      className="uppercase w-full text-center bg-[#41EAD4] p-2 text-white mx-2 mt-4"
                    >
                      Create
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  ) : null;
};

export default Plan;
