import { Stack } from "expo-router";

import "../global.css";
import { Slot } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{headerShown: false}}/>;
}
