import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "./../context/AuthContext";
import { router } from "expo-router";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

export default function TabHeader({ index, routes, setIndex }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#008069" />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={styles.title}>WhatsApp</Text>
        <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
          <TouchableOpacity>
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
          <Menu>
            <MenuTrigger>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </MenuTrigger>
            <MenuOptions
              customStyles={{
                optionsContainer: {
                  backgroundColor: "white",
                  borderRadius: 10,
                  padding: 10,
                  width: 200,
                },
                optionWrapper: {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                },
              }}
            >
              <MenuOption onSelect={() => router.push("/profile")}>
                <Text
                  style={{
                    color: "black",
                    fontWeight: "semibold",
                    fontSize: 16,
                  }}
                >
                  Profile
                </Text>
              </MenuOption>
              <MenuOption onSelect={() => handleLogout()}>
                <Text
                  style={{
                    color: "red",
                    fontWeight: "semibold",
                    fontSize: 16,
                  }}
                >
                  Sign Out
                </Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
      <View style={styles.tabMenus}>
        {routes.map((route, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.tabMenu,
              index === i && {
                ...styles.tabMenuText,
                borderBottomWidth: 5,
                borderColor: "white",
              },
            ]}
            onPress={() => setIndex(i)}
          >
            <Text style={styles.tabMenuText}>{route.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 5,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: "#008069",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  tabMenus: {
    marginTop: 20,
    flexDirection: "row",
  },
  tabMenu: {
    width: `${100 / 3}%`,
    alignItems: "center",
  },
  tabMenuText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
  },
});
