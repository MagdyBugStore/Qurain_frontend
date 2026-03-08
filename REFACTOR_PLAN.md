# Refactoring Plan - Quran Online Frontend

## Executive Summary

This document outlines a comprehensive refactoring plan to transform the Quran Online frontend from a tightly-coupled, monolithic structure into a clean, scalable, and maintainable architecture following clean architecture principles and React best practices.

---

## 1. Current Project Analysis

### 1.1 Project Overview
- **Framework**: React 19.2.0 with Vite
- **Routing**: React Router DOM v6
- **State Management**: Zustand
- **Backend**: Firebase (Firestore, Auth)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

### 1.2 Current Structure
```
src/
├── app/                    # Next.js-style app directory (mixed with React Router)
├── components/            # UI components
├── contexts/              # React contexts (AuthContext)
├── store/                 # Zustand stores
├── config/                # Configuration files
├── models/                # Data models
├── hooks/                 # Custom hooks
├── legacy-pages/          # Old page components
└── App.tsx                # Main app router
```

### 1.3 How the Project Currently Works

1. **Routing**: Uses React Router with routes defined in `App.tsx`
2. **Authentication**: Firebase Auth managed through `AuthContext`
3. **Data Fetching**: Direct Firebase calls in components using Firestore SDK
4. **State Management**: 
   - `useUserStore` for user profile data
   - `useAppStore` for app-wide UI state (modals, toasts, etc.)
5. **Components**: Mix of page components and reusable UI components
6. **Legacy Code**: Old pages in `legacy-pages/` directory alongside new `app/` structure

---

## 2. Identified Problems

### 2.1 Architectural Issues

#### **Tight Coupling**
- Components directly import and use Firebase SDK (`firebase/firestore`)
- Business logic mixed with UI rendering
- No abstraction layer between components and data source
- Components know too much about data structure

**Example:**
```typescript
// In TeacherDetailPageClient.tsx
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '../../../config/firebase'

// Direct Firebase queries in component
const applicationsQuery = query(
  collection(db, 'teacherApplications'),
  where('userId', '==', id),
  where('status', '==', 'approved')
)
```

#### **Large Files**
- `TeacherDetailPageClient.tsx`: 619 lines
- `TeachersPage.tsx`: 664 lines
- `AdminDashboard`: 525 lines
- These files contain data fetching, business logic, and UI rendering

#### **Unclear Responsibilities**
- Components handle:
  - Data fetching
  - Data transformation
  - Business logic
  - UI rendering
  - State management
- No clear separation of concerns

#### **Inconsistent Patterns**
- Mix of legacy pages (`legacy-pages/`) and new app structure (`app/`)
- Some components use hooks, others use direct state
- Inconsistent error handling
- Mixed data fetching patterns (some in useEffect, some in stores)

#### **No Service Layer**
- All data access logic scattered across components
- No centralized place for API/database operations
- Difficult to mock for testing
- No caching or optimization layer

#### **Store Organization**
- Stores are domain-agnostic (`useAppStore` mixes UI state with business state)
- Could be better organized by feature/domain
- Some state should be in stores, some in local component state

#### **Type Safety Issues**
- Interfaces defined inline in components
- No shared type definitions for common entities
- Inconsistent type usage

#### **Code Duplication**
- Similar Firebase query patterns repeated across components
- Currency conversion logic duplicated
- Teacher data transformation logic repeated

---

## 3. Proposed Clean Architecture

