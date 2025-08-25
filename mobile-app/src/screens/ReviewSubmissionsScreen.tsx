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
  Modal,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { getContestSubmissions, acceptSubmission, passSubmission } from '../lib/api';
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
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isDesignModalVisible, setIsDesignModalVisible] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (user) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const submissionsData = await getContestSubmissions(contestId);
      console.log('Submissions data received:', submissionsData);
      
      // Check if the API returned an error
      if (submissionsData.error) {
        console.error('API returned error:', submissionsData.error);
        Alert.alert('Error', submissionsData.error || 'Failed to load submissions');
        setSubmissions([]);
        return;
      }
      
      // Ensure we have a valid submissions array, default to empty if undefined
      const submissionsArray = submissionsData?.submissions || [];
      console.log('Processed submissions array:', submissionsArray);
      
      setSubmissions(submissionsArray);
    } catch (error) {
      console.error('Error loading submissions:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to load submissions');
      // Set empty array on error to prevent crashes
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptSubmission = async (submissionId: string) => {
    try {
      await acceptSubmission(submissionId);
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
      await passSubmission(submissionId);
      Alert.alert('Success', 'Submission passed!');
      loadSubmissions(); // Reload to update status
    } catch (error) {
      console.error('Error passing submission:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to pass submission');
    }
  };

  const handleViewDesign = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDesignModalVisible(true);
    // Initialize loading states for all assets
    if (submission.assets) {
      const loadingStates: {[key: string]: boolean} = {};
      submission.assets.forEach(asset => {
        loadingStates[asset.id] = true;
      });
      setImageLoadingStates(loadingStates);
    }
  };

  const handleImageLoad = (assetId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [assetId]: false
    }));
  };

  const handleImageError = (assetId: string) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [assetId]: false
    }));
  };

  const closeDesignModal = () => {
    setIsDesignModalVisible(false);
    setSelectedSubmission(null);
  };

  const getStatusColor = (status: string) => {
    if (!status) return '#6B7280';
    
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

  // Safety check for submissions data
  const safeSubmissions = submissions || [];
  const hasSubmissions = safeSubmissions.length > 0;

  // Additional safety check for malformed data
  const validSubmissions = safeSubmissions.filter(submission => 
    submission && 
    submission.id && 
    submission.designer && 
    submission.status
  );

  console.log('🔍 Safe submissions count:', safeSubmissions.length);
  console.log('✅ Valid submissions count:', validSubmissions.length);

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
        {!validSubmissions || validSubmissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No submissions yet</Text>
            <Text style={styles.emptySubtext}>
              Submissions will appear here once designers start submitting their work
            </Text>
          </View>
        ) : (
          validSubmissions.map((submission) => (
            <View key={submission.id} style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <View style={styles.designerInfo}>
                  <Text style={styles.designerName}>
                    {submission.designer?.name || 'Unknown Designer'}
                  </Text>
                  <Text style={styles.designerEmail}>
                    {submission.designer?.email || 'No email'}
                  </Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: getStatusColor(submission.status) }]}>
                  <Text style={styles.statusText}>{submission.status || 'UNKNOWN'}</Text>
                </View>
              </View>
              
              <View style={styles.submissionDetails}>
                <Text style={styles.detailText}>Round: {submission.round || 'N/A'}</Text>
                <Text style={styles.detailText}>
                  Files: {submission.assets?.length || submission.files?.length || 0}
                </Text>
                <Text style={styles.detailText}>
                  Submitted: {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : 'Unknown date'}
                </Text>
              </View>
              
              <View style={styles.submissionActions}>
                {/* View Design Button - Always visible if there are files */}
                {((submission.assets && submission.assets.length > 0) || (submission.files && submission.files.length > 0)) && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.viewDesignButton]} 
                    onPress={() => handleViewDesign(submission)}
                  >
                    <Text style={styles.actionButtonText}>View Design</Text>
                  </TouchableOpacity>
                )}
                
                {/* Accept/Pass buttons - Only for pending submissions */}
                {submission.status === 'PENDING' && (
                  <View style={styles.acceptPassRow}>
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
            </View>
          ))
        )}
      </ScrollView>

      {/* Design View Modal */}
      <Modal
        visible={isDesignModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDesignModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={closeDesignModal}>
              <Text style={styles.closeButtonText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Design by {selectedSubmission?.designer?.name || 'Unknown Designer'}
            </Text>
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selectedSubmission?.assets?.map((asset, index) => (
              <View key={asset.id} style={styles.assetContainer}>
                <Text style={styles.assetTitle}>
                  {asset.filename || `Design ${index + 1}`}
                </Text>
                <Text style={styles.assetType}>Type: {asset.type}</Text>
                
                {asset.url && (
                  <View style={styles.imageContainer}>
                    {imageLoadingStates[asset.id] && (
                      <View style={styles.imageLoadingContainer}>
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text style={styles.imageLoadingText}>Loading design...</Text>
                      </View>
                    )}
                    <Image
                      source={{ uri: asset.url }}
                      style={[
                        styles.designImage,
                        { opacity: imageLoadingStates[asset.id] ? 0 : 1 }
                      ]}
                      resizeMode="contain"
                      onLoad={() => handleImageLoad(asset.id)}
                      onError={() => handleImageError(asset.id)}
                    />
                  </View>
                )}
              </View>
            )) || selectedSubmission?.files?.map((file, index) => (
              <View key={index} style={styles.assetContainer}>
                <Text style={styles.assetTitle}>Design {index + 1}</Text>
                <Text style={styles.assetType}>File: {file}</Text>
              </View>
            )) || (
              <View style={styles.noAssetsContainer}>
                <Text style={styles.noAssetsText}>No design files available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    marginTop: 50, // Add some margin from top for better appearance
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingBottom: 20,
  },
  assetContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  assetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  assetType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 15,
    textAlign: 'center',
  },
  designImage: {
    width: Math.min(Dimensions.get('window').width - 80, 400), // Responsive width
    height: 250,
    borderRadius: 8,
  },
  noAssetsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  noAssetsText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  viewDesignButton: {
    backgroundColor: '#3B82F6',
    marginBottom: 10,
    width: '100%',
  },
  submissionActions: {
    marginTop: 10,
  },
  acceptPassRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    zIndex: 1,
  },
  imageLoadingText: {
    marginTop: 10,
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
});
