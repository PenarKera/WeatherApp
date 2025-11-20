import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ActivityIndicator, ScrollView, Keyboard } from "react-native";

const API_KEY = "51d5be8c2480b9dbcdcdba44cbe1d459";

const getWeather = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found or API error");
    const data = await response.json();
    console.log("Weather data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching weather:", error.message);
    return null;
  }
};

const getForecast = async (city) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();
    const daily = data.list.filter((item, index) => index % 8 === 0);
    console.log("Forecast data:", daily);
    return daily;
  } catch (error) {
    console.error("Error fetching forecast:", error.message);
    return null;
  }
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWeatherData = async () => {
    if (!city) return alert("Shkruaj qytetin!");
    setLoading(true);
    const data = await getWeather(city);
    const fcast = await getForecast(city);
    setWeather(data);
    setForecast(fcast || []);
    setLoading(false);
    Keyboard.dismiss(); // Mbyll keyboard pas kërkimit
  };

  const getBackground = () => {
    if (!weather) return "#1E1E1E";
    const main = weather.weather[0].main;
    switch (main) {
      case "Clear": return "#FDB813";
      case "Clouds": return "#6E7F80";
      case "Rain": return "#5DADE2";
      case "Snow": return "#FFFFFF";
      case "Thunderstorm": return "#616A6B";
      default: return "#1E1E1E";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackground() }]}>
      <Text style={styles.title}>Weather App</Text>

      <TextInput
        style={styles.input}
        placeholder="Shkruaj qytetin..."
        placeholderTextColor="#aaa"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={fetchWeatherData} // Enter key kryen search
        returnKeyType="search"
      />

      <TouchableOpacity style={styles.button} onPress={fetchWeatherData}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />}

      {weather && !loading && (
        <View style={styles.weatherBox}>
          <Image
            style={{ width: 100, height: 100 }}
            source={{ uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png` }}
          />
          <Text style={styles.temp}>{weather.main.temp}°C</Text>
          <Text style={styles.desc}>{weather.weather[0].description}</Text>
          <Text style={styles.city}>{weather.name}</Text>
          <Text style={styles.details}>💧 Humidity: {weather.main.humidity}%</Text>
          <Text style={styles.details}>🌬 Wind: {weather.wind.speed} m/s</Text>
          <Text style={styles.details}>🤒 Feels like: {weather.main.feels_like}°C</Text>
        </View>
      )}

      {forecast.length > 0 && !loading && (
        <View style={{ marginTop: 20 }}>
          <Text style={[styles.title, { fontSize: 22 }]}>5-Day Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {forecast.map((day, idx) => (
              <View key={idx} style={styles.card}>
                <Text style={styles.cardDate}>{day.dt_txt.split(" ")[0]}</Text>
                <Image
                  style={{ width: 50, height: 50 }}
                  source={{ uri: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png` }}
                />
                <Text style={styles.cardTemp}>{day.main.temp}°C</Text>
                <Text style={styles.cardDesc}>{day.weather[0].main}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", paddingTop: 60 },
  title: { color: "#FFD700", fontSize: 34, fontWeight: "bold", marginBottom: 20 },
  input: { width: "85%", backgroundColor: "#444", padding: 12, borderRadius: 12, color: "white", marginBottom: 15 },
  button: { backgroundColor: "#1E90FF", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 20, width: "50%", alignItems: "center", marginBottom: 20 },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  weatherBox: { alignItems: "center", padding: 25, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 25, marginTop: 20, shadowColor: "#000", shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 10 },
  temp: { fontSize: 50, color: "#FFFAF0", fontWeight: "bold" },
  desc: { color: "#E0FFFF", fontSize: 22, marginBottom: 10, textTransform: "capitalize" },
  city: { color: "#FFD700", fontSize: 30, marginBottom: 10, fontWeight: "bold" },
  details: { color: "#F0F8FF", fontSize: 18, marginTop: 5 },
  card: { backgroundColor: "rgba(255,255,255,0.2)", padding: 12, marginHorizontal: 6, borderRadius: 15, alignItems: "center", width: 100 },
  cardDate: { color: "#F0F8FF", fontSize: 14, marginBottom: 5 },
  cardTemp: { color: "#FFFAF0", fontSize: 18, fontWeight: "bold" },
  cardDesc: { color: "#E0FFFF", fontSize: 14 },
});