### 3.1 Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (Pages, Components, Hooks)          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Application Layer            │
│  (Use Cases, Business Logic)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Domain Layer                 │
│  (Models, Types, Interfaces)         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Infrastructure Layer         │
│  (Services, Repositories, Firebase)   │
└──────────────────────────────────────┘
```

### 3.2 New Folder Structure

```
src/
├── app/                          # App entry point
│   ├── App.tsx
│   └── main.tsx
│
├── features/                     # Feature-based organization
│   ├── teachers/
│   │   ├── components/          # Feature-specific components
│   │   │   ├── TeacherCard.tsx
│   │   │   ├── TeacherFilters.tsx
│   │   │   ├── TeacherDetail/
│   │   │   │   ├── TeacherDetailHeader.tsx
│   │   │   │   ├── TeacherDetailTabs.tsx
│   │   │   │   ├── TeacherBio.tsx
│   │   │   │   ├── TeacherAvailability.tsx
│   │   │   │   └── TeacherReviews.tsx
│   │   │   └── TeacherSidebar.tsx
│   │   ├── hooks/               # Feature-specific hooks
│   │   │   ├── useTeachers.ts
│   │   │   ├── useTeacherDetail.ts
│   │   │   └── useTeacherFilters.ts
│   │   ├── services/            # Feature-specific services
│   │   │   └── teacherService.ts
│   │   ├── stores/              # Feature-specific stores
│   │   │   └── useTeacherStore.ts
│   │   ├── types/               # Feature-specific types
│   │   │   └── teacher.types.ts
│   │   └── pages/               # Feature pages
│   │       ├── TeachersPage.tsx
│   │       └── TeacherDetailPage.tsx
│   │
│   ├── bookings/
│   ├── admin/
│   ├── auth/
│   └── profile/
│
├── shared/                       # Shared across features
│   ├── components/              # Reusable UI components
│   │   ├── ui/                 # Basic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Card.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   └── forms/              # Form components
│   │       ├── FormInput.tsx
│   │       └── FormSelect.tsx
│   │
│   ├── hooks/                   # Shared hooks
│   │   ├── useAuth.ts
│   │   ├── useToast.ts
│   │   └── useDebounce.ts
│   │
│   ├── services/                # Shared services
│   │   ├── firebase/           # Firebase abstractions
│   │   │   ├── firestore.service.ts
│   │   │   ├── auth.service.ts
│   │   │   └── storage.service.ts
│   │   └── api/                # API services
│   │       └── httpClient.ts
│   │
│   ├── stores/                  # Shared stores
│   │   ├── useAuthStore.ts
│   │   └── useAppStore.ts      # UI-only state
│   │
│   ├── utils/                   # Utility functions
│   │   ├── currency.ts
│   │   ├── date.ts
│   │   └── validation.ts
│   │
│   ├── types/                   # Shared types
│   │   ├── common.types.ts
│   │   └── api.types.ts
│   │
│   └── constants/               # Constants
│       ├── routes.ts
│       └── config.ts
│
├── infrastructure/              # External dependencies
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── firestore.ts
│   │   └── auth.ts
│   └── i18n/
│
├── domain/                      # Domain models
│   ├── entities/               # Business entities
│   │   ├── User.ts
│   │   ├── Teacher.ts
│   │   └── Booking.ts
│   └── value-objects/          # Value objects
│       └── Currency.ts
│
└── routes/                      # Route configuration
    ├── index.tsx
    └── routes.config.tsx
