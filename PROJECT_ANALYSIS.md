# Project Architecture Analysis

## Executive Summary

This is a **React + Vite** application for an online Quran learning platform. The project shows signs of **architectural evolution** with a mix of legacy code and newer feature-based organization. There's a partial implementation of Clean Architecture principles in the `features/teachers` module, while other parts of the codebase follow more traditional React patterns.

---

## 1. Current Architecture

### 1.1 Technology Stack
- **Frontend Framework**: React 19.2.0 with Vite
- **Routing**: React Router DOM v6
- **State Management**: Zustand (2 stores: `useAppStore`, `useUserStore`)
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Tailwind CSS with RTL support
- **Internationalization**: i18next
- **Type Safety**: TypeScript (partial)

### 1.2 Project Structure

```
src/
├── app/                    # Page components (Next.js-style naming, but React Router)
│   ├── admin/
│   ├── booking/
│   ├── teachers/
│   ├── teacher-profile/
│   ├── profile/
│   └── ...
├── components/            # Reusable UI components
│   ├── auth/
│   ├── forms/
│   ├── layout/
│   ├── modals/
│   └── sections/
├── features/              # Feature-based modules (Clean Architecture attempt)
│   └── teachers/
│       ├── application/   # Use cases
│       ├── domain/        # Entities & interfaces
│       ├── infrastructure/ # Repositories (outside features/)
│       ├── presentation/  # Hooks & components
│       └── services/      # Business logic
├── contexts/              # React Context (AuthContext)
├── store/                 # Zustand stores
├── config/                # Firebase configuration
├── models/                # Data models
├── shared/                # Shared utilities & types
├── hooks/                 # Custom React hooks
├── infrastructure/        # Firebase repositories
└── legacy-pages/          # Old page components
```

### 1.3 Architecture Patterns

**Mixed Architecture Approach:**
1. **Legacy Pattern**: Direct Firebase queries in components (`app/teacher-profile/page.tsx`, `app/teachers/page.tsx`)
2. **Repository Pattern**: Partially implemented (`infrastructure/firebase/repositories/TeacherRepository.ts`)
3. **Clean Architecture**: Attempted in `features/teachers/` but incomplete
4. **Service Layer**: Exists in `features/teachers/services/` but not consistently used

---

## 2. Main Modules

### 2.1 Authentication Module
- **Location**: `contexts/AuthContext.tsx`, `store/useUserStore.ts`
- **Responsibilities**: 
  - User authentication (Google, Apple)
  - User profile management
  - Profile completion checks
  - Auto-redirect logic for incomplete profiles
- **Issues**: 
  - Business logic mixed with UI logic (redirect logic in `AuthContext`)
  - Profile sync logic duplicated between `AuthContext` and `useUserStore`

### 2.2 Teacher Module
- **Location**: `features/teachers/`, `app/teachers/`, `app/teacher-profile/`
- **Structure**: 
  - **Domain Layer**: Entities (Teacher, Qualification, Ijazah, Availability, Wallet, SupportTicket)
  - **Application Layer**: Use cases (GetTeacherProfile, SaveAvailability, etc.)
  - **Infrastructure Layer**: `TeacherRepository` (outside features folder)
  - **Presentation Layer**: Hooks and components
- **Issues**: 
  - Inconsistent usage (some pages use repository, others use direct queries)
  - Large monolithic page (`teacher-profile/page.tsx` - 2046 lines)

### 2.3 Booking Module
- **Location**: `app/booking/`
- **Structure**: Simple page-based routing
- **Issues**: No clear service layer or business logic separation

### 2.4 Admin Module
- **Location**: `app/admin/page.tsx`
- **Issues**: 
  - Direct Firebase queries in component
  - Complex filtering logic mixed with UI
  - No service layer

### 2.5 Wallet Module
- **Location**: `app/wallet/page.tsx`
- **Issues**: 
  - Duplicated wallet fetching logic (also in `teacher-profile/page.tsx`)
  - Direct Firebase queries

### 2.6 Support Module
- **Location**: `app/support/page.tsx`
- **Issues**: 
  - Duplicated support ticket fetching logic (also in `teacher-profile/page.tsx` and `TeacherRepository`)
  - Direct Firebase queries with nested replies fetching

---

## 3. Where Business Logic Lives

### 3.1 Current Distribution

**✅ Properly Located:**
- `features/teachers/application/use-cases/` - Use cases for teacher operations
- `features/teachers/services/teacherService.ts` - Business logic for teacher operations
- `shared/utils/teacher.ts` - Utility functions for teacher data transformation
- `shared/utils/currency.ts` - Currency formatting logic

