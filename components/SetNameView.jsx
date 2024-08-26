import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { db, storage } from "../utils/firebase.js";
import { doc, setDoc } from "firebase/firestore";
import { Toast, ALERT_TYPE } from "react-native-alert-notification";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

export default function SetNameView({ user, setUser }) {
  const paddingTop = useSafeAreaInsets().top;
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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

  const updateName = async () => {
    if (name.trim() === "") {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Name cannot be empty",
      });
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, "users", user.phone), {
        ...user,
        name: name,
      });
      setUser({ ...user, name: name });
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Name updated successfully",
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
  };

  const updateAvatar = async () => {
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
  };

  return (
    <View style={[styles.container, { paddingTop: paddingTop }]}>
      <Text style={styles.text}>Welcome Back!</Text>

      <View style={styles.imageContainer}>
        <Image
          source={
            user?.avatar
              ? { uri: user?.avatar }
              : require("../assets/images/default.png")
          }
          style={styles.image}
        />
      </View>
      <TouchableOpacity style={styles.changeBtn} onPress={updateAvatar}>
        <Ionicons name="pencil" size={24} color="black" />
      </TouchableOpacity>
      <TextInput
        placeholder="Your Name"
        style={styles.input}
        onChangeText={(text) => setName(text)}
      />
      <TouchableOpacity style={styles.button} onPress={updateName}>
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.buttonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 20,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  changeBtn: {
    padding: 10,
    marginTop: -20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ddd",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    marginTop: 20,
  },
  button: {
    width: "80%",
    backgroundColor: "#25d366",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
