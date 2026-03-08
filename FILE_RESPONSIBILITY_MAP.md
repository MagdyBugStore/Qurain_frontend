# File Responsibility Mapping

This document maps each file's current responsibilities and identifies what needs to be refactored.

---

## Critical Files Analysis

### 🔴 `src/app/teacher-profile/page.tsx` (1,767 lines)

**Current Responsibilities** (TOO MANY):
1. ✅ Data fetching (Firebase queries)
2. ✅ State management (50+ useState hooks)
3. ✅ Business logic (calculations, transformations)
4. ✅ Form handling (multiple forms)
5. ✅ UI rendering (entire page layout)
6. ✅ Event handling (onClick, onSubmit)
7. ✅ Side effects (useEffect hooks)
8. ✅ Validation logic
9. ✅ Error handling
10. ✅ Loading states

**Should Be Split Into**:
- `features/teachers/presentation/pages/TeacherProfilePage.tsx` (~50 lines) - Page orchestration
- `features/teachers/presentation/components/TeacherProfile/PersonalInfoSection.tsx` (~150 lines)
- `features/teachers/presentation/components/TeacherProfile/QualificationsSection.tsx` (~200 lines)
- `features/teachers/presentation/components/TeacherProfile/AvailabilitySection.tsx` (~200 lines)
- `features/teachers/presentation/components/TeacherProfile/WalletSection.tsx` (~300 lines)
- `features/teachers/presentation/components/TeacherProfile/SupportSection.tsx` (~400 lines)
- `features/teachers/presentation/hooks/useTeacherProfile.ts` (~100 lines)
- `features/teachers/application/use-cases/GetTeacherProfile.ts` (~50 lines)
- `features/teachers/application/use-cases/SaveQualifications.ts` (~50 lines)
- `features/teachers/application/use-cases/SaveAvailability.ts` (~50 lines)
- `features/teachers/application/use-cases/SubmitWithdrawal.ts` (~50 lines)
- `features/teachers/application/use-cases/CreateSupportTicket.ts` (~50 lines)

---

### 🟡 `src/app/teachers/page.tsx` (669 lines)

**Current Responsibilities**:
1. ✅ Data fetching (Firebase queries)
2. ✅ State management (filters, pagination, sorting)
3. ✅ Business logic (filtering, sorting calculations)
4. ✅ UI rendering (list, filters, pagination)
5. ✅ Event handling

**Should Be Split Into**:
- `features/teachers/presentation/pages/TeachersListPage.tsx` (~100 lines)
- `features/teachers/presentation/components/TeacherList/TeacherList.tsx` (~150 lines)
- `features/teachers/presentation/components/TeacherList/TeacherCard.tsx` (~100 lines)
- `features/teachers/presentation/components/TeacherList/TeacherFilters.tsx` (~150 lines)
- `features/teachers/presentation/components/TeacherList/TeacherPagination.tsx` (~100 lines)
- `features/teachers/presentation/hooks/useTeacherList.ts` (~100 lines)
- `features/teachers/application/use-cases/GetTeacherList.ts` (~50 lines)

---

### 🟡 `src/App.tsx` (229 lines)

**Current Responsibilities**:
1. ✅ Route definitions
2. ✅ SEO configuration
3. ✅ Toast management
4. ✅ Layout orchestration

**Should Be Split Into**:
- `app/router.tsx` - Route definitions
- `app/seo.ts` - SEO configuration
- `app/providers.tsx` - Global providers
- `shared/components/layout/AppLayout.tsx` - Layout wrapper

---

### 🟢 `src/contexts/AuthContext.tsx` (190 lines)

**Current Responsibilities**:
1. ✅ Authentication state management
2. ✅ Firebase auth integration
3. ✅ User profile fetching
4. ✅ Redirect logic

**Issues**:
- Redirect logic should be in a hook or middleware
- Profile fetching mixed with auth

**Should Be Split Into**:
- `features/auth/presentation/contexts/AuthContext.tsx` - Auth state only
- `features/auth/presentation/hooks/useRequireAuth.ts` - Redirect logic
- `features/auth/application/use-cases/GetUserProfile.ts` - Profile fetching

---

### 🟢 `src/store/useAppStore.ts` (122 lines)

**Current Responsibilities**:
1. ✅ Global UI state (modals, popups)
2. ✅ Toast notifications
3. ✅ Form state
4. ✅ App-level state

**Status**: ✅ Generally well-structured, but could be split into slices

**Should Be Split Into**:
- `store/slices/uiSlice.ts` - UI state (modals, popups)
- `store/slices/toastSlice.ts` - Toast notifications
- `store/slices/formSlice.ts` - Form state

---

## Feature Files Analysis

### Teachers Feature (`src/features/teachers/`)