**❌ Improperly Located (Business Logic in UI):**
- `app/teacher-profile/page.tsx` - Contains:
  - Data fetching logic (lines 74-250)
  - Data transformation logic
  - Save operations with business rules
  - Wallet operations
  - Support ticket operations
- `app/teachers/page.tsx` - Contains:
  - Teacher listing logic
  - Rating calculation
  - Data transformation
- `app/admin/page.tsx` - Contains:
  - Application filtering logic
  - Status update logic
- `app/wallet/page.tsx` - Contains:
  - Wallet balance fetching
  - Transaction logic
  - Withdrawal request logic
- `app/support/page.tsx` - Contains:
  - Ticket fetching with nested replies
  - Ticket creation logic
- `contexts/AuthContext.tsx` - Contains:
  - Profile completion validation
  - Redirect logic based on account type
  - Teacher application checking

### 3.2 Business Logic Patterns

**Pattern 1: Direct Firebase Queries in Components**
```typescript
// Found in: app/teacher-profile/page.tsx, app/wallet/page.tsx, app/support/page.tsx
const walletQuery = query(
  collection(db, 'teacherWallets'),
  where('teacherId', '==', user.uid)
)
const walletSnapshot = await getDocs(walletQuery)
```

**Pattern 2: Repository Pattern (Partially Used)**
```typescript
// Found in: infrastructure/firebase/repositories/TeacherRepository.ts
async getWallet(teacherId: string): Promise<Wallet | null> {
  // Repository implementation
}
```

**Pattern 3: Service Layer (Inconsistent)**
```typescript
// Found in: features/teachers/services/teacherService.ts
// But not used consistently across the app
```

---

## 4. Duplicated Code

### 4.1 Firebase Query Patterns

**Duplicated: Teacher Application Fetching**
- `app/teacher-profile/page.tsx` (lines 85-99)
- `app/admin/page.tsx` (lines 50-67)
- `app/teachers/page.tsx` (lines 97-101)
- `TeacherRepository.findApplicationByUserId()` (lines 33-55)

**Duplicated: User Profile Fetching**
- `app/teacher-profile/page.tsx` (lines 101-108)
- `app/teachers/page.tsx` (lines 109-118)
- `TeacherRepository.getUserProfile()` (lines 107-120)

**Duplicated: Rating Calculation**
- `app/teachers/page.tsx` (lines 120-142)
- `app/teacher-profile/page.tsx` (lines 111-118)
- `TeacherRepository.getTeacherRating()` (lines 148-174)

**Duplicated: Reviews Fetching**
- `app/teachers/page.tsx` (lines 125-129)
- `TeacherRepository.getTeacherReviews()` (lines 125-143)

**Duplicated: Wallet Data Fetching**
- `app/wallet/page.tsx` (lines 66-110)
- `app/teacher-profile/page.tsx` (lines 166-200)
- `TeacherRepository.getWallet()` (lines 299-321)
- `TeacherRepository.getTransactions()` (lines 323-340)
- `TeacherRepository.getWithdrawalRequests()` (lines 342-359)

**Duplicated: Support Tickets Fetching**
- `app/support/page.tsx` (lines 61-95)
- `app/teacher-profile/page.tsx` (lines 202-230)
- `TeacherRepository.getSupportTickets()` (lines 405-439)

**Duplicated: Support Ticket Replies Fetching**
- `app/support/page.tsx` (lines 73-81)
- `app/teacher-profile/page.tsx` (lines 215-223)
- `TeacherRepository.getSupportTickets()` (lines 420-428)
- `TeacherRepository.getSupportTicket()` (lines 451-459)

### 4.2 Data Transformation Logic

**Duplicated: Currency Symbol Conversion**
- `app/teachers/page.tsx` (lines 61-73) - `getCurrencySymbol()` function
- `app/teacher-profile/page.tsx` (lines 260-262) - Inline logic
- `shared/utils/currency.ts` - `getCurrencySymbol()` function (proper location)

**Duplicated: Teacher Display Name**
- `app/teachers/page.tsx` (line 169) - Inline logic
- `shared/utils/teacher.ts` - `getTeacherDisplayName()` function (proper location)

**Duplicated: Teacher Image URL**
- `app/teachers/page.tsx` (lines 163-165) - Inline logic
- `shared/utils/teacher.ts` - `getTeacherImageUrl()` function (proper location)

**Duplicated: Teacher Qualifications**
- `app/teacher-profile/page.tsx` (line 257) - Uses utility
- `app/teachers/page.tsx` - Doesn't use utility
- `shared/utils/teacher.ts` - `getTeacherQualifications()` function

