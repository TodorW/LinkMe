# LinkMe - Community Micro-Solidarity App

## Overview

LinkMe is a community-focused mobile application designed to connect local neighbors who need help with willing volunteers. The app facilitates micro-solidarity by enabling users to request and offer help for everyday situations like shopping, cleaning, tool lending, transportation, and tech assistance.

The project is built as a cross-platform React Native application using Expo, with an Express.js backend and PostgreSQL database. The architecture follows a client-server model with the mobile app communicating with a REST API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo (SDK 54)
- Uses Expo's managed workflow for simplified native module access
- Android-first design following Material 3 guidelines
- Supports web output via react-native-web

**Navigation**: React Navigation v7
- Tab-based navigation with 3 main tabs (Map, Messages, Profile)
- Stack navigators nested within each tab
- Auth flow uses a separate stack before main app access

**State Management**:
- TanStack React Query for server state and caching
- React Context for authentication state (AuthContext)
- AsyncStorage for local persistence

**Styling Approach**:
- Custom theme system with light/dark mode support
- Nunito font family via expo-google-fonts
- Reanimated for smooth animations
- Component-based design with shared UI components (Button, Card, Input, etc.)

**Key Design Patterns**:
- Role-based UI transformation - app appearance shifts based on user/volunteer role
- Warm, trustworthy aesthetic with orange (#FF6B35) as primary color
- Category chips for help type selection

### Backend Architecture

**Framework**: Express.js v5 running on Node.js
- RESTful API design with `/api` prefix
- CORS configured for Replit deployment domains

**Database**: PostgreSQL with Drizzle ORM
- Schema defined in `shared/schema.ts`
- Migrations managed via drizzle-kit
- Tables: users, helpRequests, conversations, messages, ratings

**Authentication**: Custom email-based authentication
- SHA-256 password hashing
- JMBG (national ID) verification with hashed storage
- Session managed client-side via AsyncStorage

**API Structure**:
- `/api/auth/register` and `/api/auth/login` for authentication
- `/api/users/:id` for user operations
- `/api/help-requests` for help request CRUD
- `/api/conversations` and `/api/messages` for messaging
- `/api/ratings` for user ratings

### Project Structure

```
client/           # React Native app code
  components/     # Reusable UI components
  screens/        # Screen components
  navigation/     # Navigation configuration
  context/        # React contexts (auth)
  hooks/          # Custom hooks
  lib/            # API client, storage utilities
  constants/      # Theme, colors, categories
  types/          # TypeScript type definitions
server/           # Express backend
  routes.ts       # API route handlers
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
```

### Path Aliases

- `@/` maps to `./client/`
- `@shared/` maps to `./shared/`

Configured in both `tsconfig.json` and `babel.config.js` for consistent imports.

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Mobile/Expo
- **Expo SDK 54**: Managed workflow for React Native
- **expo-crypto**: JMBG hashing for privacy
- **expo-haptics**: Haptic feedback
- **expo-splash-screen**: App loading experience
- **expo-web-browser**: External link handling

### UI/UX Libraries
- **react-native-reanimated**: Smooth animations
- **react-native-gesture-handler**: Touch interactions
- **react-native-keyboard-controller**: Keyboard-aware scrolling
- **expo-blur**: iOS blur effects for tab bar

### Data & State
- **@tanstack/react-query**: Server state management
- **@react-native-async-storage/async-storage**: Local data persistence
- **zod + drizzle-zod**: Schema validation

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN`: API server domain for mobile client
- `REPLIT_DEV_DOMAIN`: Development domain (auto-set by Replit)