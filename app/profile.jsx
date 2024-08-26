import { View, Text } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const paddingTop = useSafeAreaInsets().top;
  return (
    <View style={{ paddingTop: paddingTop }}>
      <Text>Profile</Text>
    </View>
  );
}
