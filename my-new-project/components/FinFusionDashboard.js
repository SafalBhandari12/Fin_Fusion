import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Button,
  KeyboardAvoidingView,
} from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";

const FinFusionDashboard = ({ route }) => {
  const { name, mynumber } = route.params;
  const [activeSection, setActiveSection] = useState("insights");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatData, setChatData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://finfusion-v2.onrender.com/financial-summary?number=${mynumber}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mynumber]);

  const handleButtonClick = (section) => {
    setActiveSection(section);
  };

  const handleChatButtonClick = (sectionData) => {
    setChatData(sectionData);
    setActiveSection("chatbot");
  };

  const renderSection = () => {
    if (loading) {
      return <Text style={style1.loadingText}>Loading...</Text>;
    }

    switch (activeSection) {
      case "insights":
        return (
          <Insights data={data} onChatButtonClick={handleChatButtonClick} />
        );
      case "chatbot":
        return <Chatbot data={chatData || data} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={style1.dashboardContainer}>
      <Text style={style1.welcomeText}>Welcome, {name}!</Text>

      <View style={style1.buttonContainer}>
        <TouchableOpacity
          style={[
            style1.button,
            activeSection === "insights" && style1.activeButton,
          ]}
          onPress={() => handleButtonClick("insights")}
        >
          <Text style={style1.buttonText}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            style1.button,
            activeSection === "chatbot" && style1.activeButton,
          ]}
          onPress={() => handleButtonClick("chatbot")}
        >
          <Text style={style1.buttonText}>Chatbot</Text>
        </TouchableOpacity>
      </View>

      <View style={style1.sectionContainer}>{renderSection()}</View>
    </SafeAreaView>
  );
};
const style1 = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5", // Very Light Gray
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#E0E0E0", // Light Gray
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: "#9AA6B2", // Updated color for active button
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
  },
  sectionContainer: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
});


// ------------------Insights Component----------------------//

