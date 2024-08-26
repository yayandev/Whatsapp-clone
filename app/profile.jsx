import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "./../context/AuthContext";
import { db, storage } from "../utils/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { Toast, ALERT_TYPE } from "react-native-alert-notification";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

export default function ProfileScreen() {
  const paddingTop = useSafeAreaInsets().top;
  const { user, setUser } = useAuth();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const updateAvatarWithMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      selectionLimit: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLoading(true);
      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        const refUpload = ref(storage, `images/${user.phone}`);
        const uploadTask = uploadBytesResumable(refUpload, blob);

        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            Toast.show({
              type: ALERT_TYPE.ERROR,
              title: "Error",
              textBody: error.message,
            });
            setLoading(false);
            setCameraVisible(false);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              await setDoc(
                doc(db, "users", user.phone),
                {
                  ...user,
                  avatar: url,
                },
                { merge: true }
              );
              setUser({ ...user, avatar: url });
              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: "Success",
                textBody: "Profile picture updated successfully",
              });
              setCameraVisible(false);
            } catch (error) {
              Toast.show({
                type: ALERT_TYPE.ERROR,
                title: "Error",
                textBody: error.message,
              });
              setCameraVisible(false);
            } finally {
              setLoading(false);
              setCameraVisible(false);
            }
          }
        );
      } catch (error) {
        Toast.show({
          type: ALERT_TYPE.ERROR,
          title: "Error",
          textBody: error.message,
        });
        setLoading(false);
        setCameraVisible(false);
      }
    }
  };

  async function takePicture() {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      selectionLimit: 1,
      legacy: true,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        const refUpload = ref(storage, `images/${user.phone}`);
        const uploadTask = uploadBytesResumable(refUpload, blob);

        uploadTask.on(
          "state_changed",
          () => {},
          (error) => {
            Toast.show({
              type: ALERT_TYPE.ERROR,
              title: "Error",
              textBody: error.message,
            });
            setLoading(false);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              await setDoc(
                doc(db, "users", user.phone),
                {
                  ...user,
                  avatar: url,
                },
                { merge: true }
              );
              setUser({ ...user, avatar: url });
              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: "Success",
                textBody: "Profile picture updated successfully",
              });
            } catch (error) {
              Toast.show({
                type: ALERT_TYPE.ERROR,
                title: "Error",
                textBody: error.message,
              });
            } finally {
              setLoading(false);
            }
          }
        );
      } catch (error) {
        Toast.show({
          type: ALERT_TYPE.ERROR,
          title: "Error",
          textBody: error.message,
        });
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const libraryStatus =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus.status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera roll permissions to make this work!"
          );
        }

        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus.status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Sorry, we need camera permissions to make this work!"
          );
        }
      }
    })();
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ paddingTop: paddingTop, paddingHorizontal: 10 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="black" />
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: "600" }}>Profile</Text>
          </View>
        </View>
        <Image
          source={
            user?.avatar
              ? { uri: user?.avatar }
              : require("../assets/images/default.png")
          }
          style={{
            width: 150,
            height: 150,
            borderRadius: 50,
            alignSelf: "center",
            marginVertical: 20,
          }}
        />
        <TouchableOpacity
          onPress={() => setCameraVisible(true)}
          style={{
            alignSelf: "center",
            marginTop: -50,
            backgroundColor: "#008069",
            padding: 10,
            borderRadius: 50,
          }}
        >
          <Ionicons name="camera" size={25} color="white" />
        </TouchableOpacity>
        <View style={{ gap: 10 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              paddingHorizontal: 10,
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              paddingBottom: 5,
              borderBottomColor: "lightgray",
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <Ionicons name="person" size={20} color="black" />
              <View>
                <Text style={{ fontSize: 14, color: "gray" }}>Name</Text>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {user?.name}
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil-sharp" size={25} color="#008069" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              paddingHorizontal: 10,
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              paddingBottom: 5,
              borderBottomColor: "lightgray",
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <Ionicons
                name="information-circle-sharp"
                size={20}
                color="black"
              />
              <View>
                <Text style={{ fontSize: 14, color: "gray" }}>Info</Text>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {user?.bio}
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="pencil-sharp" size={25} color="#008069" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              paddingHorizontal: 10,
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              paddingBottom: 5,
              borderBottomColor: "lightgray",
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <Ionicons name="call" size={20} color="black" />
              <View>
                <Text style={{ fontSize: 14, color: "gray" }}>
                  Phone Number
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {user?.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* Camera */}
      <Modal
        onTouchCancel={() => setCameraVisible(false)}
        visible={cameraVisible}
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              padding: 20,
              gap: 20,
              width: "100%",
              backgroundColor: "white",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => setCameraVisible(false)}
              style={{
                backgroundColor: "#008069",
                padding: 10,
                borderRadius: 50,
              }}
            >
              <Ionicons name="close" size={40} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePicture}
              style={{
                backgroundColor: "#008069",
                padding: 10,
                borderRadius: 50,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" size={"large"} />
              ) : (
                <Ionicons name="camera" size={40} color="white" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => updateAvatarWithMedia()}
              style={{
                backgroundColor: "#008069",
                padding: 10,
                borderRadius: 50,
              }}
            >
              <Ionicons name="images" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
