import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";

export default function MessageList() {
  return (
    <View style={{ padding: 10 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {Array(20)
          .fill(0)
          .map((_, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                }}
              >
                <Image
                  source={require("../assets/images/default.png")}
                  style={{ width: 50, height: 50, borderRadius: 50 }}
                />
                <View>
                  <Text style={{ fontWeight: "500", fontSize: 18 }}>Name</Text>
                  <Text style={{ fontSize: 12, color: "gray" }}>Message</Text>
                </View>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: "#026500" }}>08:13</Text>
                <Text
                  style={{
                    fontSize: 12,
                    width: 25,
                    height: 25,
                    borderRadius: 50,
                    backgroundColor: "#026500",
                    color: "white",
                    textAlign: "center",
                    textAlignVertical: "center",
                  }}
                >
                  1
                </Text>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}