// Insights Component
const Insights = ({ data, onChatButtonClick }) => {
  const pastelColors = [
    "#A7D89F", // Soft green
    "#7A9DB8", // Muted blue
    "#D6C358", // Soft yellow
    "#9A7CC4", // Light purple
    "#B18FD6", // Soft lavender
    "#5B9D9A", // Muted teal
    "#70C4B7", // Light sea green
    "#D16D9C", // Soft pink
    "#A0D8D0", // Pale teal
    "#F28A85", // Soft coral
    "#89C8B6", // Pastel mint
    "#A98DDF", // Light lilac
    "#D1D1A6", // Soft cream
    "#B2D77B", // Soft lime green
    "#6A9FD5", // Soft sky blue
    "#F08080", // Dusty rose
    "#A9E1C2", // Soft aqua
    "#F1A7D0", // Light blush pink
    "#E8A785", // Dusty peach
    "#B2D8B7", // Light moss green
  ];

  return (
    <FlatList
      data={[]} // Empty data array since we're using ListHeaderComponent
      ListHeaderComponent={
        <>
          {data && (
            <>
              {/* Category-wise Spending Pie Chart */}
              <View style={style2.chartContainer}>
                <Text style={style2.chartTitle}>Spending Breakdown</Text>
                <PieChart
                  data={data.breakdown_of_cost.map((item, index) => ({
                    name: item.category,
                    population: item.amount,
                    color: pastelColors[index % pastelColors.length],
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12,
                  }))}
                  width={350}
                  height={200}
                  chartConfig={chartConfig}
                  accessor='population'
                  backgroundColor='transparent'
                  paddingLeft='15'
                />
                <TouchableOpacity
                  style={style2.chatButton}
                  onPress={() => onChatButtonClick(data.breakdown_of_cost)}
                >
                  <Text style={style2.chatButtonText}>Chat about this</Text>
                </TouchableOpacity>
              </View>

              {/* Net Worth Pie Chart */}
              <View style={style2.chartContainer}>
                <Text style={style2.chartTitle}>Net Worth</Text>
                <PieChart
                  data={data.net_worth_value.map((item, index) => ({
                    name: item.asset,
                    population: item.value,
                    color: pastelColors[index % pastelColors.length],
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12,
                  }))}
                  width={350}
                  height={200}
                  chartConfig={chartConfig}
                  accessor='population'
                  backgroundColor='transparent'
                  paddingLeft='15'
                />
                <TouchableOpacity
                  style={style2.chatButton}
                  onPress={() => onChatButtonClick(data.net_worth_value)}
                >
                  <Text style={style2.chatButtonText}>Chat about this</Text>
                </TouchableOpacity>
              </View>

              {/* Portfolio Breakdown Pie Chart */}
              <View style={style2.chartContainer}>
                <Text style={style2.chartTitle}>Portfolio Breakdown</Text>
                <PieChart
                  data={data.portfolio_breakdown.map((item, index) => ({
                    name: item.share,
                    population: item.value,
                    color: pastelColors[index % pastelColors.length],
                    legendFontColor: "#7F7F7F",
                    legendFontSize: 12,
                  }))}
                  width={350}
                  height={200}
                  chartConfig={chartConfig}
                  accessor='population'
                  backgroundColor='transparent'
                  paddingLeft='15'
                />
                <TouchableOpacity
                  style={style2.chatButton}
                  onPress={() => onChatButtonClick(data.portfolio_breakdown)}
                >
                  <Text style={style2.chatButtonText}>Chat about this</Text>
                </TouchableOpacity>
              </View>

              {/* Investment Price vs Current Price Bar Chart */}
              <View style={style2.chartContainer}>
                <Text style={style2.chartTitle}>Investment Performance</Text>
                <BarChart
                  data={{
                    labels: data.performance_metrics.map((item) => item.stock),
                    datasets: [
                      {
                        data: data.performance_metrics.map(
                          (item) => item.investment_price
                        ),
                        color: (opacity = 1) =>
                          `rgba(179, 229, 252, ${opacity})`, // Pastel Blue
                      },
                      {
                        data: data.performance_metrics.map(
                          (item) => item.current_price
                        ),
                        color: (opacity = 1) =>
                          `rgba(255, 205, 210, ${opacity})`, // Pastel Red
                      },
                    ],
                  }}
                  width={350}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    fromZero: true, // Ensure the y-axis starts from 0
                  }}
                  verticalLabelRotation={30}
                  fromZero={true} // Ensure the y-axis starts from 0
                />
                <TouchableOpacity
                  style={style2.chatButton}
                  onPress={() => onChatButtonClick(data.performance_metrics)}
                >
                  <Text style={style2.chatButtonText}>Chat about this</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      }
      keyExtractor={(item, index) => index.toString()}
      renderItem={null} // No items to render
    />
  );
};
const style2 = StyleSheet.create({
  chartContainer: {
    backgroundColor: "#F5F5F5", // Very Light Gray
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  chatButton: {
    backgroundColor: "#E0E0E0", // Light Gray
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButtonText: {
    fontSize: 16,
    color: "#333",
  },
});


//----------------------Insights components ends------------------------//

// --------------------- Chatbot component starts ----------------------//
const Chatbot = ({ data }) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Chatbot: How can I assist you today?", sender: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      const userMessage = `Give me details about my savings and expenses`;
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: "2", text: userMessage, sender: "user" },
      ]);
      sendInitialMessage(userMessage);
    }
  }, [data]);

  const sendInitialMessage = async (initialMessage) => {
    setIsLoading(true);
    const botResponse = await sendMessageToBackend(initialMessage);
    setIsLoading(false);

    const botMessage = {
      id: "3",
      text: botResponse,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const handleUserMessage = async () => {
    if (!userInput.trim()) return;

    const newMessages = [
      ...messages,
      { id: `${messages.length + 1}`, text: userInput, sender: "user" },
    ];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);

    const botResponse = await sendMessageToBackend(userInput);
    setIsLoading(false);

    const botMessage = {
      id: `${messages.length + 2}`,
      text: botResponse,
      sender: "bot",
    };
    setMessages((prevMessages) => [...prevMessages, botMessage]);
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        style3.messageContainer,
        item.sender === "user" ? style3.userMessage : style3.botMessage,
      ]}
    >
      <Text style={style3.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={style3.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={style3.messageList}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {isLoading && (
        <Text style={style3.processingText}>Processing your request...</Text>
      )}

      <View style={style3.inputContainer}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          style={style3.input}
          placeholder='Type your message...'
          placeholderTextColor='#6C757D'
        />
        <Button title='Send' onPress={handleUserMessage} color='#D1D3D4' />
      </View>
    </View>
  );
};

const style3 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    justifyContent: "space-between",
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007BFF",
    borderBottomLeftRadius: 0,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#D1D3D4",
    borderBottomRightRadius: 0,
  },
  messageText: {
    color: "#333333",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Helvetica Neue",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 10,
    fontSize: 16,
    fontFamily: "Helvetica Neue",
    backgroundColor: "#F1F1F1",
  },
  processingText: {
    alignSelf: "flex-end",
    marginHorizontal: 20,
    marginBottom: 10,
    fontSize: 16,
    color: "#6C757D",
  },
});

// Chart Configuration (unchanged)
const chartConfig = {
  backgroundColor: "#F5F5F5", // Very Light Gray
  backgroundGradientFrom: "#F5F5F5",
  backgroundGradientTo: "#F5F5F5",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

//----------------------------Chatbot components ends--------------------//

export default FinFusionDashboard;
