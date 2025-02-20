import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  RefreshControl,
} from "react-native";

const PaymentDashboard = ({ route }) => {
  const {
    name,
    balance: initialBalance,
    contacts,
    recent_contacts,
    mynumber,
  } = route.params;
  const [selectedContact, setSelectedContact] = useState(null);
  const [mpin, setMpin] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(""); // Default category
  const [balance, setBalance] = useState(initialBalance);
  const [showBalance, setShowBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // New state for refresh control

  // Animations
  const balanceAnimation = useRef(new Animated.Value(0)).current;
  const contactScaleAnimation = useRef(new Animated.Value(1)).current;
  const transactionBoxAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(balanceAnimation, {
      toValue: 1,
      duration: 1000,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleContactPress = (contact) => {
    const newSelectedContact = contact === selectedContact ? null : contact;
    setSelectedContact(newSelectedContact);

    // Animate contact selection
    Animated.parallel([
      Animated.spring(contactScaleAnimation, {
        toValue: newSelectedContact ? 1.05 : 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(transactionBoxAnimation, {
        toValue: newSelectedContact ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSend = async () => {
    if (!mpin || !amount || !category) {
      Alert.alert("Error", "Please enter MPIN, amount, and category.");
      return;
    }

    if (!selectedContact) {
      Alert.alert("Error", "Please select a contact.");
      return;
    }

    const payload = {
      sender_mobile_number: mynumber,
      receiver_mobile_number: selectedContact.mobile_number,
      amount: parseFloat(amount),
      category: category, // Include category in the payload
    };

    try {
      const response = await fetch(
        "https://finfusion-v2.onrender.com/transfer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          "Success",
          `₹${amount} sent successfully to ${selectedContact.name}.`
        );

        // Update balance with animation
        const newBalance = balance - parseFloat(amount);
        Animated.timing(balanceAnimation, {
          toValue: newBalance / initialBalance,
          duration: 1000,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
          useNativeDriver: true,
        }).start(() => {
          setBalance(newBalance);
        });
      } else {
        Alert.alert(
          "Error",
          data.message || "Failed to complete the transaction."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while processing the transaction."
      );
      console.error("Transaction Error:", error);
    }

    // Reset fields and close the box
    handleContactPress(selectedContact);
    setMpin("");
    setAmount("");
    setCategory("General"); // Reset category to default
  };

  const contactInitials = (name) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  const renderContactItem = ({ item }) => {
    const isSelected = selectedContact === item;
    const contactScale = contactScaleAnimation.interpolate({
      inputRange: [1, 1.05],
      outputRange: [1, 1.05],
    });

    return (
      <Animated.View
        style={[
          styles.contactContainer,
          {
            transform: [{ scale: contactScale }],
            opacity: balanceAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.contactItem, isSelected && styles.selectedContactItem]}
          onPress={() => handleContactPress(item)}
        >
          <View
            style={[
              styles.contactLogo,
              { backgroundColor: isSelected ? "#E0E0E0" : "#F5F5F5" },
            ]}
          >
            <Text style={styles.contactInitials}>
              {contactInitials(item.name)}
            </Text>
          </View>
          <View style={styles.contactDetails}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactNumber}>{item.mobile_number}</Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <Animated.View
            style={[
              styles.transactionBox,
              {
                transform: [
                  {
                    scale: transactionBoxAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
                opacity: transactionBoxAnimation,
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder='Enter MPIN'
              placeholderTextColor='#666'
              secureTextEntry
              value={mpin}
              onChangeText={setMpin}
            />
            <TextInput
              style={styles.input}
              placeholder='Enter Amount'
              placeholderTextColor='#666'
              keyboardType='numeric'
              value={amount}
              onChangeText={setAmount}
            />
            <TextInput
              style={styles.input}
              placeholder='Enter Category'
              placeholderTextColor='#666'
              value={category}
              onChangeText={setCategory}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  const fetchBalance = async () => {
    try {
      const response = await fetch(
        "https://finfusion-v2.onrender.com/get_wallet_amount",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mobile_number: mynumber }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBalance(data.wallet_amount);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch balance.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while fetching balance.");
      console.error("Balance Fetch Error:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);

    // Fetch the updated balance
    fetchBalance();

    // Reset all states
    setSelectedContact(null);
    setMpin("");
    setAmount("");
    setCategory("");

    // Simulate a network request or any async operation
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Redesigned Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: balanceAnimation,
              transform: [
                {
                  translateY: balanceAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greetingText}>Welcome</Text>
              <Text style={styles.nameText}>{name}</Text>
            </View>
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Animated.Text
                style={[
                  styles.balanceAmount,
                  {
                    transform: [
                      {
                        scale: balanceAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                ₹{showBalance ? balance.toFixed(2) : "****"}
              </Animated.Text>
              <TouchableOpacity
                style={styles.balanceVisibilityButton}
                onPress={() => setShowBalance(!showBalance)}
              >
                <Text style={styles.balanceVisibilityText}>
                  {showBalance ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Recent and All Contacts Sections */}
        {(recent_contacts?.length > 0 || contacts?.length > 0) && (
          <View style={styles.contactsSections}>
            {recent_contacts?.length > 0 && (
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>Recent Contacts</Text>
                <View style={styles.contactSectionBackground}>
                  <FlatList
                    data={recent_contacts}
                    renderItem={renderContactItem}
                    keyExtractor={(item) => item.mobile_number}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            )}

            {contacts?.length > 0 && (
              <View style={styles.contactSection}>
                <Text style={styles.sectionTitle}>All Contacts</Text>
                <View style={styles.contactSectionBackground}>
                  <FlatList
                    data={contacts}
                    renderItem={renderContactItem}
                    keyExtractor={(item) => item.mobile_number}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  nameText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
  },
  balanceContainer: {
    alignItems: "flex-end",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  balanceVisibilityButton: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  balanceVisibilityText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  contactsSections: {
    paddingHorizontal: 15,
  },
  contactSection: {
    marginBottom: 20,
  },
  contactSectionBackground: {
    backgroundColor: "#F8F8F8", // Very light gray background
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  contactContainer: {
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedContactItem: {
    borderWidth: 1,
    borderColor: "#000",
  },
  contactLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contactInitials: {
    color: "#000",
    fontWeight: "700",
    fontSize: 20,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  contactNumber: {
    fontSize: 14,
    color: "#666",
  },
  transactionBox: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 15,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: "#FFFFFF",
    color: "#000",
    fontSize: 16,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sendButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default PaymentDashboard;