**Current Structure** (Partial Implementation):
```
features/teachers/
├── components/TeacherDetail/     ✅ Good separation
├── hooks/useTeacherDetail.ts    ✅ Good
├── pages/TeacherDetailPage.tsx  ✅ Good
└── services/teacherService.ts   ✅ Good
```

**Missing**:
- Domain entities
- Repository interfaces
- Use cases (business logic)
- More granular components

---

## Component Files Analysis

### `src/components/` Structure

**Current**:
```
components/
├── auth/ProtectedRoute.tsx      ✅ Good
├── common/                       ✅ Good
├── forms/                        ⚠️ Mixed concerns
├── layout/                       ✅ Good
├── modals/                       ✅ Good
└── sections/                     ✅ Good
```

**Issues**:
- Forms are generic but some are feature-specific
- No clear separation between shared and feature-specific

**Should Be**:
```
shared/components/
├── common/                       ✅ Shared UI primitives
├── forms/                        ✅ Generic form components
└── layout/                       ✅ Layout components

features/[feature]/presentation/components/
└── [feature-specific components]
```

---

## Infrastructure Files

### `src/infrastructure/firebase/repositories/TeacherRepository.ts`

**Current Responsibilities**:
1. ✅ Data access (Firebase queries)
2. ✅ Data transformation

**Status**: ✅ Good start, but needs:
- Interface definition in domain layer
- More methods for complete CRUD
- Error handling improvements

---

## Shared Utilities

### `src/shared/utils/teacher.ts`

**Current Responsibilities**:
1. ✅ Helper functions for teacher data
2. ✅ Data transformation utilities

**Status**: ✅ Good, but should be:
- Split into smaller, focused utilities
- Moved to domain layer if business logic
- Kept in shared if truly generic

---

## Legacy Files

### `src/legacy-pages/`

**Files**:
- `LandingPage.tsx`
- `EvalPage.tsx`
- `DashboardPage.tsx`
- `LoginPage.tsx`
- `PersonalInfoPage.tsx`
- `ProgramsPage.tsx`
- `TeachersPage.tsx`
- `AdminPage.tsx`

**Status**: ⚠️ Technical debt
- Should be migrated or removed
- Some functionality may be duplicated in new pages

---

## Summary by Responsibility

### Data Fetching
**Current Locations**:
- Directly in page components (❌ Bad)
- In some hooks (⚠️ Partial)
- In repositories (✅ Good, but incomplete)

**Should Be**:
- Only in repositories
- Called through use cases
- Used via custom hooks in components

### Business Logic
**Current Locations**:
- In components (❌ Bad)
- In services (✅ Good, but incomplete)
- In utilities (⚠️ Partial)

**Should Be**:
- In use cases (application layer)
- In domain entities (domain layer)
- Never in components

### UI Rendering
**Current Locations**:
- In page components (✅ OK, but too large)
- In feature components (✅ Good)

**Should Be**:
- In small, focused components
- Composed in page components
- Reusable components in shared/

### State Management
**Current Locations**:
- Local component state (✅ OK for UI state)
- Zustand stores (✅ Good for global state)
- React Context (✅ Good for auth)

**Should Be**:
- Local state for component-specific UI
- Zustand for global app state
- Context for provider-based state (auth, theme)

---

## Refactoring Priority

### High Priority (Critical Issues)
1. 🔴 `app/teacher-profile/page.tsx` - 1,767 lines
2. 🟡 `app/teachers/page.tsx` - 669 lines
3. 🟡 `App.tsx` - Route/SEO separation

### Medium Priority (Architectural Improvements)
4. 🟢 `contexts/AuthContext.tsx` - Split concerns
5. 🟢 `store/useAppStore.ts` - Split into slices
6. ⚠️ Migrate legacy pages

### Low Priority (Polish)
7. ✅ Improve existing feature structure
8. ✅ Add missing domain entities
9. ✅ Complete repository implementations

---

## File Size Guidelines

| File Type | Target Size | Max Size | Current Violations |
|-----------|-------------|----------|-------------------|
| Page Components | 50-150 lines | 200 lines | teacher-profile/page.tsx (1,767) |
| Feature Components | 50-200 lines | 300 lines | Multiple |
| Hooks | 50-100 lines | 150 lines | None |
| Services/Use Cases | 50-150 lines | 200 lines | None |
| Repositories | 100-200 lines | 300 lines | None |
| Utilities | 20-50 lines | 100 lines | None |

---

## Next Steps

1. **Start with highest priority**: Refactor `teacher-profile/page.tsx`
2. **Create domain layer**: Define entities and interfaces
3. **Create use cases**: Extract business logic
4. **Split components**: Break into focused sections
5. **Create hooks**: Extract data fetching logic
6. **Update imports**: Fix all references
7. **Test**: Ensure functionality preserved
