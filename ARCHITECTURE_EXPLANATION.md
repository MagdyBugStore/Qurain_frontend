# Architecture Explanation - Refactored Quran Online Frontend

## Overview

This document explains the new clean architecture implemented for the Quran Online frontend project, demonstrating how the codebase has been transformed from a tightly-coupled structure to a maintainable, scalable architecture.

## Architecture Principles

### Clean Architecture Layers

The refactored codebase follows clean architecture principles with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│      Presentation Layer                  │
│  (Components, Hooks, Pages)             │
│  - React components                      │
│  - Custom hooks                          │
│  - Page orchestrators                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Application Layer                   │
│  (Services, Business Logic)              │
│  - Feature services                      │
│  - Business rules                        │
│  - Data transformation                   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Domain Layer                        │
│  (Types, Models, Utilities)             │
│  - Type definitions                      │
│  - Domain models                         │
│  - Utility functions                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Infrastructure Layer                │
│  (Repositories, External APIs)           │
│  - Firebase repositories                │
│  - External service adapters             │
└──────────────────────────────────────────┘
```

## Folder Structure

### New Structure

```
src/
├── features/                          # Feature-based organization
│   ├── teachers/
│   │   ├── components/                # Feature-specific components
│   │   │   └── TeacherDetail/
│   │   │       ├── TeacherDetailHeader.tsx
│   │   │       ├── TeacherDetailTabs.tsx
│   │   │       ├── TeacherBio.tsx
│   │   │       ├── TeacherAvailability.tsx
│   │   │       ├── TeacherReviews.tsx
│   │   │       ├── TeacherSidebar.tsx
│   │   │       └── TeacherVideoIntro.tsx
│   │   ├── hooks/                     # Feature-specific hooks
│   │   │   └── useTeacherDetail.ts
│   │   ├── services/                  # Feature business logic
│   │   │   └── teacherService.ts
│   │   ├── stores/                    # Feature-specific stores (future)
│   │   ├── types/                     # Feature-specific types
│   │   │   └── teacher.types.ts
│   │   └── pages/                     # Feature pages
│   │       └── TeacherDetailPage.tsx
│   │
│   ├── bookings/                      # Other features follow same pattern
│   ├── admin/
│   └── auth/
│
├── shared/                             # Shared across features
│   ├── components/                    # Reusable UI components
│   │   ├── ui/                        # Basic UI primitives
│   │   ├── layout/                    # Layout components
│   │   └── forms/                     # Form components
│   ├── hooks/                         # Shared hooks
│   │   ├── useAuth.ts
│   │   └── useToast.ts
│   ├── services/                      # Shared services
│   ├── stores/                        # Shared stores
│   ├── utils/                         # Utility functions
│   │   ├── currency.ts
│   │   └── teacher.ts
│   ├── types/                         # Shared types
│   │   └── teacher.types.ts
│   └── constants/                     # Constants
│
├── infrastructure/                    # External dependencies
│   └── firebase/
│       ├── config.ts
│       └── repositories/
│           └── TeacherRepository.ts
│
└── domain/                            # Domain models (future)
    └── entities/
```

## Layer Responsibilities

### 1. Infrastructure Layer

**Purpose**: Abstract external dependencies (Firebase, APIs, etc.)

**Location**: `src/infrastructure/`

**Example**: `TeacherRepository.ts`

```typescript
export class TeacherRepository {
  async findApprovedByUserId(userId: string): Promise<TeacherApplication | null> {
    // Direct Firebase operations
    const q = query(collection(db, 'teacherApplications'), ...);
    // ...
  }
}
```

**Responsibilities**:
- Direct interaction with external services
- Data fetching and persistence
- Error handling for network issues
- No business logic

**Benefits**:
- Can swap Firebase for another backend easily
- Easy to mock for testing
- Isolated external dependencies

### 2. Domain Layer

**Purpose**: Core business entities and rules

**Location**: `src/shared/types/` and `src/shared/utils/`

**Example**: `teacher.types.ts`, `currency.ts`

```typescript
export interface TeacherApplication {
  id: string;
  fullName?: string;
  // ... domain model
}

