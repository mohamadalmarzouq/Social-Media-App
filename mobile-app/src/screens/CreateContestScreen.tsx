import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { ContestFormData } from '../types';
import { API_BASE_URL } from '../lib/config';

type CreateContestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateContest'>;

export default function CreateContestScreen() {
  const navigation = useNavigation<CreateContestScreenNavigationProp>();
  
  const [formData, setFormData] = useState<ContestFormData>({
    title: '',
    description: '',
    service: '',
    filesNeeded: [],
    packageType: '',
    brandGuidelines: {
      description: '',
      colors: [],
      fonts: [],
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const services = [
    'Logo',
    'Instagram (1080×1080)',
    'TikTok (1080×1920)',
  ];

  // Dynamic file options based on service selection
  const getFilesNeededOptions = (service: string) => {
    if (service === 'Logo') {
      return ['Source Files', 'Print Files', 'Digital Files'];
    } else if (service.includes('Instagram') || service.includes('TikTok') || service.includes('Facebook') || service.includes('Twitter') || service.includes('LinkedIn')) {
      return ['Static Post', 'Animated Post'];
    }
    return [];
  };

  // Dynamic package types based on service and files
  const getPackageTypes = (service: string, filesNeeded: string[]) => {
    if (service === 'Logo') {
      if (filesNeeded.includes('Source Files')) {
        return [
          'Package 1 (Expect 30, Get 1 winner)',
          'Package 2 (Expect 50, Get 2 winners)',
          'Package 3 (Expect 100, Get 3 winners)',
        ];
      } else {
        return [
          'Package 1 (Expect 25, Get 1 winner)',
          'Package 2 (Expect 40, Get 2 winners)',
          'Package 3 (Expect 80, Get 3 winners)',
        ];
      }
    } else {
      if (filesNeeded.includes('Animated Post')) {
        return [
          'Package 1 (Expect 35, Get 1 winner)',
          'Package 2 (Expect 60, Get 2 winners)',
          'Package 3 (Expect 120, Get 3 winners)',
        ];
      } else {
        return [
          'Package 1 (Expect 30, Get 1 winner)',
          'Package 2 (Expect 50, Get 2 winners)',
          'Package 3 (Expect 100, Get 3 winners)',
        ];
      }
    }
  };

  // Get current dynamic options
  const currentFilesNeededOptions = getFilesNeededOptions(formData.service);
  const currentPackageTypes = getPackageTypes(formData.service, formData.filesNeeded);

  const colorPresets = [
    '#FF0000', '#FF4500', '#FF8C00', '#FFD700', '#FFFF00',
    '#32CD32', '#00CED1', '#1E90FF', '#0000FF', '#4B0082',
    '#8A2BE2', '#FF1493', '#FF00FF', '#DC143C', '#006400',
    '#000000', '#FFFFFF', '#808080', '#800080', '#87CEEB',
    '#D2691E', '#FF69B4', '#00FA9A', '#F0E68C', '#E6E6FA',
  ];

  const fontPresets = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Impact', 'Comic Sans MS', 'Courier New', 'Lucida Console', 'Palatino',
  ];

  const handleInputChange = (field: string, value: string | string[]) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof ContestFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Reset files and package when service changes
  const handleServiceSelect = (service: string) => {
    setFormData(prev => ({ 
      ...prev, 
      service,
      filesNeeded: [], // Reset files when service changes
      packageType: '' // Reset package when service changes
    }));
  };

  const handleFilesNeededToggle = (fileType: string) => {
    setFormData(prev => ({
      ...prev,
      filesNeeded: prev.filesNeeded.includes(fileType)
        ? prev.filesNeeded.filter(f => f !== fileType)
        : [...prev.filesNeeded, fileType],
      packageType: '', // Reset package when files change
    }));
  };

  const handlePackageTypeSelect = (packageType: string) => {
    setFormData(prev => ({ ...prev, packageType }));
  };

  const handleColorAdd = (color: string) => {
    if (!formData.brandGuidelines.colors.includes(color)) {
      handleInputChange('brandGuidelines.colors', [...formData.brandGuidelines.colors, color]);
    }
  };

  const handleColorRemove = (color: string) => {
    handleInputChange('brandGuidelines.colors', formData.brandGuidelines.colors.filter(c => c !== color));
  };

  const handleFontAdd = (font: string) => {
    if (!formData.brandGuidelines.fonts.includes(font)) {
      handleInputChange('brandGuidelines.fonts', [...formData.brandGuidelines.fonts, font]);
    }
  };

  const handleFontRemove = (font: string) => {
    handleInputChange('brandGuidelines.fonts', formData.brandGuidelines.fonts.filter(f => f !== font));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.service || !formData.packageType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Contest created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') },
        ]);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create contest');
      }
    } catch (error) {
      console.error('Error creating contest:', error);
      Alert.alert('Error', 'Failed to create contest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Contest Details</Text>
      <Text style={styles.stepSubtitle}>Provide the basic information about your contest</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Contest Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Logo Design for Tech Startup"
          value={formData.title}
          onChangeText={(value) => handleInputChange('title', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description (Optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what you're looking for, your target audience, style preferences, etc."
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Service *</Text>
        <View style={styles.optionsGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service}
              style={[
                styles.optionButton,
                formData.service === service && styles.optionButtonSelected
              ]}
              onPress={() => handleServiceSelect(service)}
            >
              <Text style={[
                styles.optionButtonText,
                formData.service === service && styles.optionButtonTextSelected
              ]}>
                {service}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Files Needed</Text>
        {formData.service ? (
          <View style={styles.optionsGrid}>
            {currentFilesNeededOptions.map((fileType) => (
              <TouchableOpacity
                key={fileType}
                style={[
                  styles.optionButton,
                  formData.filesNeeded.includes(fileType) && styles.optionButtonSelected
                ]}
                onPress={() => handleFilesNeededToggle(fileType)}
              >
                <Text style={[
                  styles.optionButtonText,
                  formData.filesNeeded.includes(fileType) && styles.optionButtonTextSelected
                ]}>
                  {fileType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>Please select a service first</Text>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Package Type *</Text>
        {formData.service && formData.filesNeeded.length > 0 ? (
          <View style={styles.optionsGrid}>
            {currentPackageTypes.map((packageType) => (
              <TouchableOpacity
                key={packageType}
                style={[
                  styles.optionButton,
                  formData.packageType === packageType && styles.optionButtonSelected
                ]}
                onPress={() => handlePackageTypeSelect(packageType)}
              >
                <Text style={[
                  styles.optionButtonText,
                  formData.packageType === packageType && styles.optionButtonTextSelected
                ]}>
                  {packageType}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>
            {!formData.service ? 'Please select a service first' : 
             formData.filesNeeded.length === 0 ? 'Please select files needed first' : ''}
          </Text>
        )}
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Expected Submissions</Text>
          <Text style={styles.summaryValue}>
            {formData.packageType.includes('30') ? '30' : 
             formData.packageType.includes('50') ? '50' : 
             formData.packageType.includes('100') ? '100' : 
             formData.packageType.includes('25') ? '25' : 
             formData.packageType.includes('40') ? '40' : 
             formData.packageType.includes('80') ? '80' : 
             formData.packageType.includes('35') ? '35' : 
             formData.packageType.includes('60') ? '60' : 
             formData.packageType.includes('120') ? '120' : '0'}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Final Designs</Text>
          <Text style={styles.summaryValue}>
            {formData.packageType.includes('1 winner') ? '1' : 
             formData.packageType.includes('2 winners') ? '2' : 
             formData.packageType.includes('3 winners') ? '3' : '0'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Brand Guidelines</Text>
      <Text style={styles.stepSubtitle}>Upload your brand assets and provide style guidelines</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Brand Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your brand style, personality, and any specific requirements..."
          value={formData.brandGuidelines.description}
          onChangeText={(value) => handleInputChange('brandGuidelines.description', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Brand Colors</Text>
        <Text style={styles.inputSubtitle}>Or select from presets:</Text>
        <View style={styles.colorGrid}>
          {colorPresets.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorSwatch, { backgroundColor: color }]}
              onPress={() => handleColorAdd(color)}
            />
          ))}
        </View>
        {formData.brandGuidelines.colors.length > 0 && (
          <View style={styles.selectedColors}>
            <Text style={styles.selectedColorsTitle}>Selected Colors:</Text>
            <View style={styles.selectedColorsList}>
              {formData.brandGuidelines.colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.selectedColorItem, { backgroundColor: color }]}
                  onPress={() => handleColorRemove(color)}
                >
                  <Text style={styles.removeColorText}>×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Brand Fonts</Text>
        <Text style={styles.inputSubtitle}>Or select from popular fonts:</Text>
        <View style={styles.fontGrid}>
          {fontPresets.map((font) => (
            <TouchableOpacity
              key={font}
              style={[
                styles.fontOption,
                formData.brandGuidelines.fonts.includes(font) && styles.fontOptionSelected
              ]}
              onPress={() => handleFontAdd(font)}
            >
              <Text style={[
                styles.fontOptionText,
                formData.brandGuidelines.fonts.includes(font) && styles.fontOptionTextSelected
              ]}>
                {font}
              </Text>
              <Text style={styles.fontSampleText}>The quick brown fox jumps over the lazy dog</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Create Contest</Text>
        <Text style={styles.subtitle}>Launch your design contest and connect with talented designers</Text>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        <View style={styles.progressSteps}>
          <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
            <Text style={[styles.progressStepText, currentStep >= 1 && styles.progressStepTextActive]}>1</Text>
          </View>
          <View style={styles.progressLine} />
          <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
            <Text style={[styles.progressStepText, currentStep >= 2 && styles.progressStepTextActive]}>2</Text>
          </View>
        </View>
        <Text style={styles.progressLabel}>
          {currentStep === 1 ? 'Contest Details' : 'Brand Guidelines'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 1 ? renderStep1() : renderStep2()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {currentStep > 1 && (
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < 2 ? (
          <TouchableOpacity 
            style={styles.nextButton} 
            onPress={() => setCurrentStep(currentStep + 1)}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={['#3B82F6', '#1D4ED8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Creating...' : 'Create Contest'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
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
    position: 'absolute',
    top: 60,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#3B82F6',
  },
  progressStepText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  progressStepTextActive: {
    color: 'white',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsGrid: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  summaryBox: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedColors: {
    marginTop: 16,
  },
  selectedColorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  selectedColorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedColorItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeColorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fontGrid: {
    gap: 12,
  },
  fontOption: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: 'white',
  },
  fontOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  fontOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fontOptionTextSelected: {
    color: '#1E40AF',
  },
  fontSampleText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  submitButton: {
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
