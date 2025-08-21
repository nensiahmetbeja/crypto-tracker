# Crypto Tracker

A simple cryptocurrency tracking application built with React Native, Expo, and TypeScript.

## Features

- **Crypto Tracking**: Monitor Bitcoin, Ethereum, and other cryptocurrencies
- **Dark Theme UI**: Modern, eye-friendly dark interface
- **Search & Add**: Find and add new cryptocurrencies to your watchlist
- **Swipe-to-Delete**: Intuitive gesture-based asset removal
- **Cross-Platform**: Works on both iOS and Android

## Tech Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand + React Query
- **API**: CoinGecko (free tier)

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Emulator
- Git

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd crypto-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo Go on your device** (optional, for testing on physical device)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Running the App

### Development Mode

1. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   # or
   npx expo start
   ```

2. **Choose your platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app (physical device)

### Building for Production

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android
```

## Project Structure


## Key Design Decisions

### 1. **Dark Theme & Modern UI**
- **Why**: Better user experience in low-light conditions, modern aesthetic
- **Implementation**: Consistent color palette (`#282c34` background, white text)
- **Benefits**: Reduced eye strain, professional appearance

### 2. **Swipe-to-Delete Interface**
- **Why**: Native iOS/Android pattern, intuitive user experience
- **Implementation**: `react-native-gesture-handler` with `Swipeable` component
- **Benefits**: Familiar interaction pattern, space-efficient

### 3. **Performance Optimizations**
- **Search Debouncing**: 300ms delay prevents excessive API calls
- **Intelligent Caching**: 5-minute search cache, 30-second price cache
- **Rate Limit Handling**: Prevents CoinGecko API abuse (5 calls/minute limit)

### 4. **State Management Architecture**
- **Zustand**: Lightweight store for local app state (tracked assets)
- **React Query**: Server state management (API calls, caching, synchronization)
- **Why**: Separation of concerns, optimal performance, built-in caching

### 5. **TypeScript Implementation**
- **Why**: Type safety, better developer experience, fewer runtime errors
- **Benefits**: IntelliSense, compile-time error checking, better refactoring

## API Integration

### CoinGecko API
- **Base URL**: `https://api.coingecko.com/api/v3`
- **Rate Limits**: 30 calls/minute (free tier)
- **Endpoints Used**:
  - `/search` - Find cryptocurrencies
  - `/coins/markets` - Get price data

### Rate Limiting Strategy
- **Automatic Throttling**: 1.2-second minimum between requests
- **Exponential Backoff**: Retry with increasing delays on 429 errors
- **User Feedback**: Clear error messages for rate limit issues

## Error Handling

### Network Errors
- **Retry Logic**: Exponential backoff for failed requests
- **User Messages**: Clear, actionable error messages
- **Graceful Degradation**: App continues working with cached data

### Rate Limiting
- **Prevention**: App stops before hitting API limits
- **User Education**: Clear explanation of what's happening
- **Manual Refresh**: Users can manually refresh when ready

## Configuration

### Environment Variables
```bash
# Add to .env file if needed
COINGECKO_API_KEY=your_api_key_here
```

### Rate Limiting
```typescript
// lib/services/CryptoService.ts
private readonly MINUTE_LIMIT = 5;   // API calls per minute
private readonly MONTH_LIMIT = 10000; // API calls per month
```

## Testing

### Manual Testing
1. **Add Assets**: Search and add different cryptocurrencies
2. **Swipe Actions**: Test swipe-to-delete on various row positions
3. **Search**: Test with different query lengths and characters
4. **Rate Limiting**: Monitor API usage and error handling

### Performance Testing
- **Search Debouncing**: Type quickly to see debouncing in action
- **Caching**: Repeated searches should be instant
- **Memory Usage**: Monitor for memory leaks during extended use

## Future Enhancements

### Potential Features
- [ ] **Portfolio Tracking**: Track investment amounts and gains/losses
- [ ] **Price Alerts**: Notifications for price targets
- [ ] **Charts**: Historical price charts and analysis
- [ ] **Offline Support**: Cached data for offline viewing
- [ ] **Multiple Watchlists**: Organize assets into categories

### Technical Improvements
- [ ] **Advanced Caching**: Redis integration for persistent caching
- [ ] **Real-time Updates**: WebSocket integration for live prices
- [ ] **Performance Monitoring**: APM integration for production
- [ ] **A/B Testing**: User experience optimization framework

### Debug Mode
```bash
# Enable debug logging
npx expo start --dev-client
```

---

**Built with ❤️ using React Native, Expo, and TypeScript**
