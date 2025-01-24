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
                mynumber:phoneNumber,
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

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.inner}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>F</Text>
            <Text style={styles.appName}>FinFusion</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder='Enter phone number'
                keyboardType='phone-pad'
                value={phoneNumber}
                onChangeText={setPhoneNumber}
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
                placeholderTextColor='#A0A0A0'
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to FinFusion?</Text>
            <TouchableOpacity>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2196F3",
    backgroundColor: "#E3F2FD",
    width: 80,
    height: 80,
    textAlign: "center",
    lineHeight: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  formContainer: {
    marginTop: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333333",
  },
  loginButton: {
    height: 50,
    backgroundColor: "#2196F3",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  footerText: {
    color: "#666666",
    marginRight: 8,
  },
  signupText: {
    color: "#2196F3",
    fontWeight: "600",
  },
});

export default LoginScreen;
