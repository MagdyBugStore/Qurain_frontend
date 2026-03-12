# State Management Architecture

## Overview
This document outlines the state management patterns used in the application.

## Rules

### 1. Global State → Zustand
Use Zustand for global application state that needs to be shared across multiple components.

**When to use:**
- User preferences (theme, language)
- Shopping cart
- Global notifications
- Application-wide settings

**Example:**
```typescript
// stores/useThemeStore.ts
import { create } from 'zustand';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
```

### 2. Auth State → AuthContext
Use React Context for authentication state.

**When to use:**
- User authentication status
- User profile data
- Auth-related operations (login, logout, signup)

**Current Implementation:**
- `src/contexts/AuthContext.tsx` - Handles all authentication state

**Example:**
```typescript
const { user, userProfile, loading } = useAuth();
```

### 3. UI Local State → React useState
Use React `useState` for component-specific UI state.

**When to use:**
- Form inputs
- Modal open/close state
- Tabs/accordion state
- Component-specific toggles

**Example:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState('tab1');
```

### 4. Data Fetching State → Custom Hooks
Use custom hooks for data fetching and related state management.

**When to use:**
- API data fetching
- Loading states
- Error states
- Data transformations

**Current Implementation:**
- `src/app/teacher-profile/hooks/useWallet.ts`
- `src/app/teacher-profile/hooks/useSupport.ts`
- `src/app/teacher-profile/hooks/usePersonalInfo.ts`

**Example:**
```typescript
// hooks/useTeacherData.ts
export function useTeacherData(teacherId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data
  }, [teacherId]);

  return { data, loading, error };
}
```

## Current State Management Analysis

### ✅ Correctly Implemented

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Handles authentication state
   - Provides user and userProfile
   - ✅ Correct usage

2. **Custom Hooks** (`src/app/teacher-profile/hooks/`)
   - `useWallet.ts` - Wallet data fetching
   - `useSupport.ts` - Support tickets
   - `usePersonalInfo.ts` - Personal info management
   - ✅ Correct usage

3. **Local State in Components**
   - Form inputs, modals, tabs
   - ✅ Correct usage

### ⚠️ Areas for Improvement

1. **No Zustand Stores Yet**
   - Currently no global state stores
   - Consider adding for:
     - Theme preferences
     - Global notifications
     - User preferences

2. **Mixed Patterns**
   - Some components still have data fetching logic inline
   - Should be moved to custom hooks

## Migration Guide

### Moving from Inline State to Hooks

**Before:**
```typescript
function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData().then(setData).finally(() => setLoading(false));
  }, []);

  return <div>{loading ? 'Loading...' : data}</div>;
}
```

**After:**
```typescript
function Component() {
  const { data, loading } = useData();

  return <div>{loading ? 'Loading...' : data}</div>;
}
```

## Best Practices

1. **Keep state as local as possible**
   - Start with `useState`
   - Move to hooks if reused
   - Move to Context if needed across tree
   - Move to Zustand if truly global

2. **Separate concerns**
   - UI state → `useState`
   - Data fetching → Custom hooks
   - Auth → Context
   - Global → Zustand

3. **Avoid prop drilling**
   - Use Context or Zustand instead of passing props through many levels

4. **Type safety**
   - Always type your state
   - Use TypeScript interfaces/types
