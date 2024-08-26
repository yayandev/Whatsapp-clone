import React, { useEffect, useState } from "react";
import NoMessage from "../NoMessage";
import MessageList from "../MessageList";
import { db } from "./../../utils/firebase";
import { useAuth } from "./../../context/AuthContext";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ChatsView() {
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    const q = query(
      collection(db, "rooms"),
      where("participants", "array-contains", user?.phone)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setRooms(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsubscribe();
  }, []);
  return (
    <>
      {loading && (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={"#008069"} />
        </View>
      )}

      {!loading && rooms.length === 0 && <NoMessage />}
      {!loading && rooms.length > 0 && <MessageList rooms={rooms} />}

      <TouchableOpacity
        onPress={() => router.push("/contacts")}
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 1,
          backgroundColor: "#008665",
          padding: 18,
          borderRadius: 50,
        }}
      >
        <Ionicons name="chatbox" size={24} color="white" />
      </TouchableOpacity>
    </>
  );
}
