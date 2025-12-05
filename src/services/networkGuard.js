import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";

export const checkConnection = async () => {
  const state = await NetInfo.fetch();

  const isOnline =
    state.isConnected === true &&
    state.isInternetReachable !== false;

  if (!isOnline) {
    Alert.alert(
      "No Internet",
      "Please check your internet connection and try again."
    );
    return false;
  }

  return true;
};
