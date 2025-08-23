import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';

type LandingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Landing'>;

const { width, height } = Dimensions.get('window');

export default function LandingScreen() {
  const navigation = useNavigation<LandingScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Animated Background Blobs */}
      <View style={styles.backgroundBlob1} />
      <View style={styles.backgroundBlob2} />
      <View style={styles.backgroundBlob3} />
      
      {/* Dot Pattern Background */}
      <View style={styles.dotPattern} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>
            <Text style={styles.titlePart1}>Social Media</Text>
            {'\n'}
            <Text style={styles.titlePart2}>Contest App</Text>
          </Text>
          
          <Text style={styles.subtitle}>
            A contest-based marketplace for creating Instagram and TikTok content. 
            Business owners create contests, designers submit amazing work, and everyone wins.
          </Text>
          
          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
              <LinearGradient
                colors={['#3B82F6', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Why Choose Our Platform?</Text>
          
          <View style={styles.featuresGrid}>
            {/* Feature 1 */}
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.featureIconText}>⚡</Text>
              </View>
              <Text style={styles.featureTitle}>Lightning Fast</Text>
              <Text style={styles.featureDescription}>
                Get designs in record time with our streamlined contest process
              </Text>
            </View>
            
            {/* Feature 2 */}
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#10B981' }]}>
                <Text style={styles.featureIconText}>✓</Text>
              </View>
              <Text style={styles.featureTitle}>Quality Assured</Text>
              <Text style={styles.featureDescription}>
                Only the best designs make it through our rigorous review process
              </Text>
            </View>
            
            {/* Feature 3 */}
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.featureIconText}>🌍</Text>
              </View>
              <Text style={styles.featureTitle}>Global Talent</Text>
              <Text style={styles.featureDescription}>
                Access designers from around the world with diverse creative styles
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
    marginBottom: 20,
  },
  titlePart1: {
    color: '#3B82F6',
  },
  titlePart2: {
    color: '#8B5CF6',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
    lineHeight: 26,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresGrid: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconText: {
    fontSize: 24,
    color: 'white',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  // Background Elements
  backgroundBlob1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    zIndex: -1,
  },
  backgroundBlob2: {
    position: 'absolute',
    top: height * 0.3,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    zIndex: -1,
  },
  backgroundBlob3: {
    position: 'absolute',
    bottom: height * 0.2,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    zIndex: -1,
  },
  dotPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    zIndex: -2,
  },
});
