import AsyncStorage from '@react-native-async-storage/async-storage';

export const setToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem("@token", token);
};

export const getToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem("@token");
};

export const clearToken = async (): Promise<void> => {
  await AsyncStorage.removeItem("@token");
};
