import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { Contest } from '../types';

type ContestDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ContestDetails'>;
type ContestDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ContestDetails'>;

export default function ContestDetailsScreen() {
  const navigation = useNavigation<ContestDetailsScreenNavigationProp>();
  const route = useRoute<ContestDetailsScreenRouteProp>();
  const { contestId } = route.params;
  const { user } = useAuth();
  
  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContestDetails();
    }
  }, [user]);

  const loadContestDetails = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const contestData = await apiFetch(`/api/contests/${contestId}/details`);
      setContest(contestData.contest);
    } catch (error) {
      console.error('Error loading contest details:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to load contest details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmissions = () => {
    navigation.navigate('ReviewSubmissions', { contestId });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Contest Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading contest details...</Text>
        </View>
      </View>
    );
  }

  if (!contest) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Contest Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Contest not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>{contest.title}</Text>
        <Text style={styles.subtitle}>Contest ID: {contestId}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contest Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contest Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusTag, { backgroundColor: contest.status === 'ACTIVE' ? '#10B981' : '#6B7280' }]}>
              <Text style={styles.statusText}>{contest.status}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <View style={[styles.platformTag, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.platformText}>{contest.platform}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Current Round:</Text>
            <Text style={styles.infoValue}>Round {contest.round}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expected Submissions:</Text>
            <Text style={styles.infoValue}>{contest.expectedSubmissions}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Accepted Count:</Text>
            <Text style={styles.infoValue}>{contest.acceptedCount}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Submissions:</Text>
            <Text style={styles.infoValue}>{contest._count.submissions}</Text>
          </View>
          
          {contest.description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{contest.description}</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleReviewSubmissions}>
            <Text style={styles.actionButtonText}>Review Submissions</Text>
          </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  statusTag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  platformTag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  platformText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
