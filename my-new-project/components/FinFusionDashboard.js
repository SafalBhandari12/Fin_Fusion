import React from "react";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";

const FinFusionDashboard = ({ route }) => {
  const { name, balance } = route.params;

  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <Text style={styles.welcomeText}>FinFusion Dashboard - {name}</Text>
      <View style={styles.cardContainer}>
        <Text>Total Savings: ₹{balance.toLocaleString()}</Text>
        <Text>Monthly Expenses: ₹15,000</Text>
        <Text>Savings Rate: 35%</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  cardContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: 20,
  },
});

export default FinFusionDashboard;