### 4.3 Error Handling Patterns

**Duplicated: Try-Catch with Console Error**
- Found in 20+ files with identical pattern:
```typescript
try {
  // operation
} catch (error) {
  console.error('Error message:', error)
  // sometimes setError, sometimes just log
}
```

### 4.4 State Management Patterns

**Duplicated: Loading State Management**
- Every component with async operations has:
```typescript
const [loading, setLoading] = useState(true)
// ... in useEffect
setLoading(true)
try {
  // fetch data
} finally {
  setLoading(false)
}
```

---

## 5. Spaghetti Patterns

### 5.1 God Components

**`app/teacher-profile/page.tsx` (2046 lines)**
- **Issues:**
  - Handles 6+ different concerns (personal info, qualifications, ijazahs, availability, wallet, support)
  - 27+ useState hooks
  - Multiple useEffect hooks with complex dependencies
  - Direct Firebase queries mixed with UI logic
  - Inline business logic for data transformation
  - Complex nested conditional rendering
  - Save operations scattered throughout

**`app/teachers/page.tsx` (669 lines)**
- **Issues:**
  - Data fetching, filtering, sorting, pagination all in one component
  - Complex nested data transformation
  - Direct Firebase queries
  - Business logic for rating calculation

**`app/admin/page.tsx` (525+ lines)**
- **Issues:**
  - Complex filtering logic
  - Direct Firebase queries
  - Status update logic mixed with UI

### 5.2 Circular Dependencies

**Potential Issue:**
- `features/teachers/` imports from `infrastructure/firebase/repositories/`
- But `infrastructure/` is outside `features/`
- This creates a dependency from feature to infrastructure, which should be inverted

### 5.3 Mixed Concerns

**Authentication Context (`contexts/AuthContext.tsx`):**
- ✅ Authentication logic
- ✅ User profile fetching
- ❌ Business logic for profile completion
- ❌ Redirect logic based on account type
- ❌ Teacher application checking

**App Store (`store/useAppStore.ts`):**
- ✅ UI state (modals, popups)
- ✅ Toast notifications
- ❌ Authentication state (duplicated with AuthContext)
- ❌ Form data (should be in feature-specific store)

### 5.4 Inconsistent Data Flow

**Pattern 1: Component → Firebase (Direct)**
```
Component → Firebase Query → Component State
```
- Found in: `app/teacher-profile/page.tsx`, `app/wallet/page.tsx`, `app/support/page.tsx`

**Pattern 2: Component → Repository → Firebase**
```
Component → Repository → Firebase → Component State
```
- Found in: `features/teachers/presentation/hooks/useTeacherProfile.ts`

**Pattern 3: Component → Service → Repository → Firebase**
```
Component → Service → Repository → Firebase → Component State
```
- Found in: `features/teachers/services/teacherService.ts` (but rarely used)

**Pattern 4: Component → Store → Firebase**
```
Component → Store → Firebase → Store State → Component
```
- Found in: `store/useUserStore.ts`

### 5.5 Prop Drilling

**Example: `addToast` prop**
- Passed through multiple components
- Some components use `useAppStore` directly
- Inconsistent usage

### 5.6 Magic Strings and Numbers

**Collection Names:**
- `'teacherApplications'` - used in 10+ files
- `'teacherWallets'` - used in 5+ files
- `'supportTickets'` - used in 4+ files
- `'teacherIjazahs'` - used in 3+ files
- `'teacherAvailability'` - used in 3+ files

**Status Values:**
- `'pending'`, `'approved'`, `'rejected'` - hardcoded in multiple places
- `'open'`, `'in_progress'`, `'closed'` - hardcoded for tickets

### 5.7 Inconsistent Error Handling

**Pattern 1: Silent Failures**
```typescript
try {
  // operation
} catch (error) {
  console.error('Error:', error)
  // No user feedback, no error state
}
```

**Pattern 2: Toast Notifications**
```typescript
try {
  // operation
} catch (error) {
  addToast('Error message', 'error')
}
```

**Pattern 3: Error State**
```typescript
const [error, setError] = useState(null)
try {
  // operation
} catch (error) {
  setError(error)
}
```

**Pattern 4: Thrown Errors**
```typescript
try {
  // operation
} catch (error) {
  throw error
}
```

### 5.8 Legacy Code Coexistence

**Two Parallel Systems:**
1. **Legacy Pages**: `legacy-pages/` folder (LandingPage, DashboardPage, EvalPage, PersonalInfoPage)
2. **New App Pages**: `app/` folder with similar functionality

