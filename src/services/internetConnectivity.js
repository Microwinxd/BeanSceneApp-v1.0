import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";

export default function InternetConnectivity() {
  const [hasInternet, setHasInternet] = useState(null); // ✅ IMPORTANT: start as null

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline =
        state.isConnected === true &&
        state.isInternetReachable !== false; // ✅ REAL INTERNET CHECK

      setHasInternet(isOnline);
    });

    return () => unsubscribe();
  }, []);

  // ✅ While checking initial network state, don't show anything
  if (hasInternet === null) return null;

  // ✅ STAYS VISIBLE THE WHOLE TIME UNTIL REAL INTERNET RETURNS
  if (hasInternet) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚠️ No Internet Connection</Text>
      <Text style={styles.subtext}>Some features may not work</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 55,
    backgroundColor: "#d9534f",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
    elevation: 20
  },
  text: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14
  },
  subtext: {
    color: "white",
    fontSize: 11
  }
});
