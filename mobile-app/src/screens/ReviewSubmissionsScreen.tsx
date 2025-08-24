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
import { Submission } from '../types';

type ReviewSubmissionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReviewSubmissions'>;
type ReviewSubmissionsScreenRouteProp = RouteProp<RootStackParamList, 'ReviewSubmissions'>;

export default function ReviewSubmissionsScreen() {
  const navigation = useNavigation<ReviewSubmissionsScreenNavigationProp>();
  const route = useRoute<ReviewSubmissionsScreenRouteProp>();
  const { contestId } = route.params;
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const submissionsData = await apiFetch(`/api/contests/${contestId}/submissions`);
      setSubmissions(submissionsData.submissions || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSubmission = async (submissionId: string) => {
    try {
      await apiFetch(`/api/submissions/${submissionId}/accept`, {
        method: 'POST',
      });
      Alert.alert('Success', 'Submission accepted!');
      loadSubmissions(); // Reload to update status
    } catch (error) {
      console.error('Error accepting submission:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to accept submission');
    }
  };

  const handlePassSubmission = async (submissionId: string) => {
    try {
      await apiFetch(`/api/submissions/${submissionId}/pass`, {
        method: 'POST',
      });
      Alert.alert('Success', 'Submission passed!');
      loadSubmissions(); // Reload to update status
    } catch (error) {
      console.error('Error passing submission:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to pass submission');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '#10B981';
      case 'PASSED':
        return '#F59E0B';
      case 'PENDING':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back to Contest</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Review All Submissions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading submissions...</Text>
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
          <Text style={styles.backButtonText}>← Back to Contest</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Review All Submissions</Text>
        <Text style={styles.subtitle}>Contest ID: {contestId}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submissions yet</Text>
            <Text style={styles.emptySubtext}>
              Submissions will appear here once designers start submitting their work
            </Text>
          </View>
        ) : (
          submissions.map((submission) => (
            <View key={submission.id} style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <View style={styles.designerInfo}>
                  <Text style={styles.designerName}>{submission.designer.name}</Text>
                  <Text style={styles.designerEmail}>{submission.designer.email}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(submission.status) }]}>
                  <Text style={styles.statusText}>{submission.status}</Text>
                </View>
              </View>
              
              <View style={styles.submissionDetails}>
                <Text style={styles.detailText}>Round: {submission.round}</Text>
                <Text style={styles.detailText}>Files: {submission.files.length}</Text>
                <Text style={styles.detailText}>
                  Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              {submission.status === 'PENDING' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.acceptButton]} 
                    onPress={() => handleAcceptSubmission(submission.id)}
                  >
                    <Text style={styles.actionButtonText}>Accept</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.passButton]} 
                    onPress={() => handlePassSubmission(submission.id)}
                  >
                    <Text style={styles.actionButtonText}>Pass</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
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
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  submissionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  designerInfo: {
    flex: 1,
  },
  designerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  designerEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  submissionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  passButton: {
    backgroundColor: '#F59E0B',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