**Routing Confusion:**
- `App.tsx` routes both legacy and new pages
- Some routes redirect from legacy to new
- Inconsistent patterns between the two

---

## 6. Architecture Issues Summary

### 6.1 Critical Issues

1. **No Consistent Architecture Pattern**
   - Mix of direct queries, repositories, and services
   - No clear separation of concerns

2. **Business Logic in UI Components**
   - 2000+ line components with business logic
   - Data fetching in components
   - Data transformation in components

3. **Massive Code Duplication**
   - Firebase queries duplicated 5-10 times
   - Data transformation logic duplicated
   - Error handling patterns duplicated

4. **Inconsistent State Management**
   - Some state in Zustand stores
   - Some state in React Context
   - Some state in local component state
   - No clear pattern for when to use what

### 6.2 Moderate Issues

5. **Incomplete Clean Architecture**
   - Started in `features/teachers/` but not completed
   - Not used consistently
   - Infrastructure layer in wrong location

6. **Type Safety Issues**
   - Inline type definitions in components
   - Some `any` types
   - Inconsistent type usage

7. **No Centralized Error Handling**
   - Different error handling patterns
   - No global error boundary
   - Inconsistent user feedback

8. **Magic Strings**
   - Collection names hardcoded
   - Status values hardcoded
   - No constants file

### 6.3 Minor Issues

9. **Inconsistent Naming**
   - Mix of camelCase and kebab-case in file names
   - Inconsistent component naming

10. **No Testing Infrastructure**
    - No test files found
    - No testing setup

11. **Documentation**
    - Some architecture docs exist but may be outdated
    - Inline comments in Arabic and English (inconsistent)

---

## 7. Recommendations Priority

### High Priority
1. **Extract business logic from UI components**
   - Move data fetching to services/repositories
   - Create use cases for complex operations
   - Reduce component size (target: <300 lines)

2. **Eliminate code duplication**
   - Centralize Firebase queries in repositories
   - Create shared utilities for data transformation
   - Use existing utilities consistently

3. **Standardize data flow**
   - Choose one pattern (recommend: Component → Service → Repository → Firebase)
   - Apply consistently across the app

4. **Break down god components**
   - Split `teacher-profile/page.tsx` into smaller components
   - Extract hooks for data fetching
   - Separate concerns

### Medium Priority
5. **Complete Clean Architecture implementation**
   - Move infrastructure inside features or create proper dependency injection
   - Ensure all features follow the same pattern
   - Create proper domain boundaries

6. **Centralize constants**
   - Create constants file for collection names
   - Create enums for status values
   - Remove magic strings

7. **Standardize error handling**
   - Create error handling utility
   - Implement global error boundary
   - Consistent user feedback patterns

### Low Priority
8. **Improve type safety**
   - Remove `any` types
   - Create shared type definitions
   - Ensure consistent type usage

9. **Add testing infrastructure**
   - Set up testing framework
   - Add unit tests for utilities
   - Add integration tests for services

10. **Documentation**
    - Update architecture documentation
    - Add JSDoc comments
    - Create developer guide

---

## 8. Code Metrics

### File Sizes
- `app/teacher-profile/page.tsx`: **2046 lines** ⚠️
- `app/teachers/page.tsx`: **669 lines** ⚠️
- `app/admin/page.tsx`: **525+ lines** ⚠️
- `infrastructure/firebase/repositories/TeacherRepository.ts`: **516 lines** ✅
- `store/useUserStore.ts`: **308 lines** ✅

### Complexity Indicators
- **27+ useState hooks** in `teacher-profile/page.tsx`
- **10+ useEffect hooks** in `teacher-profile/page.tsx`
- **49+ Firebase query instances** across the codebase
- **15+ duplicated query patterns**

### Architecture Coverage
- **Clean Architecture**: ~30% (only in `features/teachers/`)
- **Repository Pattern**: ~40% (exists but not consistently used)
- **Service Layer**: ~20% (exists but rarely used)
- **Direct Queries**: ~50% (still prevalent)

---

## Conclusion

The project shows **good intentions** with attempts at Clean Architecture in the teachers feature, but suffers from **inconsistent application** and **legacy code patterns** throughout. The main issues are:

1. **Architectural inconsistency** - mixing patterns
2. **Massive code duplication** - same queries/logic repeated
3. **Business logic in UI** - components doing too much
4. **God components** - files that are too large and complex

The codebase would benefit from a **systematic refactoring** to:
- Extract all business logic to services/use cases
- Centralize data access in repositories
- Break down large components
- Eliminate duplication
- Standardize patterns

The foundation is there (repositories, services, utilities), but they need to be **consistently applied** across the entire application.
