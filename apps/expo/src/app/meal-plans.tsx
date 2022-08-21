import { useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useAtom } from "jotai";

import { api } from "../utils/api";
import { tokenAtom } from "../utils/store";

const MealPlans: React.FC = () => {
  const [token] = useAtom(tokenAtom);

  const mealPlans = api.plans.self.useQuery({
    token: token as string,
  });

  const [newPlanModal, setNewPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");

  const router = useRouter();

  const util = api.useContext();
  const createPlan = api.plans.createPlan.useMutation({
    onSuccess() {
      void util.plans.invalidate();
      setNewPlanModal(false);
      setNewPlanName("");
    },
  });

  return mealPlans.data ? (
    <SafeAreaView>
      <Stack.Screen options={{ title: "Meal Plans" }} />
      <View className="w-full h-full">
        <Text className="pb-2 mb-4 px-4 text-3xl font-bold text-[#011627]">
          Meal Plans
        </Text>
        <ScrollView className="flex px-4">
          <View className="flex flex-wrap gap-y-4">
            {mealPlans.data.mealPlans.map((plan) => {
              return (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => router.push(`/plan/${plan.id}`)}
                  activeOpacity={0.5}
                  className="bg-[#41EAD4] p-2 w-full rounded-lg"
                >
                  <Text className="text-lg text-[#011627] font-semibold">
                    {plan.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
        <View className="w-full flex items-end p-4">
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setNewPlanModal(true)}
            className="bg-blue-400 p-3 rounded-full"
          >
            <FontAwesomeIcon icon="plus" color="white" size={25} />
          </TouchableOpacity>
        </View>
        <Modal visible={newPlanModal} transparent={true} animationType="slide">
          <SafeAreaView className="w-full h-full flex justify-end items-center">
            <View className="h-3/4 w-[98%] rounded-t-lg border border-slate-400/50 bg-white shadow-lg">
              <View className="flex flex-wrap gap-y-4">
                <View className="w-full flex items-end">
                  <TouchableOpacity
                    className="pt-4 pr-4"
                    onPress={() => setNewPlanModal(false)}
                  >
                    <FontAwesomeIcon icon="xmark" />
                  </TouchableOpacity>
                  <View className="px-4 mt-4 flex-grow flex flex-wrap w-full">
                    <TextInput
                      className="text-[#011627] text-base h-14 w-full border-slate-400/50 border p-2 rounded-lg"
                      placeholder="Enter a name"
                      placeholderTextColor="#01162750"
                      value={newPlanName}
                      onChangeText={setNewPlanName}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        createPlan.mutate({
                          name: newPlanName,
                          token: token as string,
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
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
  ) : null;
};

export default MealPlans;
