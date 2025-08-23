# Social Media Contest App - Mobile Version

A React Native mobile application built with Expo that provides the same functionality as the web version, allowing business owners to create design contests and manage submissions on the go.

## Features

### 🎯 Core Functionality
- **User Authentication**: Sign up and sign in for business owners and designers
- **Dashboard**: Overview of contests with statistics (Total, Active, Completed, Cancelled)
- **Contest Management**: Create new contests with detailed specifications
- **Submission Review**: Review designer submissions and provide feedback
- **Brand Guidelines**: Upload brand assets and style preferences
- **Mobile-First Design**: Optimized for mobile devices with touch-friendly interfaces

### 📱 Mobile-Specific Features
- **Responsive Design**: Adapts to different screen sizes
- **Touch Gestures**: Swipe and tap interactions
- **Offline Support**: Basic offline functionality with local storage
- **Push Notifications**: (Coming soon) Real-time updates for contest activities

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with custom design system
- **Authentication**: Custom JWT-based system with AsyncStorage
- **API Integration**: RESTful API calls to the same backend as web app
- **UI Components**: Custom components with gradient backgrounds and modern design

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   
   # For web development
   npm run web
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── screens/            # Screen components
│   ├── LandingScreen.tsx
│   ├── SignInScreen.tsx
│   ├── SignUpScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── CreateContestScreen.tsx
│   ├── ContestDetailsScreen.tsx
│   ├── ReviewSubmissionsScreen.tsx
│   ├── SubmissionDetailScreen.tsx
│   └── WorkScreen.tsx
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

## Configuration

### Environment Variables
The app connects to the same backend API as the web version. Update the API URL in `src/services/api.ts` if needed:

```typescript
export const API_BASE_URL = 'https://your-backend-url.com/api';
```

### API Endpoints
The mobile app uses the same API endpoints as the web version:
- Authentication: `/auth/signin`, `/auth/signup`, `/auth/signout`
- Contests: `/contests`, `/contests/:id`
- Submissions: `/submissions`, `/submissions/:id`
- Files: `/files/upload`, `/files/:filename`

## Development

### Adding New Screens
1. Create a new screen component in `src/screens/`
2. Add the screen to the navigation stack in `App.tsx`
3. Update the `RootStackParamList` type definition

### Styling Guidelines
- Use the existing design system with consistent colors and spacing
- Follow the mobile-first approach with touch-friendly button sizes
- Maintain consistency with the web app's visual identity

### State Management
- Use React Context for global state (authentication, user data)
- Use local state for component-specific data
- Implement proper error handling and loading states

## Building for Production

### Android
```bash
expo build:android
```

### iOS
```bash
expo build:ios
```

### Web
```bash
expo build:web
```

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Deployment

### Expo Application Services (EAS)
1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Configure EAS: `eas build:configure`
3. Build: `eas build --platform all`
4. Submit: `eas submit --platform all`

### Manual Build
1. Run `expo eject` to generate native code
2. Build using Xcode (iOS) or Android Studio (Android)
3. Follow platform-specific deployment procedures

## Troubleshooting

### Common Issues

**Metro bundler issues**
```bash
npx expo start --clear
```

**Dependencies conflicts**
```bash
rm -rf node_modules package-lock.json
npm install
```

**iOS build errors**
- Ensure Xcode is up to date
- Check iOS deployment target compatibility
- Verify CocoaPods installation

**Android build errors**
- Ensure Android SDK is properly configured
- Check build tools version compatibility
- Verify Gradle configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

### Phase 2 Features
- [ ] Push notifications for contest updates
- [ ] Offline mode with sync capabilities
- [ ] Advanced image viewing and manipulation
- [ ] Designer portfolio and rating system
- [ ] Payment integration for contest fees
- [ ] Social sharing and collaboration features

### Performance Improvements
- [ ] Image optimization and lazy loading
- [ ] Caching strategies for better offline experience
- [ ] Bundle size optimization
- [ ] Performance monitoring and analytics
