import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { WinningDesign } from '../types';
import { getWork } from '../lib/api';
import { useAuth } from '../context/AuthContext';

type WorkScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Work'>;

export default function WorkScreen() {
  const navigation = useNavigation<WorkScreenNavigationProp>();
  const { user } = useAuth();
  
  const [winningDesigns, setWinningDesigns] = useState<WinningDesign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadWinningDesigns();
    }
  }, [user]);

  const loadWinningDesigns = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load winning designs using the new API system
      const designsData = await getWork();
      const designs = designsData.designs || [];
      
      console.log('Loaded winning designs:', designs);
      setWinningDesigns(designs);
    } catch (error) {
      console.error('Error loading winning designs:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to load winning designs');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWinningDesigns();
    setRefreshing(false);
  };

  const handleBackToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const renderWinningDesign = (design: WinningDesign) => (
    <View key={design.id} style={styles.designCard}>
      <View style={styles.designHeader}>
        <Text style={styles.designTitle}>{design.submission.contest.title}</Text>
        <View style={styles.designTags}>
          <View style={[styles.tag, { backgroundColor: '#10B981' }]}>
            <Text style={styles.tagText}>WINNER</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.tagText}>{design.submission.contest.platform}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.designDetails}>
        <Text style={styles.designDetail}>Designer: {design.submission.designer.name}</Text>
        <Text style={styles.designDetail}>Round: {design.submission.round}</Text>
        <Text style={styles.designDetail}>Files: {design.assets.length}</Text>
        <Text style={styles.designDetail}>Completed: {new Date(design.submission.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.viewDesignsButton}
        onPress={() => navigation.navigate('ContestDetails', { contestId: design.submission.contest.id })}
      >
        <Text style={styles.viewDesignsButtonText}>View Design</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToDashboard}>
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Your Winning Designs</Text>
        <Text style={styles.subtitle}>All your contest-winning designs</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {winningDesigns.length > 0 ? (
          <View style={styles.designsContainer}>
            {winningDesigns.map(renderWinningDesign)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <Text style={styles.emptyStateIconText}>🎨</Text>
            </View>
            <Text style={styles.emptyStateTitle}>No winning designs yet</Text>
            <Text style={styles.emptyStateDescription}>
              Once you complete contests and select winners, they'll appear here
            </Text>
            <TouchableOpacity style={styles.dashboardButton} onPress={handleBackToDashboard}>
              <Text style={styles.dashboardButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
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
  designsContainer: {
    paddingVertical: 24,
    gap: 16,
  },
  designCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  designHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  designTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  designTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  designDetails: {
    marginBottom: 20,
  },
  designDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  viewDesignsButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  viewDesignsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  dashboardButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dashboardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
