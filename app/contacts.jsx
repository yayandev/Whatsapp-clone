import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Contacts from "expo-contacts";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { db } from "./../utils/firebase";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useAuth } from "./../context/AuthContext";

export default function ContactsScreen() {
  const paddingTop = useSafeAreaInsets().top;
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibleModal, setVisibleModal] = useState(false);
  const [contact, setContact] = useState({});
  const { user } = useAuth();
  const [loadingCreateRoom, setLoadingCreateRoom] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync();

        if (data.length > 0) {
          setContacts(data);
          setLoading(false);
        }
      }
    })();
  }, []);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showContactInModal = (contact) => {
    setVisibleModal(true);
    setContact(contact);
  };

  const createRoom = async (contact) => {
    let phone = contact.phoneNumbers[0].number;

    if (phone.startsWith("+")) {
      phone = phone.slice(1);
    }

    if (phone.startsWith("0")) {
      phone = `62${phone.slice(1)}`;
    }

    if (phone === user?.phone) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "You can't chat with yourself",
      });
      setVisibleModal(false);
      return;
    }

    setLoadingCreateRoom(true);

    const participantsKey = [phone, user?.phone].sort().join("_");
    const roomRef = doc(db, "rooms", participantsKey);

    const roomExists = await getDoc(roomRef);

    if (roomExists.exists()) {
      router.push(`/room/${roomRef.id}`);
      setVisibleModal(false);
      setLoadingCreateRoom(false);
    } else {
      await setDoc(roomRef, {
        participants: [phone, user?.phone],
        timestamp: serverTimestamp(),
      });

      router.push(`/room/${roomRef.id}`);

      setLoadingCreateRoom(false);
    }

    setVisibleModal(false);
    setLoadingCreateRoom(false);
  };

  return (
    <View style={{ paddingTop, gap: 10 }}>
      <View
        style={{
          padding: 15,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          {isSearchActive ? (
            <TouchableOpacity
              onPress={() => setIsSearchActive(!isSearchActive)}
            >
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          )}

          {isSearchActive ? (
            <TextInput
              style={{
                padding: 10,
                borderColor: "gray",
                borderWidth: 1,
                borderRadius: 5,
                flex: 1,
              }}
              placeholder="Cari kontak..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          ) : (
            <View>
              <Text style={{ fontSize: 18 }}>Pilih Kontak</Text>
              {!loading && (
                <Text style={{ color: "gray", fontSize: 12 }}>
                  {contacts.length} kontak
                </Text>
              )}
            </View>
          )}
        </View>
        {!isSearchActive && (
          <TouchableOpacity onPress={() => setIsSearchActive(!isSearchActive)}>
            <Ionicons name="search" size={24} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!loading && (
          <Text style={{ padding: 10, fontWeight: "bold" }}>
            Kontak Di Telepon
          </Text>
        )}
        {loading && <ActivityIndicator size="large" color={"#008069"} />}
        {filteredContacts.map((contact, index) => (
          <TouchableOpacity
            onPress={() => showContactInModal(contact)}
            key={contact.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 10,
              gap: 10,
              paddingBottom: index === filteredContacts.length - 1 ? 100 : 0,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50,
                backgroundColor: "gray",
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  textAlignVertical: "center",
                  color: "white",
                  fontSize: 20,
                }}
              >
                {contact.name[0]}
              </Text>
            </View>
            <Text>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Modal visible={visibleModal} animationType="none" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%",
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => setVisibleModal(false)}
              style={{
                alignItems: "flex-end",
              }}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "gray",
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  textAlignVertical: "center",
                  color: "white",
                  fontSize: 20,
                }}
              >
                {contact?.name?.[0] || "?"}
              </Text>
            </View>
            <Text style={{ fontWeight: "bold", textAlign: "center" }}>
              {contact?.name || "Unknown"}
            </Text>
            <Text style={{ textAlign: "center", color: "gray", fontSize: 12 }}>
              {contact?.phoneNumbers?.[0]?.number || "No phone number"}
            </Text>
            <TouchableOpacity
              onPress={() => createRoom(contact)}
              style={{
                backgroundColor: "#008069",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {loadingCreateRoom ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{ color: "white" }}>Chat</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
