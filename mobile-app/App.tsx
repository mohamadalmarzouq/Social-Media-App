import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LandingScreen from './src/screens/LandingScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import CreateContestScreen from './src/screens/CreateContestScreen';
import ContestDetailsScreen from './src/screens/ContestDetailsScreen';
import ReviewSubmissionsScreen from './src/screens/ReviewSubmissionsScreen';
import SubmissionDetailScreen from './src/screens/SubmissionDetailScreen';
import WorkScreen from './src/screens/WorkScreen';

// Import context
import { AuthProvider } from './src/context/AuthContext';

export type RootStackParamList = {
  Landing: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Dashboard: undefined;
  CreateContest: undefined;
  ContestDetails: { contestId: string };
  ReviewSubmissions: { contestId: string };
  SubmissionDetail: { submissionId: string; contestId: string };
  Work: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Landing"
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          >
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="CreateContest" component={CreateContestScreen} />
            <Stack.Screen name="ContestDetails" component={ContestDetailsScreen} />
            <Stack.Screen name="ReviewSubmissions" component={ReviewSubmissionsScreen} />
            <Stack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} />
            <Stack.Screen name="Work" component={WorkScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
