import { Text, View } from "react-native";
import "@/global.css"; 

export default function Page() {
  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-xl font-bold text-indigo-PRIMARY">
        Indigo Finance Mobile
      </Text>
    </View>
  );
}