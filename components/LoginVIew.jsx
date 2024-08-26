import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const TabTwo = ({setTab, login, register}) => {
  const paddingTop = useSafeAreaInsets().top;
  const [view, setView] = useState("Sign In");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async () => {
   await login(email, password);
  };

  const handleRegister = async () => {
    await register(email, password, confirmPassword);
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
        <Text style={styles.titleFormLogin}>{view}</Text>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.inputFormLogin}
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.inputFormLogin}
        />
        {view === "Sign Up" && (
           <TextInput
           placeholder="Confirm Password"
           secureTextEntry
           style={styles.inputFormLogin}
           onChangeText={(text) => setConfirmPassword(text)}
           value={confirmPassword}
         />
        )}
        <Pressable onPress={() => setView(view === "Sign In" ? "Sign Up" : "Sign In")}>
         <Text style={styles.forgotPassword}>
          {view === "Sign In" ? "Don't have an account?" : "Already have an account?"}
         </Text>
        </Pressable>
        {view === "Sign In" ? (
          <TouchableOpacity style={styles.buttonFormLogin} onPress={handleLogin}>
            <Text style={styles.buttonTextFormLogin}>SIGN IN</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buttonFormLogin} onPress={handleRegister}>
            <Text style={styles.buttonTextFormLogin}>SIGN UP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const TabOne = ({setTab}) => {
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
      Read our Privacy Policy. Tap “Agree and continue” to 
      accept the Teams of Service.
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
  )
}

export default function LoginVIew({login,register}) {
  const [tab, setTab] = useState(0);
 
  return (
    <>
    {tab === 0 ? <TabOne setTab={setTab} /> : <TabTwo setTab={setTab} login={login} register={register} />}
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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    paddingTop: 40,
  },
  inputFormLogin: {
    borderWidth: 2,
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
});
