import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import React, { useEffect, useState } from "react";
import { formatTimestamp } from "../helpers/formatTimestamp";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

export default function MessageCard({
  message,
  user,
  setReply,
  reply,
  inputRef,
  user2,
}) {
  const [audioIsPlaying, setAudioIsPlaying] = useState(false);
  const [sound, setSound] = useState();
  const [duration, setDuration] = useState(0);

  async function playSound() {
    if (!sound) return;

    if (audioIsPlaying) {
      await sound.stopAsync();
      setAudioIsPlaying(false);
    } else {
      await sound.playAsync();
      setAudioIsPlaying(true);

      setTimeout(() => {
        setAudioIsPlaying(false);
      }, Number(duration) * 1000);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (!message?.audio) return;

    const getAudio = async () => {
      const { sound, status } = await Audio.Sound.createAsync({
        uri: message?.audio,
      });

      setSound(sound);
      setDuration((status.durationMillis / 1000).toFixed(0));
    };

    getAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [message]);

  return (
    <View
      style={{
        padding: 10,
        marginBottom: 10,
        backgroundColor: reply?.id === message?.id ? "lightblue" : null,
      }}
    >
      <TouchableOpacity
        onLongPress={() => {
          setReply(message);
          inputRef.current?.focus();
        }}
        style={{
          padding: 8,
          borderRadius: 8,
          backgroundColor:
            message?.sender === user?.phone ? "#E7FFDB" : "white",
          maxWidth: "80%",
          alignSelf:
            message?.sender === user?.phone ? "flex-end" : "flex-start",
          minWidth: 100,
        }}
      >
        {/* reply message */}
        {message?.reply && (
          <View
            style={{
              paddingHorizontal: 8,
              borderLeftWidth: 3,
              borderLeftColor: "#008069",
              backgroundColor: "#f2f2f2",
            }}
          >
            <Text style={{ fontSize: 12, color: "#008069" }}>
              {message?.reply?.sender === user?.phone ? "You" : user2?.name}
            </Text>
            {message?.reply?.text && (
              <Text style={{ fontSize: 16, color: "gray" }}>
                {message?.reply?.text}
              </Text>
            )}
            {message?.reply?.audio && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 5,
                }}
              >
                <Ionicons name="play" size={20} color="gray" />
                <Text style={{ fontSize: 14, color: "gray" }}>
                  {message?.reply?.duration > 60
                    ? (message?.reply?.duration / 60).toFixed(0) + "m"
                    : message?.reply?.duration + "s"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* message text */}
        {message?.text && (
          <Text style={{ fontSize: 16 }}>
            {message?.text.length > 40
              ? message?.text.slice(0, 40) + "..."
              : message?.text}
          </Text>
        )}

        {/* message audio */}
        {message?.audio && (
          <View style={{ flexDirection: "row", gap: 5 }}>
            <TouchableOpacity onPress={playSound}>
              <Ionicons
                name={audioIsPlaying ? "pause" : "play"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: "gray" }}>
              {Number(duration) > 60
                ? (Number(duration) / 60).toFixed(0) + "m"
                : duration + "s"}
            </Text>
          </View>
        )}

        {/* sender */}
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
      </TouchableOpacity>
    </View>
  );
}
