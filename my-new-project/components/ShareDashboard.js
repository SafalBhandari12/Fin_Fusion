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
  TestInput,
  ActivityIndicator
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

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
const ExploreCompanies = () => {
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
      <Text style={style2.companyName}>{item.company_name}</Text>
      <Text style={style2.tickerSymbol}>Ticker: {item.ticker_symbol}</Text>
      <Text style={style2.companyInfo}>{item.information}</Text>
    </View>
  );

  const renderCategory = ({ item }) => {
    const [categoryName, companies] = item;
    const isExpanded = expandedCategory === categoryName;

    return (
      <View style={style2.categoryContainer}>
        <TouchableOpacity
          onPress={() => toggleCategory(categoryName)}
          style={[
            style2.categoryButton,
            isExpanded ? style2.expandedCategory : null,
          ]}
        >
          <Text style={style2.sectionText}>{categoryName}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={style2.expandedContainer}>
            <FlatList
              data={companies}
              renderItem={renderCompany}
              keyExtractor={(company) => company.company_name}
            />
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
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
    backgroundColor: "#9AA6B2",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  categoryButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  expandedCategory: {
    backgroundColor: "#BDC3C7",
  },
  sectionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#34495E",
  },
  expandedContainer: {
    overflow: "hidden",
  },
  companyContainer: {
    backgroundColor: "#FBFBFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    marginTop: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#34495E",
  },
  tickerSymbol: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 6,
    color: "#5D6D7E",
  },
  companyInfo: {
    fontSize: 14,
    color: "#626567",
  },
});
// ---------------explore company ends--------------------//



// -----------------chatbot starts
const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello, how can I help you?", sender: "bot" },
  ]);

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
      />
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007BFF",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F0F5",
  },
  messageText: {
    color: "#333333",
  },
});
// ------------------------Chatbot ends-------------//

const ShareDashboard = ({ route }) => {
  const { name, mynumber } = route.params;
  const [activeSection, setActiveSection] = useState("MyPortfolio");

  const renderSection = () => {
    switch (activeSection) {
      case "MyPortfolio":
        return <MyPortfolio mynumber={mynumber} />;
      case "ExploreCompanies":
        return <ExploreCompanies />;
      case "ChatBot":
        return <ChatBot />;
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
