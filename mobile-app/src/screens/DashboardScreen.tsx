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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { Contest, DashboardStats } from '../types';
import { apiFetch } from '../lib/api';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user, signOut } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalContests: 0,
    activeContests: 0,
    completedContests: 0,
    cancelledContests: 0,
  });
  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      console.log('🔍 Loading dashboard data for user:', user);
      
      // Load contests using new API system
      const contestsData = await apiFetch('/api/contests');
      const contests = contestsData.contests || [];
      
      console.log('Loaded contests:', contests);
      
      // Calculate stats
      const totalContests = contests.length;
      const activeContests = contests.filter((c: Contest) => c.status === 'ACTIVE');
      const completedContests = contests.filter((c: Contest) => c.status === 'COMPLETED');
      const cancelledContests = contests.filter((c: Contest) => c.status === 'CANCELLED');

      setStats({
        totalContests,
        activeContests: activeContests.length,
        completedContests: completedContests.length,
        cancelledContests: cancelledContests.length,
      });

      setActiveContests(activeContests);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleCreateContest = () => {
    navigation.navigate('CreateContest');
  };

  const handleViewWork = () => {
    navigation.navigate('Work');
  };

  const handleContestAction = (contest: Contest, action: string) => {
    switch (action) {
      case 'view':
        navigation.navigate('ContestDetails', { contestId: contest.id });
        break;
      case 'review':
        navigation.navigate('ReviewSubmissions', { contestId: contest.id });
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Contest',
          'Are you sure you want to cancel this contest? This action cannot be undone.',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes, Cancel', style: 'destructive', onPress: () => cancelContest(contest.id) },
          ]
        );
        break;
    }
  };

  const cancelContest = async (contestId: string) => {
    if (!user) return;
    
    try {
      await apiFetch(`/api/contests/${contestId}/cancel`, {
        method: 'POST',
      });
      Alert.alert('Success', 'Contest cancelled successfully');
      loadDashboardData();
    } catch (error) {
      console.error('Error cancelling contest:', error);
      console.error('Error response body:', error);
      Alert.alert('Error', 'Failed to cancel contest');
    }
  };



  const renderStatCard = (title: string, value: number, color: string, icon: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <Text style={styles.statIcon}>{icon}</Text>
        <View style={styles.statText}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </View>
    </View>
  );

  const renderContestCard = (contest: Contest) => (
    <View key={contest.id} style={styles.contestCard}>
      <View style={styles.contestHeader}>
        <Text style={styles.contestTitle}>{contest.title}</Text>
        <View style={styles.contestTags}>
          <View style={[styles.tag, { backgroundColor: '#10B981' }]}>
            <Text style={styles.tagText}>ACTIVE</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: '#3B82F6' }]}>
            <Text style={styles.tagText}>{contest.platform}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.contestDetails}>
        <Text style={styles.contestDetail}>Current Round: Round {contest.round}</Text>
        <Text style={styles.contestDetail}>
          Progress: {contest.acceptedCount}/{contest.expectedSubmissions} designs accepted
        </Text>
        <Text style={styles.contestDetail}>Submissions: {contest._count.submissions}</Text>
        <Text style={styles.contestDetail}>Created: {new Date(contest.createdAt).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.contestActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleContestAction(contest, 'view')}
        >
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={() => handleContestAction(contest, 'review')}
        >
          <Text style={styles.primaryActionButtonText}>Review Submissions</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.dangerActionButton]}
          onPress={() => handleContestAction(contest, 'cancel')}
        >
          <Text style={styles.dangerActionButtonText}>Cancel Contest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {user.name}</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateContest}>
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.createButtonText}>Create Contest</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Total Contests', stats.totalContests, '#3B82F6', '📊')}
            {renderStatCard('Active Contests', stats.activeContests, '#10B981', '✅')}
            {renderStatCard('Completed', stats.completedContests, '#6B7280', '🏆')}
            {renderStatCard('Cancelled', stats.cancelledContests, '#EF4444', '❌')}
          </View>
        </View>

        {/* Active Contests Section */}
        {activeContests.length > 0 && (
          <View style={styles.contestsSection}>
            <Text style={styles.sectionTitle}>Active Contests</Text>
            <Text style={styles.sectionSubtitle}>
              Manage your active contests and review submissions
            </Text>
            
            {activeContests.map(renderContestCard)}
          </View>
        )}

        {/* Quick Actions Section */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={handleCreateContest}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#3B82F6' }]}>
                <Text style={styles.quickActionIconText}>+</Text>
              </View>
              <Text style={styles.quickActionTitle}>Create New Contest</Text>
              <Text style={styles.quickActionDescription}>Start a new design contest</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard} onPress={handleViewWork}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#10B981' }]}>
                <Text style={styles.quickActionIconText}>🎨</Text>
              </View>
              <Text style={styles.quickActionTitle}>Your Work</Text>
              <Text style={styles.quickActionDescription}>View accepted designs</Text>
            </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
  },
  signOutButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  contestsSection: {
    marginBottom: 32,
  },
  contestCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  contestTags: {
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
  contestDetails: {
    marginBottom: 20,
  },
  contestDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  contestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryActionButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  primaryActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerActionButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  dangerActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    gap: 16,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIconText: {
    fontSize: 24,
    color: 'white',
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  quickActionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