```

---

## 4. Refactoring Strategy

### 4.1 Phase 1: Foundation (Infrastructure Layer)

**Goal**: Create abstraction layers for external dependencies

#### Tasks:
1. **Create Repository Pattern**
   - `infrastructure/firebase/repositories/` - Abstract Firebase operations
   - `shared/services/repositories/` - Repository interfaces
   - Example: `TeacherRepository`, `UserRepository`, `BookingRepository`

2. **Create Service Layer**
   - `shared/services/firebase/` - Firebase service abstractions
   - `features/*/services/` - Feature-specific business logic

3. **Extract Types**
   - Move all interfaces to `domain/entities/` or `features/*/types/`
   - Create shared types in `shared/types/`

4. **Create Utility Functions**
   - Extract currency conversion to `shared/utils/currency.ts`
   - Extract date formatting to `shared/utils/date.ts`
   - Extract validation logic to `shared/utils/validation.ts`

### 4.2 Phase 2: Feature Extraction

**Goal**: Break down large components into smaller, focused pieces

#### Tasks:
1. **Extract Data Fetching Logic**
   - Create custom hooks: `useTeachers`, `useTeacherDetail`
   - Move Firebase queries to services/repositories
   - Implement proper error handling

2. **Extract Business Logic**
   - Move filtering logic to `useTeacherFilters` hook
   - Move sorting logic to utilities
   - Extract data transformation to services

3. **Component Decomposition**
   - Split `TeacherDetailPageClient` into:
     - `TeacherDetailHeader`
     - `TeacherDetailTabs`
     - `TeacherBio`
     - `TeacherAvailability`
     - `TeacherReviews`
     - `TeacherSidebar`
   - Split `TeachersPage` into:
     - `TeacherList`
     - `TeacherFilters`
     - `TeacherPagination`

4. **Create Feature Stores**
   - `features/teachers/stores/useTeacherStore.ts`
   - Move teacher-related state from components to store

### 4.3 Phase 3: Reorganization

**Goal**: Organize code by feature, not by type

#### Tasks:
1. **Migrate Legacy Pages**
   - Move legacy pages to new structure
   - Update imports and routes
   - Remove `legacy-pages/` directory

2. **Reorganize Components**
   - Move feature-specific components to `features/*/components/`
   - Keep only truly shared components in `shared/components/`

3. **Update Routing**
   - Create route configuration file
   - Use lazy loading for pages
   - Implement route guards properly

### 4.4 Phase 4: Cleanup & Optimization

**Goal**: Improve code quality and performance

#### Tasks:
1. **Remove Code Duplication**
   - Create shared hooks for common patterns
   - Extract repeated logic to utilities

2. **Improve Type Safety**
   - Add proper TypeScript types everywhere
   - Use discriminated unions where appropriate
   - Remove `any` types

3. **Add Error Boundaries**
   - Create error boundary components
   - Implement proper error handling

4. **Optimize Performance**
   - Implement React.memo where needed
   - Use useMemo and useCallback appropriately
   - Add loading states and skeletons

---

## 5. Detailed Refactoring Examples

### 5.1 Example: Teacher Service Layer

**Before** (in component):
```typescript
// In TeacherDetailPageClient.tsx
useEffect(() => {
  const fetchTeacherData = async () => {
    const applicationsQuery = query(
      collection(db, 'teacherApplications'),
      where('userId', '==', id),
      where('status', '==', 'approved')
    )
    const querySnapshot = await getDocs(applicationsQuery)
    // ... more logic
  }
}, [id])
```

**After** (with service layer):
```typescript
// features/teachers/services/teacherService.ts
export class TeacherService {
  async getTeacherById(id: string): Promise<Teacher | null> {
    // Implementation
  }
  
  async getTeachers(filters?: TeacherFilters): Promise<Teacher[]> {
    // Implementation
  }
}

// features/teachers/hooks/useTeacherDetail.ts
export function useTeacherDetail(id: string) {
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const teacherService = new TeacherService()
    teacherService.getTeacherById(id)
      .then(setTeacher)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])
  
  return { teacher, loading, error }
}

// features/teachers/pages/TeacherDetailPage.tsx
export function TeacherDetailPage() {
  const { id } = useParams()
  const { teacher, loading, error } = useTeacherDetail(id!)
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!teacher) return <NotFound />
  
  return <TeacherDetailView teacher={teacher} />
}
```

### 5.2 Example: Component Decomposition

**Before** (619 lines in one file):
```typescript
// TeacherDetailPageClient.tsx - everything in one component
```

**After** (split into focused components):
```typescript
// features/teachers/components/TeacherDetail/TeacherDetailHeader.tsx
export function TeacherDetailHeader({ teacher }: { teacher: Teacher }) {
  return (
    <div className="profile-header">
      <TeacherAvatar teacher={teacher} />
      <TeacherInfo teacher={teacher} />
    </div>
  )
}

// features/teachers/components/TeacherDetail/TeacherDetailTabs.tsx
export function TeacherDetailTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('personal')
  // Tab logic
}

// features/teachers/pages/TeacherDetailPage.tsx
export function TeacherDetailPage() {
  const { teacher, loading } = useTeacherDetail(id!)
  
  return (
    <Layout>
      <TeacherDetailHeader teacher={teacher} />
      <TeacherDetailTabs />
      <TeacherDetailContent teacher={teacher} />
      <TeacherSidebar teacher={teacher} />
    </Layout>
  )
}
```

### 5.3 Example: Repository Pattern

**Before** (direct Firebase calls):
```typescript
// In component
const q = query(
  collection(db, 'teacherApplications'),
  where('status', '==', 'approved')
)
const snapshot = await getDocs(q)
```

**After** (with repository):
```typescript
// infrastructure/firebase/repositories/TeacherRepository.ts
export class TeacherRepository {
  async findApproved(): Promise<TeacherApplication[]> {
    const q = query(
      collection(db, 'teacherApplications'),
      where('status', '==', 'approved')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
  
  async findById(id: string): Promise<TeacherApplication | null> {
    // Implementation
  }
}

// features/teachers/services/teacherService.ts
export class TeacherService {
  constructor(private repository: TeacherRepository) {}
  
  async getApprovedTeachers(): Promise<Teacher[]> {
    const applications = await this.repository.findApproved()
    // Transform and enrich data
    return applications.map(this.transformToTeacher)
  }
}
```

---

## 6. Migration Strategy

### 6.1 Incremental Migration

1. **Start with Infrastructure**
   - Create repository interfaces
   - Implement Firebase repositories
   - No component changes yet

2. **Create Services**
   - Build service layer on top of repositories
   - Keep existing components working

3. **Extract Hooks**
   - Create custom hooks that use services
   - Gradually replace direct Firebase calls

4. **Refactor Components**
   - One feature at a time
   - Start with smallest/most isolated features
   - Keep old code until new code is tested

5. **Remove Legacy Code**
   - Only after all features migrated
   - Update all imports
   - Remove unused files

### 6.2 Testing Strategy

- **Unit Tests**: Services, repositories, utilities
- **Integration Tests**: Hooks, stores
- **Component Tests**: UI components
- **E2E Tests**: Critical user flows

---

## 7. Benefits of Refactoring

### 7.1 Maintainability
- Clear separation of concerns
- Easy to locate code
- Reduced cognitive load

### 7.2 Scalability
- Easy to add new features
- Reusable components and services
- Consistent patterns

### 7.3 Testability
- Services can be easily mocked
- Components are pure and testable
- Business logic isolated

### 7.4 Developer Experience
- Better IDE support
- Easier onboarding
- Clearer code structure

---

## 8. Risks & Mitigation

### 8.1 Risks
- **Breaking Changes**: Risk of introducing bugs during refactoring
- **Time Investment**: Significant time required
- **Team Coordination**: Need to coordinate with team

### 8.2 Mitigation
- **Incremental Approach**: Refactor one feature at a time
- **Feature Flags**: Use feature flags for gradual rollout
- **Comprehensive Testing**: Test each refactored piece
- **Code Reviews**: Thorough reviews before merging

---

## 9. Success Metrics

### 9.1 Code Quality Metrics
- Average file size < 200 lines
- Cyclomatic complexity < 10
- Test coverage > 80%
- Zero direct Firebase imports in components

### 9.2 Developer Metrics
- Time to add new feature reduced by 50%
- Time to fix bug reduced by 40%
- Onboarding time reduced by 30%

---

## 10. Timeline Estimate

- **Phase 1 (Foundation)**: 1-2 weeks
- **Phase 2 (Feature Extraction)**: 2-3 weeks
- **Phase 3 (Reorganization)**: 1-2 weeks
- **Phase 4 (Cleanup)**: 1 week

**Total**: 5-8 weeks (depending on team size and feature complexity)

---

## 11. Next Steps

1. Review and approve this plan
2. Set up feature branch for refactoring
3. Start with Phase 1 (Foundation)
4. Create initial repository interfaces
5. Begin incremental migration

---

## Appendix: File Size Analysis

Current large files that need refactoring:
- `TeacherDetailPageClient.tsx`: 619 lines
- `TeachersPage.tsx`: 664 lines
- `AdminDashboard.tsx`: 525 lines
- `DashboardPage.tsx`: 640 lines (legacy)

Target: All files < 200 lines

---

## Appendix: Dependency Graph

```
Components → Hooks → Services → Repositories → Firebase
     ↓         ↓        ↓           ↓
   Stores ← Types ← Utils ← Constants
```

---

*This refactoring plan is a living document and should be updated as the refactoring progresses.*
