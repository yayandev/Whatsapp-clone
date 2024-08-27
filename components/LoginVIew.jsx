import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { Ionicons } from "@expo/vector-icons";
const TabOne = ({ setTab }) => {
  const paddingTop = useSafeAreaInsets().top;
  return (
    <View style={[styles.container, { paddingTop: paddingTop }]}>
      <Text style={styles.title}>Welcome To Whatsapp</Text>
      <View style={styles.content}>
        <Image
          source={require("../assets/images/login.png")}
          resizeMode="contain"
          style={styles.image}
        />
        <Text style={styles.text}>
          Read our Privacy Policy. Tap “Agree and continue” to accept the Teams
          of Service.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => setTab(1)}>
          <Text style={styles.buttonText}>AGREE AND CONTINUE</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>From</Text>
        <Text style={styles.footerTitle}>Yayandev</Text>
      </View>
    </View>
  );
};

const TabTwo = ({ setTab, login, phone, setPhone }) => {
  const paddingTop = useSafeAreaInsets().top;
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Please enter your phone number",
      });
      return;
    }

    if (phone.startsWith("0")) {
      phone = `62${phone.slice(1)}`;
    }

    setLoading(true);

    const response = await login(phone);

    if (response.success) {
      setTab(2);
    } else {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: response.message,
      });
    }

    setLoading(false);
  };

  return (
    <View style={[styles.containerFormLogin, { paddingTop: paddingTop }]}>
      <View style={styles.ImageContainer}>
        <Image
          source={require("../assets/images/icon.png")}
          resizeMode="contain"
          style={styles.imageLogo}
        />
      </View>
      <View style={styles.formLogin}>
        <Text style={styles.titleFormLogin}>Enter your phone number</Text>
        <TextInput
          placeholder="Phone number"
          keyboardType="numeric"
          style={styles.inputFormLogin}
          value={phone}
          onChangeText={(text) => setPhone(text)}
        />
        <TouchableOpacity
          style={styles.buttonFormLogin}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonTextFormLogin}>NEXT</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const TabThree = ({ verifyOtp, phone, setTab }) => {
  const [loading, setLoading] = useState(false);
  const paddingTop = useSafeAreaInsets().top;
  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    if (!otp) {
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "Please enter your otp code",
      });
      return;
    }

    if (phone.startsWith("0")) {
      phone = `62${phone.slice(1)}`;
    }

    setLoading(true);
    await verifyOtp(phone, otp);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { paddingTop: paddingTop }]}>
      <Pressable
        style={{
          alignSelf: "flex-start",
          paddingLeft: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
        onPress={() => setTab(1)}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.titleTop}>Enter OTP Code</Text>
      </Pressable>
      <View style={styles.content}>
        <TextInput
          style={[styles.inputFormLogin, { textAlign: "center" }]}
          placeholder="Enter OTP Code"
          keyboardType="numeric"
          value={otp}
          maxLength={6}
          onChangeText={(text) => setOtp(text)}
        />
      </View>
      <TouchableOpacity
        style={[styles.buttonFormLogin, { marginBottom: 20, width: "90%" }]}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={[styles.buttonTextFormLogin, { fontSize: 18 }]}>
            Verify
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function LoginVIew({ login, verifyOtp }) {
  const [tab, setTab] = useState(0);
  const [phone, setPhone] = useState("");

  return (
    <>
      {tab === 0 && <TabOne setTab={setTab} />}

      {tab === 1 && (
        <TabTwo
          setTab={setTab}
          login={login}
          phone={phone}
          setPhone={setPhone}
        />
      )}

      {tab === 2 && (
        <TabThree verifyOtp={verifyOtp} setTab={setTab} phone={phone} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 40,
  },
  content: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    paddingTop: 30,
    gap: 30,
    paddingHorizontal: 20,
    width: "80%",
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 14,
    color: "gray",
  },
  button: {
    backgroundColor: "#00A884",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "column",
    gap: 5,
    paddingVertical: 20,
  },
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: "gray",
  },
  footerTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  containerFormLogin: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formLogin: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    paddingTop: 30,
    gap: 30,
    paddingHorizontal: 20,
    width: "80%",
  },
  titleFormLogin: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "semicenter",
    paddingTop: 40,
  },
  inputFormLogin: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#00A884",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  forgotPassword: {
    textAlign: "center",
    fontSize: 12,
    color: "gray",
  },
  buttonFormLogin: {
    backgroundColor: "#00A884",
    padding: 15,
    borderRadius: 5,
  },
  buttonTextFormLogin: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  imageLogo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
  },
  titleTop: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