export function getCurrencySymbol(currency?: Currency): string {
  // Business rule for currency display
}
```

**Responsibilities**:
- Type definitions
- Domain models
- Business rules (utilities)
- Value objects

**Benefits**:
- Single source of truth for types
- Reusable business logic
- Type safety

### 3. Application Layer

**Purpose**: Orchestrate business logic and coordinate between layers

**Location**: `src/features/*/services/`

**Example**: `teacherService.ts`

```typescript
export class TeacherService {
  async getTeacherDetailById(userId: string): Promise<TeacherDetailData | null> {
    // Orchestrate: fetch from repository, transform, combine data
    const application = await this.repository.findApprovedByUserId(userId);
    const profile = await this.repository.getUserProfile(userId);
    const rating = await this.repository.getTeacherRating(userId);
    // Combine and transform
    return { application, profile, rating, ... };
  }
}
```

**Responsibilities**:
- Business logic orchestration
- Data transformation
- Combining data from multiple sources
- No UI concerns

**Benefits**:
- Reusable business logic
- Testable without UI
- Single responsibility

### 4. Presentation Layer

**Purpose**: UI components and user interaction

**Location**: `src/features/*/components/` and `src/features/*/pages/`

#### Hooks

**Example**: `useTeacherDetail.ts`

```typescript
export function useTeacherDetail(userId: string | undefined) {
  const [data, setData] = useState<TeacherDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const service = new TeacherService();
    service.getTeacherDetailById(userId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);
  
  return { data, loading, error };
}
```

**Responsibilities**:
- State management for UI
- Data fetching coordination
- Loading/error states
- No direct Firebase calls

#### Components

**Example**: `TeacherDetailHeader.tsx`

```typescript
export function TeacherDetailHeader({ application, profile, rating }: Props) {
  // Pure presentation logic
  const teacherName = getTeacherDisplayName(profile, application);
  return <div>...</div>;
}
```

**Responsibilities**:
- Rendering UI
- User interaction
- Composing smaller components
- No business logic
- No data fetching

#### Pages

**Example**: `TeacherDetailPage.tsx`

```typescript
export function TeacherDetailPage() {
  const { data, loading } = useTeacherDetail(id);
  // Compose components
  return (
    <Layout>
      <TeacherDetailHeader {...props} />
      <TeacherDetailTabs />
      {/* ... */}
    </Layout>
  );
}
```

**Responsibilities**:
- Route handling
- Component composition
- High-level orchestration
- No business logic

## Data Flow

### Example: Loading Teacher Details

```
1. User navigates to /teachers/:id
   ↓
2. TeacherDetailPage component mounts
   ↓
3. useTeacherDetail hook called
   ↓
4. TeacherService.getTeacherDetailById() called
   ↓
5. TeacherRepository methods called:
   - findApprovedByUserId()
   - getUserProfile()
   - getTeacherRating()
   ↓
6. Data flows back up:
   Repository → Service → Hook → Component
   ↓
7. Components render with data
```

## Key Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access

```typescript
// Infrastructure layer
class TeacherRepository {
  async findApprovedByUserId(id: string) { /* Firebase */ }
}

// Service layer uses repository
class TeacherService {
  constructor(private repository: TeacherRepository) {}
  async getTeacherDetailById(id: string) {
    return await this.repository.findApprovedByUserId(id);
  }
}
```

**Benefits**:
- Easy to swap data sources
- Testable (mock repository)
- Single responsibility

### 2. Service Layer Pattern

**Purpose**: Encapsulate business logic

```typescript
class TeacherService {
  async getTeacherDetailById(userId: string) {
    // Orchestrate multiple repository calls
    // Transform data
    // Apply business rules
    // Return domain model
  }
}
```

**Benefits**:
- Reusable business logic
- Testable independently
- Clear separation of concerns

### 3. Custom Hooks Pattern

**Purpose**: Encapsulate component logic

```typescript
function useTeacherDetail(userId: string) {
  // State management
  // Service calls
  // Error handling
  return { data, loading, error };
}
```

**Benefits**:
- Reusable component logic
- Clean component code
- Testable hooks

### 4. Component Composition

**Purpose**: Build complex UIs from simple components

```typescript
// Small, focused components
<TeacherDetailHeader />
<TeacherDetailTabs />
<TeacherBio />
<TeacherAvailability />

