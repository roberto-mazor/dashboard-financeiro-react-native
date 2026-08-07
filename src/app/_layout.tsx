import { Stack } from "expo-router";

import "../src/global.css";
import { Slot } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{headerShown: false}}/>;
}
