import React, { useState } from "react";
import { View, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import PaymentDashboard from "./PaymentDashboard";
import ShareDashboard from "./ShareDashboard";
import FinFusionDashboard from "./FinFusionDashboard";
import Icon from "react-native-vector-icons/MaterialIcons";

const BottomNavigation = ({ route }) => {
  const [activeTab, setActiveTab] = useState("Payment");
  const {
    name,
    balance,
    contacts = [],
    recentContacts = [],
    mynumber,
  } = route.params;

  const renderContent = () => {
    switch (activeTab) {
      case "Payment":
        return (
          <PaymentDashboard
            route={{
              params: {
                name,
                balance,
                contacts,
                recent_contacts: recentContacts,
                mynumber,
              },
            }}
          />
        );
      case "Shares":
        return <ShareDashboard route={{ params: { name, balance,mynumber } }} />;
      case "FinFusion":
        return <FinFusionDashboard route={{ params: { name, balance } }} />;
      default:
        return <PaymentDashboard route={{ params: { name, balance } }} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle='dark-content' />
      {renderContent()}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeTab === "Payment" && styles.activeNavButton,
          ]}
          onPress={() => setActiveTab("Payment")}
        >
          <Icon
            name='payment'
            size={30}
            color={activeTab === "Payment" ? "#000000" : "#D3D3D3"} // light gray for unselected
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeTab === "Shares" && styles.activeNavButton,
          ]}
          onPress={() => setActiveTab("Shares")}
        >
          <Icon
            name='trending-up'
            size={30}
            color={activeTab === "Shares" ? "#000000" : "#D3D3D3"} // light gray for unselected
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.navButton,
            activeTab === "FinFusion" && styles.activeNavButton,
          ]}
          onPress={() => setActiveTab("FinFusion")}
        >
          <Icon
            name='analytics'
            size={30}
            color={activeTab === "FinFusion" ? "#000000" : "#D3D3D3"} // light gray for unselected
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    zIndex:1,
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
    borderRadius: 30, // Make the background round
  },
  activeNavButton: {
    backgroundColor: "#D3D3D3", // light gray background when active
    borderRadius: 30, // Keep the background rounded when active
  },
});

export default BottomNavigation;
