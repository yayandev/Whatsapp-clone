import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../utils/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatTimestamp } from "../../helpers/formatTimestamp";
import EmojiSelector, { Categories } from "react-native-emoji-selector";

export default function RoomScreen() {
  const { id } = useLocalSearchParams();
  const participants = id.split("_");
  const paddingTop = useSafeAreaInsets().top;
  const { user } = useAuth();
  const phoneUser2 = participants.find((p) => p !== user.phone);
  const [user2, setUser2] = useState({});
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const scrollRef = useRef(null);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  useEffect(() => {
    if (!id) return;
    const getUser2 = async () => {
      const docRef = doc(db, "users", phoneUser2);
      const docSnap = await getDoc(docRef);
      setUser2(docSnap.data());
    };

    getUser2();

    const messagesRef = collection(db, "rooms", id, "messages");

    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );

      querySnapshot.docs.forEach((doc) => {
        if (!doc.data().read && doc.data().sender !== user.phone) {
          updateDoc(doc.ref, { read: true });
        }
      });
    });

    return () => unsubscribe();
  }, [id]);

  const sendMessage = async () => {
    if (!message) return;

    addDoc(collection(db, "rooms", id, "messages"), {
      text: message,
      sender: user.phone,
      timestamp: serverTimestamp(),
      read: false,
    });

    setMessage("");
    if (showEmojiSelector) setShowEmojiSelector(false);
    if (Keyboard.isVisible()) Keyboard.dismiss();
  };

  const handleScrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: false });
  };

  useLayoutEffect(() => {
    if (isFirstRender) {
      handleScrollToEnd();
      setIsFirstRender(false); // Setelah render pertama, ubah state
    } else {
      handleScrollToEnd();
    }
  }, [messages]);
  return (
    <View
      style={{
        backgroundColor: "#E5E5E5",
        paddingTop,
        flex: 1,
        justifyContent: "space-between",
        flexDirection: "column",
      }}
    >
      <StatusBar style="light" backgroundColor="#008069" />
      <View
        style={{
          width: "100%",
          padding: 10,
          backgroundColor: "#008069",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={24} color="white" />
          </TouchableOpacity>
          <Image
            source={
              user2?.avatar
                ? { uri: user2?.avatar }
                : require("../../assets/images/default.png")
            }
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
          <Text
            style={{
              color: "white",
              marginLeft: 10,
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            {user2?.name}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // Scroll to end after content size changes
          scrollRef.current?.scrollToEnd({
            animated: !isFirstRender,
          });
        }}
      >
        <View
          style={{
            flex: 1,
            padding: 10,
          }}
        >
          {messages?.map((message, index) => (
            <View
              key={index}
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: "#E7FFDB",
                marginBottom: 10,
                maxWidth: "80%",
                alignSelf:
                  message?.sender === user?.phone ? "flex-end" : "flex-start",
                minWidth: 100,
              }}
            >
              <Text style={{ fontSize: 16 }}>
                {message?.text && message?.text.length > 40
                  ? message?.text.slice(0, 40) + "..."
                  : message?.text}
              </Text>
              {message?.sender !== user.phone ? (
                <Text
                  style={{
                    fontWeight: "500",
                    fontSize: 12,
                    color: "gray",
                    alignSelf: "flex-end",
                  }}
                >
                  {formatTimestamp(message?.timestamp)}
                </Text>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 5,
                    justifyContent: "flex-end",
                  }}
                >
                  <Ionicons
                    name={"checkmark-done"}
                    size={18}
                    color={message?.read ? "skyblue" : "gray"}
                    style={{ alignSelf: "flex-end" }}
                  />

                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: 12,
                      color: "gray",
                      alignSelf: "flex-end",
                    }}
                  >
                    {formatTimestamp(message?.timestamp)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      {/* form send message */}
      <View>
        <View
          style={{
            width: "100%",
            padding: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: "white",
              padding: 15,
              borderRadius: 50,
              flex: 1,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (Keyboard.isVisible()) {
                  Keyboard.dismiss();
                }
                setShowEmojiSelector(!showEmojiSelector);
              }}
            >
              <MaterialCommunityIcons
                name="emoticon-happy-outline"
                size={24}
                color="black"
              />
            </TouchableOpacity>
            <TextInput
              placeholder="Type a message"
              style={{
                flex: 1,
                fontSize: 16,
              }}
              value={message}
              onChangeText={(text) => setMessage(text)}
              onFocus={() => {
                if (showEmojiSelector) setShowEmojiSelector(false);
                scrollRef.current?.scrollToEnd({ animated: true });
              }}
            />
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            style={{
              backgroundColor: "#008069",
              padding: 15,
              borderRadius: 50,
            }}
          >
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {showEmojiSelector && (
          <View
            style={{
              width: "100%",
              height: 200,
              backgroundColor: "white",
            }}
          >
            <EmojiSelector
              onEmojiSelected={(emoji) => setMessage(message + emoji)}
              showSearchBar={false}
              showSectionTitles={false}
              columns={6}
              category={Categories.emotion}
            />
          </View>
        )}
      </View>
    </View>
  );
}