// Composed in page
<TeacherDetailPage>
  <TeacherDetailHeader />
  <TeacherDetailTabs />
  {/* ... */}
</TeacherDetailPage>
```

**Benefits**:
- Reusable components
- Easy to test
- Clear responsibilities

## Benefits of This Architecture

### 1. Maintainability
- **Small files**: Average 100 lines vs 600+ lines
- **Clear structure**: Easy to find code
- **Single responsibility**: Each file does one thing

### 2. Testability
- **Isolated layers**: Test each layer independently
- **Mockable dependencies**: Easy to mock repositories/services
- **Pure functions**: Utilities are easy to test

### 3. Scalability
- **Feature-based**: Easy to add new features
- **Reusable code**: Services and components can be reused
- **Consistent patterns**: Same structure for all features

### 4. Developer Experience
- **Clear organization**: Know where to find code
- **Type safety**: Centralized types prevent errors
- **Easy onboarding**: Clear structure for new developers

## Migration Strategy

### Incremental Approach

1. **Phase 1**: Create infrastructure (repositories, services)
   - ✅ Done for teachers feature

2. **Phase 2**: Refactor one feature at a time
   - ✅ Done for teacher detail page
   - ⏳ Next: Teachers list page
   - ⏳ Next: Booking flow
   - ⏳ Next: Admin dashboard

3. **Phase 3**: Migrate legacy pages
   - Move from `legacy-pages/` to new structure

4. **Phase 4**: Cleanup
   - Remove old code
   - Update all imports
   - Add tests

## Comparison: Before vs After

### Before (Monolithic)

```typescript
// 619 lines in one file
export default function TeacherDetailPageClient() {
  // Direct Firebase calls
  const q = query(collection(db, 'teacherApplications'), ...);
  
  // Business logic
  const currency = application.currency === 'SAR' ? 'ر.س' : ...;
  
  // Data transformation
  const teacherName = profile?.displayName || ...;
  
  // UI rendering
  return <div>...</div>; // 500+ lines of JSX
}
```

**Problems**:
- Hard to test
- Hard to maintain
- Hard to reuse
- Mixed concerns

### After (Layered)

```typescript
// Infrastructure: TeacherRepository.ts
class TeacherRepository {
  async findApprovedByUserId(id: string) { /* Firebase */ }
}

// Service: teacherService.ts
class TeacherService {
  async getTeacherDetailById(id: string) {
    // Business logic
  }
}

// Hook: useTeacherDetail.ts
function useTeacherDetail(id: string) {
  // State management
}

// Component: TeacherDetailHeader.tsx
function TeacherDetailHeader({ application, profile }) {
  // Pure UI
}

// Page: TeacherDetailPage.tsx
function TeacherDetailPage() {
  const { data } = useTeacherDetail(id);
  return <TeacherDetailHeader {...data} />;
}
```

**Benefits**:
- Easy to test each layer
- Easy to maintain
- Easy to reuse
- Clear separation

## Next Steps

1. **Apply to Other Features**
   - Teachers list page
   - Booking flow
   - Admin features

2. **Add Testing**
   - Unit tests for each layer
   - Integration tests
   - E2E tests

3. **Performance Optimization**
   - Add React.memo
   - Implement caching
   - Add loading states

4. **Documentation**
   - Component documentation
   - API documentation
   - Architecture diagrams

## Conclusion

The refactored architecture provides:

✅ **Clear separation of concerns**  
✅ **Testable code**  
✅ **Maintainable structure**  
✅ **Scalable foundation**  
✅ **Better developer experience**  

This architecture can be applied to all features in the project, creating a consistent, maintainable codebase.

---

*For detailed refactoring plan, see `REFACTOR_PLAN.md`*  
*For refactoring summary, see `REFACTORING_SUMMARY.md`*
