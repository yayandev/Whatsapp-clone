import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function NoMessage() {
  return (
    <ImageBackground
      source={require("../assets/images/no-message.png")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 100,
          height: 100,
          borderRadius: 20,
          backgroundColor: "#0CCC83",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <Ionicons name="checkbox" size={50} color="white" />
      </View>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        You haven’t chat yet
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/contacts")}
        style={{
          paddingHorizontal: 25,
          paddingVertical: 15,
          backgroundColor: "#0CCC83",
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
          Start Chatting
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}
