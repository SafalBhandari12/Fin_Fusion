import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Easing,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Button,
} from "react-native";
import { Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons"; // Importing MaterialIcons for arrow icon
import Markdown from "react-native-markdown-display";

// ------------My Portfolio-------------------------//
const MyPortfolio = ({ mynumber }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(
        "https://finfusion-v2.onrender.com/portfolio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobile_number: mynumber }),
        }
      );

      const data = await response.json();
      setPortfolio(data.portfolio || []);
      setLoading(false);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to fetch portfolio.");
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [mynumber]);

  const toggleExpand = (symbol) => {
    setExpanded((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleTransaction = async (
    type,
    stockSymbol,
    companyName,
    quantity,
    pricePerShare
  ) => {
    const endpoint = type === "buy" ? "/buy_stock" : "/sell_stock";

    console.log("Transaction initiated:", {
      type,
      stockSymbol,
      companyName,
      quantity,
      pricePerShare,
    });

    try {
      const response = await fetch(
        `https://finfusion-v2.onrender.com${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mobile_number: String(mynumber), // Ensure this matches the backend field name
            stock_symbol: String(stockSymbol), // Ensure this matches the backend field name
            company_name: String(companyName), // Ensure this matches the backend field name
            quantity: Integer(quantity), // Ensure this is a number
            price_per_share: parseFloat(pricePerShare), // Ensure this is a number
          }),
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        Alert.alert(
          "Success",
          `${type === "buy" ? "Bought" : "Sold"} successfully.`
        );
        // Refetch the portfolio to reflect the changes
        fetchPortfolio();
      } else {
        Alert.alert("Error", data.message || "Transaction failed.");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };
  const reduceDataPoints = (data, skip = 5) => {
    return data.filter((_, index) => index % skip === 0);
  };

  const renderPortfolioItem = ({ item }) => {
    const isExpanded = expanded[item.Symbol];

    let graphData = { labels: [], datasets: [] };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.getDate();
    };

    if (selectedPeriod === "day") {
      const reducedDailyData = reduceDataPoints(item.ShowMore.Graph.Daily, 5);
      graphData = {
        labels: reducedDailyData.map((entry) => formatDate(entry.Time)),
        datasets: [
          {
            data: reducedDailyData.map((entry) => entry.Price),
            color: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    } else if (selectedPeriod === "week") {
      const reducedWeeklyData = reduceDataPoints(item.ShowMore.Graph.Weekly, 2);
      graphData = {
        labels: reducedWeeklyData.map((_, index) => `${index + 1}`),
        datasets: [
          {
            data: reducedWeeklyData.map((entry) => entry.Price),
            color: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    } else if (selectedPeriod === "month") {
      const reducedMonthlyData = reduceDataPoints(
        item.ShowMore.Graph.Monthly,
        3
      );
      graphData = {
        labels: reducedMonthlyData.map((entry) => formatDate(entry.Time)),
        datasets: [
          {
            data: reducedMonthlyData.map((entry) => entry.Price),
            color: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }

    return (
      <Animated.View style={[style1.card, { opacity: fadeAnim }]}>
        <View style={style1.header}>
          <Ionicons name='business' size={24} color='black' />
          <Text style={style1.companyName}>{item.Name}</Text>
        </View>
        <View style={style1.details}>
          <Text style={style1.text}>
            Total Value:{" "}
            <Text style={style1.textBold}>{item["Total Price"]}</Text>
          </Text>
          <Text style={style1.text}>
            Price Per Share:{" "}
            <Text style={style1.textBold}>{item["Price Per Share"]}</Text>
          </Text>
          <Text style={style1.text}>
            Shares:{" "}
            <Text style={style1.textBold}>{item["Number of Shares"]}</Text>
          </Text>
          <Text style={style1.text}>
            Market Sentiment:{" "}
            <Text style={style1.textBold}>{item["Market Sentiment"]}</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={style1.showMoreButton}
          onPress={() => toggleExpand(item.Symbol)}
        >
          <Text style={style1.showMoreText}>
            {isExpanded ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={style1.extraInfo}>
            <Text style={style1.extraHeader}>Additional Information:</Text>
            <Text style={style1.text}>
              Last Refreshed: {item["Last Refreshed"]}
            </Text>
            <Text style={style1.text}>Time Zone: {item["Time Zone"]}</Text>
            <Text style={style1.text}>
              Additional Info: {item["Text Info"]}
            </Text>

            <View style={style1.periodButtons}>
              <TouchableOpacity
                onPress={() => handlePeriodChange("day")}
                style={style1.periodButton}
              >
                <Text style={style1.periodButtonText}>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodChange("week")}
                style={style1.periodButton}
              >
                <Text style={style1.periodButtonText}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodChange("month")}
                style={style1.periodButton}
              >
                <Text style={style1.periodButtonText}>Month</Text>
              </TouchableOpacity>
            </View>

            <Text style={style1.text}>Stock Price Over Time:</Text>
            <LineChart
              data={graphData}
              width={300}
              height={200}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  fontSize: 10,
                  fontWeight: "bold",
                },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              withDots={true}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              segments={5}
            />

            <View style={style1.buttonContainer}>
              <TouchableOpacity
                style={style1.buyButton}
                onPress={() =>
                  handleTransaction(
                    "buy",
                    item.Symbol,
                    item.Name,
                    1,
                    item["Price Per Share"]
                  )
                }
              >
                <Text style={style1.buttonText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={style1.sellButton}
                onPress={() =>
                  handleTransaction(
                    "sell",
                    item.Symbol,
                    item.Name,
                    1,
                    item["Price Per Share"]
                  )
                }
              >
                <Text style={style1.buttonText}>Sell</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <FlatList
      contentContainerStyle={style1.contentContainer}
      data={portfolio}
      renderItem={renderPortfolioItem}
      keyExtractor={(item) => item.Symbol}
      ListHeaderComponent={
        <View style={style1.headerContainer}>
          <Text style={style1.sectionText}>My Portfolio</Text>
        </View>
      }
    />
  );
};

const style1 = StyleSheet.create({
  contentContainer: {
    backgroundColor: "#F8F8F8",
    padding: 20,
    borderRadius: 20,
  },
  sectionText: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  headerContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginVertical: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "600",
    marginLeft: 10,
    color: "#333",
  },
  details: {
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  textBold: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  showMoreButton: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#D3D3D3",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  showMoreText: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 14,
  },
  extraInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  extraHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  periodButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  periodButton: {
    backgroundColor: "#D3D3D3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  periodButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  sellButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

//-------------------------My Portfolio ends ----------------------//

// --------------------Explore Companies start----------------------//
const ExploreCompanies = ({ onSendPayload }) => {
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://finfusion-v2.onrender.com/explore")
      .then((response) => response.json())
      .then((data) => {
        if (data.categories) {
          setCategories(Object.entries(data.categories));
        } else {
          setError("Failed to fetch data.");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("An error occurred while fetching data.");
        setLoading(false);
      });
  }, []);

  const toggleCategory = (categoryName) => {
    setExpandedCategory(
      expandedCategory === categoryName ? null : categoryName
    );
  };

  const renderCompany = ({ item }) => (
    <View style={style2.companyContainer}>
      <Text style={[style2.companyName, style2.boldText]}>
        {item.company_name}
      </Text>
      <Text style={style2.tickerSymbol}>
        <Text style={style2.boldText}>Ticker: </Text>
        {item.ticker_symbol}
      </Text>
      <Text style={style2.companyInfo}>{item.information}</Text>
      {/* Add Chat Button */}
      <TouchableOpacity
        style={style2.chatButton}
        onPress={() => onSendPayload(item.company_name, item.ticker_symbol)}
      >
        <Text style={style2.chatButtonText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCategory = ({ item }) => {
    const [categoryName, companies] = item;
    const isExpanded = expandedCategory === categoryName;

    const rotateAnim = new Animated.Value(0); // For the rotation animation

    const toggleAnimation = () => {
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };

    toggleAnimation(); // Trigger the rotation animation on toggle

    const rotateDeg = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "180deg"], // Rotate from 0 to 180 degrees
    });

    return (
      <View style={style2.categoryContainer}>
        <TouchableOpacity
          onPress={() => toggleCategory(categoryName)}
          style={[
            style2.categoryButton,
            isExpanded ? style2.expandedCategory : null,
          ]}
        >
          <Text
            style={[style2.sectionText, isExpanded ? style2.boldText : null]}
          >
            {categoryName}
          </Text>

          <Animated.View
            style={{ transform: [{ rotate: rotateDeg }] }} // Apply rotation to the arrow
          >
            <MaterialIcons
              name='keyboard-arrow-down'
              size={24}
              color='#34495E'
            />
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <Animated.View style={[style2.expandedContainer]}>
            <FlatList
              data={companies}
              renderItem={renderCompany}
              keyExtractor={(company) => company.company_name}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  if (loading) {
    return <Text style={style2.loadingText}>Loading...</Text>;
  }

  if (error) {
    return <Text style={style2.errorText}>{error}</Text>;
  }

  return (
    <FlatList
      data={categories}
      renderItem={renderCategory}
      keyExtractor={(item) => item[0]}
    />
  );
};

const style2 = StyleSheet.create({
  categoryContainer: {
    backgroundColor: "#F7F9FC", // Softer white background
    padding: 16,
    width: "90%",
    borderRadius: 15,
    marginBottom: 16,
    alignSelf: "center",
    shadowColor: "#4A6D7C",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  expandedCategory: {
    backgroundColor: "#F0F2F4", // Light greyish color
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
  },
  boldText: {
    fontWeight: "700",
    color: "#1A5F7A",
  },
  expandedContainer: {
    overflow: "hidden",
    marginTop: 8,
  },
  companyContainer: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    width: "90%",
    borderRadius: 15,
    marginBottom: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E6E9EC",
    alignSelf: "center",
    shadowColor: "#4A6D7C",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  companyName: {
    fontSize: 16,
    color: "#2C3E50",
    marginBottom: 4,
    fontWeight: "700",
  },
  tickerSymbol: {
    fontSize: 14,
    color: "#4A6D7C",
    marginBottom: 8,
    backgroundColor: "#F0F2F4", // Light greyish color
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  companyInfo: {
    fontSize: 14,
    color: "#5A6B7D",
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#4A6D7C",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "#D9534F",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
  },
  chatButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#2980B9",
    borderRadius: 8,
    alignSelf: "flex-start",
    shadowColor: "#2980B9",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
// ---------------explore company ends--------------------//

// -----------------chatbot starts
const sendMessageToBackend = async (message, mynumber) => {
  try {
    // Step 1: Fetch financial summary data
    const financialSummaryResponse = await fetch(
      "https://finfusion-v2.onrender.com/financial-summary",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile_number: String(mynumber) }),
      }
    );

    if (!financialSummaryResponse.ok) {
      console.error(
        "Failed to fetch financial summary data",
        financialSummaryResponse.status
      );
      throw new Error("Failed to fetch financial summary data");
    }

    const financialSummaryData = await financialSummaryResponse.json();
    console.log("Financial Summary Data:", financialSummaryData);

    // Append financial summary to the message for the first query
    const enrichedMessage = `${message}\n\n**Financial Summary:**\n${JSON.stringify(
      financialSummaryData,
      null,
      2
    )}`;

    // Step 2: Send the financial summary data along with the message to the Vext API endpoint
const response = await fetch(
  `https://payload.vextapp.com/hook/HGIJ6CJBFG/catch/1`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Apikey: "Api-Key BkYXg9W6.bwYBTTkbW5bjwlyWJumCQmjKwjBKGC5n",
    },
    body: JSON.stringify({
      payload: enrichedMessage,
    }),
  }
);

    if (!response.ok) {
      console.error("Failed to send message to Vext API", response.status);
      throw new Error("Failed to send message to Vext API");
    }

    const data = await response.json();
    console.log(data);
    return data.text;
  } catch (error) {
    console.error("Error sending message:", error);
    return "Sorry, there was an error processing your request.";
  }
};

const ChatBot = ({ payload, mynumber }) => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello, how can I assist you today?", sender: "bot" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (payload && payload.company_name) {
      const userMessage = `Give me detail about ${payload.company_name}`;

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: "2", text: userMessage, sender: "user" },
      ]);
      sendInitialMessage(userMessage);
    }
  }, [payload]);

  const sendInitialMessage = async (initialMessage) => {
    setIsLoading(true);
    const botResponse = await sendMessageToBackend(initialMessage, mynumber);
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

    const botResponse = await sendMessageToBackend(userInput, mynumber);
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
        style.messageContainer,
        item.sender === "user" ? style.userMessage : style.botMessage,
      ]}
    >
      <Markdown style={markdownStyles}>{item.text}</Markdown>
    </View>
  );

  return (
    <View style={style.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={style.messageList}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {isLoading && (
        <View style={style.loadingContainer}>
          <ActivityIndicator size='small' color='#007BFF' />
          <Text style={style.processingText}>Processing your request...</Text>
        </View>
      )}

      <View style={style.inputContainer}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          style={style.input}
          placeholder='Type your message...'
          placeholderTextColor='#6C757D'
        />
        <Button title='Send' onPress={handleUserMessage} color='#007BFF' />
      </View>
    </View>
  );
};

