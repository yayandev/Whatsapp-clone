import { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { router } from "expo-router";
import { formatTimestamp } from "./../helpers/formatTimestamp";
import { Ionicons } from "@expo/vector-icons";

const CardRoom = ({ room }) => {
  const [user2, setUser2] = useState({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState({});
  const [unReadMessage, setUnReadMessage] = useState([]);

  useEffect(() => {
    if (!room) return;

    const init = async () => {
      const participants = room.participants;
      const phoneUser2 = participants.find((p) => p !== user.phone);
      const getUser2 = await getDoc(doc(db, "users", phoneUser2));
      setUser2(getUser2.data());
      setLoading(false);
    };
    init();

    const messagesRef = collection(db, "rooms", room.id, "messages");
    const q = query(messagesRef, orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      setLastMessage(
        querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .slice(0, 1)[0]
      );

      setUnReadMessage(
        querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter(
            (message) => message.read === false && message.sender !== user.phone
          )
      );
    });

    return () => unsubscribe();
  }, [room]);

  if (loading) {
    // skeleton
    return (
      <TouchableOpacity
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
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 50,
              backgroundColor: "gray",
            }}
          ></View>
          <View>
            <View
              style={{
                width: 150,
                height: 10,
                borderRadius: 10,
                backgroundColor: "gray",
              }}
            ></View>
            <View
              style={{
                width: 100,
                height: 10,
                borderRadius: 10,
                backgroundColor: "gray",
                marginTop: 5,
              }}
            ></View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => router.push(`/room/${room.id}`)}
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
          source={
            user2?.avatar
              ? { uri: user2?.avatar }
              : require("../assets/images/default.png")
          }
          style={{ width: 50, height: 50, borderRadius: 50 }}
        />
        <View>
          <Text style={{ fontWeight: "500", fontSize: 18 }}>{user2?.name}</Text>
          {lastMessage?.sender !== user.phone ? (
            <Text style={{ fontSize: 12, color: "gray" }}>
              {lastMessage?.text && lastMessage?.text.length > 40
                ? lastMessage?.text.slice(0, 40) + "..."
                : lastMessage?.text}
            </Text>
          ) : (
            <View style={{ flexDirection: "row", gap: 5 }}>
              <Ionicons
                name={"checkmark-done"}
                size={18}
                color={lastMessage?.read ? "skyblue" : "gray"}
              />
              <Text style={{ fontSize: 12, color: "gray" }}>
                {lastMessage?.text && lastMessage?.text.length > 40
                  ? lastMessage?.text.slice(0, 40) + "..."
                  : lastMessage?.text}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View>
        <Text style={{ fontSize: 12, color: "#026500" }}>
          {lastMessage?.timestamp && formatTimestamp(lastMessage?.timestamp)}
        </Text>
        {unReadMessage.length > 0 && (
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
            {unReadMessage.length > 99 ? "99+" : unReadMessage.length}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function MessageList({ rooms }) {
  return (
    <View style={{ padding: 10 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {rooms?.map((room, index) => (
          <CardRoom key={index} room={room} />
        ))}
      </ScrollView>
    </View>
  );
}
