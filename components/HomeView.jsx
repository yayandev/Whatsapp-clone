import { View, Text, Pressable } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from './../context/AuthContext';

export default function HomeView() {
  const paddingTop = useSafeAreaInsets().top;
  const {user,logout} = useAuth()

  return (
    <View style={{ paddingTop: paddingTop }}>
      <Text>HomeView</Text>
      <Pressable onPress={logout}>
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
}