// Markdown styling
const markdownStyles = {
  body: { color: "#333333", fontSize: 16, fontFamily: "Helvetica Neue" },
  strong: { fontWeight: "bold" },
  em: { fontStyle: "italic" },
  bullet_list: { marginVertical: 5 },
  ordered_list: { marginVertical: 5 },
  list_item: { flexDirection: "row", alignItems: "center" },
  paragraph: { marginVertical: 5 },
};

// Chat styles
const style = StyleSheet.create({
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
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  processingText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#6C757D",
  },
});
// ------------------------Chatbot ends-------------//

const ShareDashboard = ({ route }) => {
  const { name, mynumber } = route.params;
  const [activeSection, setActiveSection] = useState("MyPortfolio");
  const [payload, setPayload] = useState(null); // State to hold the payloa

  const handleSendPayload = (company_name, ticker) => {
    setPayload({ company_name, ticker }); // Update payload
    setActiveSection("ChatBot"); // Switch to ChatBot section
  };

  const renderSection = () => {
    switch (activeSection) {
      case "MyPortfolio":
        return <MyPortfolio mynumber={mynumber} />;
      case "ExploreCompanies":
        return (
          <ExploreCompanies
            onSendPayload={handleSendPayload} // Pass the handler to ExploreCompanies
          />
        );
      case "ChatBot":
        return <ChatBot payload={payload} mynumber={mynumber} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.dashboardContainer}>
      <Text style={styles.welcomeText}>Share Dashboard - {name}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            activeSection === "MyPortfolio" && styles.activeButton,
          ]}
          onPress={() => setActiveSection("MyPortfolio")}
        >
          <Text style={styles.buttonText}>My Portfolio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            activeSection === "ExploreCompanies" && styles.activeButton,
          ]}
          onPress={() => setActiveSection("ExploreCompanies")}
        >
          <Text style={styles.buttonText}>Explore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            activeSection === "ChatBot" && styles.activeButton,
          ]}
          onPress={() => setActiveSection("ChatBot")}
        >
          <Text style={styles.buttonText}>ChatBot</Text>
        </TouchableOpacity>
      </View>

      {renderSection()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    padding: 20,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#9AA6B2",
  },
  buttonText: {
    color: "#333",
    fontWeight: "600",
  },
});

export default ShareDashboard;
