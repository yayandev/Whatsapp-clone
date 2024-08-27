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
  ActivityIndicator,
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
import { db, storage } from "../../utils/firebase";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { formatTimestamp } from "../../helpers/formatTimestamp";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { Audio } from "expo-av";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import MessageCard from "../../components/MessageCard";

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
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [recordingTime, setRecordingTime] = useState(0);
  const [timer, setTimer] = useState(null);
  const [loadingSendAudio, setLoadingSendAudio] = useState(false);

  // get user & messages
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

  // function sendMessage
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

  // function startRecording
  const startRecording = async () => {
    try {
      if (permissionResponse.status !== "granted") {
        await requestPermission();
      }

      if (Keyboard.isVisible) {
        Keyboard.dismiss();
      }

      if (showEmojiSelector) {
        setShowEmojiSelector(false);
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      // update recording time
      const timer = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);

      setTimer(timer);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  // function stopRecording
  const stopRecording = async () => {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();

    const response = await fetch(uri);
    const blob = await response.blob();

    // send audio to server
    const audioRef = ref(
      storage,
      `audios/${user.phone}/${Date.now()}-${Math.floor(Math.random() * 1000)}`
    );
    const uploadTask = uploadBytesResumable(audioRef, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        setLoadingSendAudio(true);
      },
      (error) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Error",
          textBody: "Failed to send audio",
        });
      },
      async () => {
        const url = await getDownloadURL(audioRef);

        addDoc(collection(db, "rooms", id, "messages"), {
          audio: url,
          sender: user.phone,
          timestamp: serverTimestamp(),
          read: false,
          duration: recordingTime,
        });

        setLoadingSendAudio(false);
      }
    );

    setRecordingTime(0);
    clearInterval(timer);
    setTimer(null);
    setLoadingSendAudio(false);
  };

  // function cancelSendAudio
  const cancelSendAudio = async () => {
    if (recording) {
      setRecording(undefined);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setRecordingTime(0);
      clearInterval(timer);
      setTimer(null);
    }
  };

  // scroll to end
  const handleScrollToEnd = () => {
    scrollRef.current?.scrollToEnd({ animated: false });
  };

  // scroll to end
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
            <MessageCard key={index} message={message} user={user} />
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
          {recording ? (
            // recording view
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
              <TouchableOpacity onPress={() => cancelSendAudio()}>
                <Ionicons name="trash" size={24} color="black" />
              </TouchableOpacity>
              <Text style={{ fontSize: 16 }}>Recording... {recordingTime}</Text>
            </View>
          ) : (
            // message view
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
              <View style={{ flex: 1, flexDirection: "row", gap: 5 }}>
                <TextInput
                  placeholder="Type a message"
                  style={{
                    flex: 1,
                    fontSize: 16,
                    maxHeight: 50,
                  }}
                  value={message}
                  onChangeText={(text) => setMessage(text)}
                  onFocus={() => {
                    if (showEmojiSelector) setShowEmojiSelector(false);
                    scrollRef.current?.scrollToEnd({ animated: true });
                  }}
                  scrollEnabled
                  multiline
                />
                <TouchableOpacity>
                  <Ionicons name="attach" size={24} color="black" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {message?.length > 0 ? (
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
          ) : (
            <TouchableOpacity
              onPress={recording ? stopRecording : startRecording}
              style={{
                backgroundColor: "#008069",
                padding: 15,
                borderRadius: 50,
              }}
              disabled={loadingSendAudio}
            >
              {loadingSendAudio ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name={recording ? "send" : "mic"}
                  size={24}
                  color="white"
                />
              )}
            </TouchableOpacity>
          )}
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
