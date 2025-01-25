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
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from '@expo/vector-icons'; // Importing MaterialIcons for arrow icon


// ------------My Portfolio-------------------------//
const MyPortfolio = ({ mynumber }) => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
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
        console.log(data);
        setPortfolio(data.portfolio || []);
        setLoading(false);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [mynumber]);

  const toggleExpand = (symbol) => {
    setExpanded((prev) => ({
      ...prev,
      [symbol]: !prev[symbol],
    }));
  };

  const handlePeriodChange = (period, symbol) => {
    setSelectedPeriod(period);
  };

  const renderPortfolioItem = ({ item }) => {
    const isExpanded = expanded[item.Symbol];

    // Prepare chart data based on selected period
    let graphData = { labels: [], datasets: [] };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.getDate(); // Extract day, week, or month depending on the period
    };

    if (selectedPeriod === "day") {
      graphData = {
        labels: item.ShowMore.Graph.Daily.map((entry) =>
          formatDate(entry.Time)
        ),
        datasets: [
          {
            data: item.ShowMore.Graph.Daily.map((entry) => entry.Price),
            color: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    } else if (selectedPeriod === "week") {
      graphData = {
        labels: item.ShowMore.Graph.Weekly.map(
          (entry, index) => `Week ${index + 1}`
        ),
        datasets: [
          {
            data: item.ShowMore.Graph.Weekly.map((entry) => entry.Price),
            color: (opacity = 1) => `rgba(169, 169, 169, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    } else if (selectedPeriod === "month") {
      graphData = {
        labels: item.ShowMore.Graph.Monthly.map((entry) =>
          formatDate(entry.Time)
        ),
        datasets: [
          {
            data: item.ShowMore.Graph.Monthly.map((entry) => entry.Price),
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
          {loading ? (
            <Animated.Text
              style={[
                style1.companyName,
                { opacity: fadeAnim, transform: [{ translateY: fadeAnim }] },
              ]}
            >
              Loading...
            </Animated.Text>
          ) : (
            <Text style={style1.companyName}>{item.Name}</Text>
          )}
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
              Last Refreshed:{" "}
              <Text style={style1.textBold}>{item["Last Refreshed"]}</Text>
            </Text>
            <Text style={style1.text}>
              Time Zone:{" "}
              <Text style={style1.textBold}>{item["Time Zone"]}</Text>
            </Text>
            <Text style={style1.text}>
              Additional Info:{" "}
              <Text style={style1.textBold}>{item["Text Info"]}</Text>
            </Text>

            <View style={style1.periodButtons}>
              <TouchableOpacity
                onPress={() => handlePeriodChange("day", item.Symbol)}
                style={style1.periodButton}
              >
                <Text style={style1.periodButtonText}>Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodChange("week", item.Symbol)}
                style={style1.periodButton}
              >
                <Text style={style1.periodButtonText}>Week</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodChange("month", item.Symbol)}
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
                style: {
                  borderRadius: 16,
                },
              }}
              withDots={false}
              withInnerLines={false}
            />

            <View style={style1.buttonContainer}>
              <TouchableOpacity style={style1.buyButton}>
                <Text style={style1.buttonText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={style1.sellButton}>
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
    marginBottom: 122,
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
        onPress={() =>
          onSendPayload(item.company_name, item.ticker_symbol)
        }
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
              name="keyboard-arrow-down"
              size={24}
              color="#34495E"
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
    backgroundColor: "#D3D3D3", // Light gray
    padding: 12, // Reduced padding
    width: "90%", // Reduced width to make it smaller
    borderRadius: 10,
    marginBottom: 12, // Adjusted margin for a smaller container
    alignSelf: "center", // Centers the container horizontally
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12, // Reduced vertical padding
    paddingHorizontal: 18, // Reduced horizontal padding
    borderRadius: 8,
  },
  expandedCategory: {
    backgroundColor: "#D3D3D3", // Gray
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "normal", // Default to normal weight
    color: "#2C3E50", // Dark gray for text
  },
  boldText: {
    fontWeight: "bold", // Make text bold
  },
  expandedContainer: {
    overflow: "hidden",
  },
  companyContainer: {
    backgroundColor: "#FBFBFB", // White background
    padding: 10, // Reduced padding for company container
    width: "90%", // Reduced width to make it smaller
    borderRadius: 8,
    marginBottom: 10, // Adjusted margin for smaller container
    marginTop: 8, // Reduced margin for smaller container
    borderWidth: 0.5,
    borderColor: "#BDC3C7", // Light gray border
    alignSelf: "center", // Centers the container horizontally
  },
  companyName: {
    fontSize: 16,
    color: "#2C3E50", // Dark gray
  },
  tickerSymbol: {
    fontSize: 14,
    color: "#7F8C8D", // Gray
  },
  companyInfo: {
    fontSize: 14,
    color: "#95A5A6", // Light gray
  },
  loadingText: {
    fontSize: 18,
    color: "#7F8C8D", // Gray for loading text
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#E74C3C", // Red color for errors
    textAlign: "center",
    marginTop: 20,
  },
  chatButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#3498DB", // Blue color
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  chatButtonText: {
    color: "#FFFFFF", // White text
    fontWeight: "bold",
  },
});
// ---------------explore company ends--------------------//



// -----------------chatbot starts

const sendMessageToBackend = async (message) => {
  try {
    const response = await fetch(
      `https://payload.vextapp.com/hook/QTC6XOCPXP/catch/1`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Apikey: "Api-Key Amf3m7Z6.8B0H3uvB404FmpDHLjRXyNu5pO2LZ0Oy",
        },
        body: JSON.stringify({
          payload: message,
        }),
      }
    );
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error sending message:", error);
    return "Sorry, there was an error processing your request.";
  }
};

const ChatBot = ({ payload }) => {
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
        style.messageContainer,
        item.sender === "user" ? style.userMessage : style.botMessage,
      ]}
    >
      <Text style={style.messageText}>{item.text}</Text>
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
        <Text style={style.processingText}>Processing your request...</Text>
      )}

      <View style={style.inputContainer}>
        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          style={style.input}
          placeholder='Type your message...'
          placeholderTextColor='#6C757D'
        />
        <Button title='Send' onPress={handleUserMessage} color='#D1D3D4' />
      </View>
    </View>
  );
};

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
        return <ChatBot payload={payload}/>;
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
