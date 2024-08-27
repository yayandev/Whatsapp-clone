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
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { Audio } from "expo-av";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import MessageCard from "../../components/MessageCard";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";

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

  // replay message
  const [reply, setReply] = useState(null);
  const inputRef = useRef(null);

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
      reply: reply ? reply : null,
    });

    setReply(null);
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
          reply: reply ? reply : null,
        });

        setReply(null);
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
      {/* header */}
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
                marginTop: 30,
              },
              optionWrapper: {
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              },
            }}
          >
            <MenuOption onSelect={() => {}}>
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
          </MenuOptions>
        </Menu>
      </View>
      {/* messages */}
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
          }}
        >
          {/* message map */}
          {messages?.map((message, index) => {
            // message date logic
            const dateMessage = new Date(message.timestamp?.toDate());
            const previousMessage = messages[index - 1];
            const previousDateMessage = previousMessage
              ? new Date(previousMessage.timestamp?.toDate())
              : null;
            const isNewDay =
              !previousDateMessage ||
              dateMessage.toDateString() !== previousDateMessage.toDateString();

            return (
              <View key={index}>
                {isNewDay && (
                  <View
                    style={{
                      padding: 10,
                      backgroundColor: "#E5E5E5",
                      marginBottom: 10,
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 14,
                        fontWeight: "500",
                      }}
                    >
                      {dateMessage.toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                )}

                <MessageCard
                  reply={reply}
                  setReply={setReply}
                  message={message}
                  user={user}
                  inputRef={inputRef}
                  user2={user2}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
      {/* form send message */}
      <View>
        {/* replay message view */}
        {reply && (
          <View
            style={{
              padding: 10,
              backgroundColor: "white",
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
              borderRadius: 10,
              width: "80%",
              marginLeft: 15,
            }}
          >
            <View
              style={{
                flex: 1,
              }}
            >
              <View
                style={{
                  paddingHorizontal: 8,
                  borderLeftWidth: 3,
                  borderLeftColor: "#008069",
                }}
              >
                <Text style={{ fontSize: 12, color: "#008069" }}>
                  {reply?.sender === user?.phone ? "You" : user2?.name}
                </Text>
                {reply?.text && (
                  <Text style={{ fontSize: 16, color: "gray" }}>
                    {reply?.text}
                  </Text>
                )}
                {reply?.audio && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 5,
                    }}
                  >
                    <Ionicons name="play" size={20} color="gray" />
                    <Text style={{ fontSize: 14, color: "gray" }}>
                      {reply?.duration > 60
                        ? (reply?.duration / 60).toFixed(0) + "m"
                        : reply?.duration + "s"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={() => setReply(null)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
        )}
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
                  ref={inputRef}
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

                <Menu>
                  <MenuTrigger>
                    <Ionicons name="attach" size={24} color="black" />
                  </MenuTrigger>
                  <MenuOptions
                    optionsContainerStyle={{
                      padding: 15,
                      backgroundColor: "white",
                      borderRadius: 10,
                      width: "auto",
                      marginTop: -50,
                      alignItems: "center",
                      marginLeft: -50,
                    }}
                  >
                    <MenuOption
                      onSelect={() => {}}
                      style={{
                        padding: 10,
                        backgroundColor: "#008069",
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Ionicons name="image" size={24} color="white" />
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {}}
                      style={{
                        padding: 10,
                        backgroundColor: "#008069",
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Ionicons name="camera" size={24} color="white" />
                    </MenuOption>
                    <MenuOption
                      onSelect={() => {}}
                      style={{
                        padding: 10,
                        backgroundColor: "#008069",
                        borderRadius: 10,
                      }}
                    >
                      <Ionicons name="person" size={24} color="white" />
                    </MenuOption>
                  </MenuOptions>
                </Menu>
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
