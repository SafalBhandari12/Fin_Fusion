import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mpin, setMpin] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpData, setSignUpData] = useState({
    mobile_number: "",
    name: "",
    email: "",
    password: "",
    mpin: "",
  });
  const [isTyping, setIsTyping] = useState(false);

  const handleLogin = async () => {
    if (!phoneNumber.trim() || !mpin.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (mpin.length !== 6) {
      Alert.alert("Error", "MPIN must be 6 digits");
      return;
    }

    try {
      const response = await fetch("https://finfusion-v2.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number: phoneNumber,
          mpin: mpin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "BottomNavigation",
              params: {
                name: data.user.name,
                balance: data.user.wallet_amount,
                contacts: data.contacts || [],
                recentContacts: data.recent_contacts || [],
                mynumber: phoneNumber,
              },
            },
          ],
        });
      } else {
        Alert.alert("Error", data.message || "Invalid login");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Try again.");
    }
  };

  const handleSignUp = async () => {
    const { mobile_number, name, email, password, mpin } = signUpData;

    if (
      !mobile_number.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password.trim() ||
      !mpin.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }

    if (mpin.length !== 6) {
      Alert.alert("Error", "MPIN must be 6 digits");
      return;
    }

    try {
      const response = await fetch("https://finfusion-v2.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_number,
          name,
          email: email.toLowerCase(),
          password,
          mpin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Sign-up successful. Please log in.");
        setIsSignUp(false);
      } else {
        Alert.alert("Error", data.message || "Sign-up failed");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inner}>
          <View
            style={[
              styles.logoContainer,
              isTyping && { transform: [{ scale: 0.8 }] },
            ]}
          >
            <Text style={styles.logo}>F</Text>
            <Text style={styles.appName}>FinFusion</Text>
          </View>

          {!isSignUp ? (
            <>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter phone number'
                    keyboardType='phone-pad'
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>6-Digit MPIN</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter MPIN'
                    keyboardType='numeric'
                    secureTextEntry
                    value={mpin}
                    onChangeText={setMpin}
                    maxLength={6}
                    onFocus={() => setIsTyping(true)}
                    onBlur={() => setIsTyping(false)}
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                >
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>New to FinFusion?</Text>
                <TouchableOpacity onPress={() => setIsSignUp(true)}>
                  <Text style={styles.signupText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter your name'
                    value={signUpData.name}
                    onChangeText={(text) =>
                      setSignUpData({ ...signUpData, name: text })
                    }
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter your email'
                    keyboardType='email-address'
                    value={signUpData.email}
                    onChangeText={(text) =>
                      setSignUpData({ ...signUpData, email: text })
                    }
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter phone number'
                    keyboardType='phone-pad'
                    value={signUpData.mobile_number}
                    onChangeText={(text) =>
                      setSignUpData({ ...signUpData, mobile_number: text })
                    }
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter password'
                    secureTextEntry
                    value={signUpData.password}
                    onChangeText={(text) =>
                      setSignUpData({ ...signUpData, password: text })
                    }
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>6-Digit MPIN</Text>
                  <TextInput
                    style={styles.input}
                    placeholder='Enter MPIN'
                    keyboardType='numeric'
                    secureTextEntry
                    value={signUpData.mpin}
                    onChangeText={(text) =>
                      setSignUpData({ ...signUpData, mpin: text })
                    }
                    maxLength={6}
                    placeholderTextColor='#A0A0A0'
                  />
                </View>

                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleSignUp}
                >
                  <Text style={styles.loginButtonText}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity onPress={() => setIsSignUp(false)}>
                  <Text style={styles.signupText}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
  },
  inner: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#0078FF",
  },
  appName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  loginButton: {
    backgroundColor: "#0078FF",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#555",
  },
  signupText: {
    fontSize: 14,
    color: "#0078FF",
    fontWeight: "600",
    marginTop: 5,
  },
});

export default LoginScreen;
