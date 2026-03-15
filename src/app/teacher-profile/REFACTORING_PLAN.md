# Teacher Profile Page Refactoring Plan

## 📋 Current State Analysis

**File**: `src/app/teacher-profile/page.tsx` (1,528 lines)

### Current Issues
1. **Too many responsibilities**: Data fetching, state management, business logic, UI rendering all in one file
2. **Excessive state variables**: 20+ useState hooks managing different concerns
3. **Large component**: 1,500+ lines making it hard to maintain and test
4. **Mixed concerns**: Business logic intertwined with UI rendering
5. **Repeated patterns**: Similar save/edit logic duplicated across sections
6. **Hard to test**: Difficult to unit test individual features

### Current Structure
```
page.tsx (1,528 lines)
├── State Management (20+ useState hooks)
├── Data Fetching (useEffect with complex logic)
├── Business Logic (save handlers, validation)
├── UI Rendering (all sections inline)
└── Event Handlers (many onClick/onChange handlers)
```

---

## 🎯 Refactoring Goals

1. **Separation of Concerns**: Split data, logic, and UI into separate layers
2. **Reusability**: Extract common patterns into reusable hooks and components
3. **Maintainability**: Each file should have a single, clear responsibility
4. **Testability**: Business logic should be testable independently
5. **Readability**: Main page should be a clean orchestration of components

---

## 📁 Proposed File Structure

```
src/app/teacher-profile/
├── page.tsx                          # Main page (orchestration only, ~100 lines)
│
├── components/
│   ├── ProfileCard.tsx               # Sidebar profile card
│   ├── QuickLinks.tsx                # Quick navigation links
│   ├── SubTabs.tsx                   # Content/Qualifications/Availability/Reviews tabs
│   ├── SaveMessageBanner.tsx         # Success/error message display
│   ├── PendingBanner.tsx             # Pending status banner
│   │
│   ├── sections/
│   │   ├── AboutSection.tsx          # "About Me" section with bio and video
│   │   ├── BenefitsSection.tsx       # "What students will gain" section
│   │   ├── SessionContentSection.tsx # "What the session includes" section
│   │   ├── QualificationsSection.tsx # Education qualifications
│   │   ├── IjazahsSection.tsx        # Certifications/Ijazahs
│   │   ├── AvailabilitySection.tsx   # Weekly availability schedule
│   │   └── ReviewsSection.tsx         # Reviews display
│   │
│   └── shared/
│       ├── EditButton.tsx            # Reusable edit button
│       ├── SaveCancelButtons.tsx     # Reusable save/cancel button group
│       └── LoadingSpinner.tsx        # Loading state component
│
├── hooks/
│   ├── useTeacherProfileData.ts      # Main data fetching hook
│   ├── useEditingStates.ts           # Manage all editing states
│   ├── useSaveMessage.ts             # Save message state management
│   │
│   ├── useBenefits.ts                # Benefits CRUD operations
│   ├── useSessionContent.ts          # Session content CRUD operations
│   ├── useQualifications.ts           # Qualifications CRUD operations
│   ├── useIjazahs.ts                 # Ijazahs CRUD operations
│   ├── useAvailability.ts            # Availability management
│   └── usePersonalInfo.ts            # Already exists, keep as is
│
├── constants/
│   ├── schedule.ts                   # TIME_SLOTS, DAYS, INITIAL_AVAILABILITY
│   └── editingSections.ts            # Section keys type definitions
│
├── utils/
│   ├── dataParsing.ts                # JSON parsing for benefits/sessionContent
│   ├── videoEmbed.ts                 # Video URL to embed conversion
│   └── validation.ts                 # Validation helpers
│
└── types/
    └── index.ts                      # Local type definitions
```

---

## 🔧 Detailed Refactoring Steps

### Step 1: Extract Constants

**File**: `constants/schedule.ts`
```typescript
export const TIME_SLOTS = [...]
export const DAYS = [...]
export const INITIAL_AVAILABILITY = [...]
```

**File**: `constants/editingSections.ts`
```typescript
export type EditingSection = 
  | 'personalInfo' 
  | 'about' 
  | 'benefits' 
  | 'sessionContent' 
  | 'qualifications' 
  | 'ijazahs' 
  | 'availability' 
  | 'reviews'
```

---

### Step 2: Create Utility Functions

**File**: `utils/dataParsing.ts`
- `parseBenefitsFromJSON(teachingStyle: string): Benefit[]`
- `parseSessionContentFromJSON(sessionContent: string): SessionContentItem[]`
- `stringifyBenefits(benefits: Benefit[]): string`
- `stringifySessionContent(items: SessionContentItem[]): string`

**File**: `utils/videoEmbed.ts`
- `getVideoEmbedUrl(url: string): string | null`
- `isYouTubeUrl(url: string): boolean`
- `isVimeoUrl(url: string): boolean`

**File**: `utils/validation.ts`
- `validateBenefits(benefits: Benefit[]): ValidationResult`
- `validateSessionContent(items: SessionContentItem[]): ValidationResult`
- `hasEmptyBenefits(benefits: Benefit[]): boolean`

---

### Step 3: Create Custom Hooks

#### 3.1 Data Management Hook
**File**: `hooks/useTeacherProfileData.ts`
```typescript
export function useTeacherProfileData(userId: string | undefined) {
  // Fetch all teacher data
  // Return: { teacherApplication, teacherProfile, rating, reviewsCount, reviews, qualifications, ijazahs, availability, loading, error }
}
```

#### 3.2 Editing States Hook
**File**: `hooks/useEditingStates.ts`
```typescript
export function useEditingStates() {
  // Manage all editing states in one place
  // Return: { editingStates, toggleEdit, isEditing }
}
```

#### 3.3 Save Message Hook
**File**: `hooks/useSaveMessage.ts`
```typescript
export function useSaveMessage() {
  // Manage save messages with auto-dismiss
  // Return: { saveMessage, showSuccess, showError, clear }
}
```

#### 3.4 Section-Specific Hooks
**File**: `hooks/useBenefits.ts`
```typescript
export function useBenefits(teacherApplication: TeacherApplication | null) {
  // Benefits CRUD operations
  // Return: { benefits, addBenefit, updateBenefit, deleteBenefit, saveBenefits, saving }
}
```

**File**: `hooks/useSessionContent.ts`
```typescript
export function useSessionContent(teacherApplication: TeacherApplication | null) {
  // Session content CRUD operations
  // Return: { items, addItem, updateItem, deleteItem, saveItems, saving }
}
```

**File**: `hooks/useQualifications.ts`
```typescript
export function useQualifications(teacherApplication: TeacherApplication | null) {
  // Qualifications CRUD operations
  // Return: { qualifications, addQualification, updateQualification, deleteQualification, saveQualifications, saving }
}
```

**File**: `hooks/useIjazahs.ts`
```typescript
export function useIjazahs(teacherApplication: TeacherApplication | null) {
  // Ijazahs CRUD operations
  // Return: { ijazahs, addIjazah, updateIjazah, deleteIjazah, saveIjazahs, saving }
}
```

**File**: `hooks/useAvailability.ts`
```typescript
export function useAvailability(teacherApplication: TeacherApplication | null, isPending: boolean) {
  // Availability management
  // Return: { availability, toggleSlot, saveAvailability, saving }
}
```

---

### Step 4: Extract UI Components

#### 4.1 Shared Components

**File**: `components/shared/EditButton.tsx`
```typescript
interface EditButtonProps {
  onClick: () => void;
  disabled?: boolean;
}
```

**File**: `components/shared/SaveCancelButtons.tsx`
```typescript
interface SaveCancelButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}
```

**File**: `components/shared/LoadingSpinner.tsx`
```typescript
// Simple loading spinner component
```

#### 4.2 Layout Components

**File**: `components/ProfileCard.tsx`
```typescript
interface ProfileCardProps {
  teacherName: string;
  teacherTitle: string;
  profileImage: string;
  rating: number;
  reviewsCount: number;
  sessionPrice: number;
  currency: string;
  yearsOfExperience?: number;
  nationality?: string;
  isApproved: boolean;
  isPending: boolean;
  onEditProfile: () => void;
}
```

**File**: `components/QuickLinks.tsx`
```typescript
interface QuickLinksProps {
  activeTab: 'personal' | 'wallet' | 'support' | null;
  onTabChange: (tab: 'personal' | 'wallet' | 'support') => void;
}
```

**File**: `components/SubTabs.tsx`
```typescript
interface SubTabsProps {
  activeTab: 'content' | 'qualifications' | 'availability' | 'reviews' | null;
  onTabChange: (tab: 'content' | 'qualifications' | 'availability' | 'reviews') => void;
}
```

**File**: `components/SaveMessageBanner.tsx`
```typescript
interface SaveMessageBannerProps {
  message: { type: 'success' | 'error'; text: string } | null;
}
```

**File**: `components/PendingBanner.tsx`
```typescript
// Simple pending status banner
```

#### 4.3 Section Components

**File**: `components/sections/AboutSection.tsx`
```typescript
interface AboutSectionProps {
  bio: string;
  introVideo: string;
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onSave: (bio: string, introVideo: string) => Promise<void>;
  saving: boolean;
}
```

**File**: `components/sections/BenefitsSection.tsx`
```typescript
interface BenefitsSectionProps {
  benefits: Benefit[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: 'title' | 'subject', value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  maxBenefits?: number;
}
```

**File**: `components/sections/SessionContentSection.tsx`
```typescript
interface SessionContentSectionProps {
  items: SessionContentItem[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: 'title' | 'subject', value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}
```

**File**: `components/sections/QualificationsSection.tsx`
```typescript
interface QualificationsSectionProps {
  qualifications: Qualification[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Qualification, value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}
```

**File**: `components/sections/IjazahsSection.tsx`
```typescript
interface IjazahsSectionProps {
  ijazahs: Ijazah[];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: string) => void;
  onDelete: (index: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}
```

**File**: `components/sections/AvailabilitySection.tsx`
```typescript
interface AvailabilitySectionProps {
  availability: (string | null)[][];
  isEditing: boolean;
  isApproved: boolean;
  isPending: boolean;
  onToggleEdit: () => void;
  onToggleSlot: (dayIndex: number, timeIndex: number) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}
```

**File**: `components/sections/ReviewsSection.tsx`
```typescript
interface ReviewsSectionProps {
  reviews: Review[];
  rating: number;
  reviewsCount: number;
  isApproved: boolean;
  isPending: boolean;
}
```

---

### Step 5: Refactor Main Page

**File**: `page.tsx` (Final Structure)
```typescript
export default function TeacherProfilePage() {
  const { user, userProfile } = useAuth();
  
  // Data fetching
  const { 
    teacherApplication, 
    teacherProfile, 
    rating, 
    reviewsCount, 
    reviews,
    qualifications,
    ijazahs,
    availability,
    loading 
  } = useTeacherProfileData(user?.uid);
  
  // UI state
  const { editingStates, toggleEdit } = useEditingStates();
  const { saveMessage, showSaveMessage } = useSaveMessage();
  const [activeQuickTab, setActiveQuickTab] = useState<'personal' | 'wallet' | 'support' | null>('personal');
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'qualifications' | 'availability' | 'reviews' | null>('content');
  
  // Section hooks
  const benefitsHook = useBenefits(teacherApplication);
  const sessionContentHook = useSessionContent(teacherApplication);
  const qualificationsHook = useQualifications(teacherApplication);
  const ijazahsHook = useIjazahs(teacherApplication);
  const availabilityHook = useAvailability(teacherApplication, isPending);
  
  // Computed values
  const teacherName = getTeacherDisplayName(teacherProfile || userProfile, teacherApplication);
  const teacherTitle = getTeacherTitle(teacherApplication);
  const profileImage = getTeacherImageUrl(teacherProfile || userProfile);
  const sessionPrice = teacherApplication?.hourlyRate || 0;
  const currency = getCurrencySymbol(teacherApplication?.currency);
  const isPending = teacherApplication?.status === TEACHER_APPLICATION_STATUS.PENDING;
  const isApproved = teacherApplication?.status === TEACHER_APPLICATION_STATUS.APPROVED;
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <>
      <Header />
      <div className="...">
        <main className="...">
          <SaveMessageBanner message={saveMessage} />
          {isPending && <PendingBanner />}
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <ProfileCard
                teacherName={teacherName}
                teacherTitle={teacherTitle}
                profileImage={profileImage}
                rating={rating}
                reviewsCount={reviewsCount}
                sessionPrice={sessionPrice}
                currency={currency}
                yearsOfExperience={teacherApplication?.yearsOfExperience}
                nationality={teacherApplication?.nationality}
                isApproved={isApproved}
                isPending={isPending}
                onEditProfile={() => {
                  setActiveQuickTab('personal');
                  setActiveSubTab('content');
                  toggleEdit('about');
                }}
              />
              
              <QuickLinks
                activeTab={activeQuickTab}
                onTabChange={setActiveQuickTab}
              />
            </aside>
            
            {/* Main Content */}
            <div className="lg:col-span-8 xl:col-span-9">
              {activeQuickTab === 'personal' && (
                <SubTabs
                  activeTab={activeSubTab}
                  onTabChange={setActiveSubTab}
                />
              )}
              
              {activeQuickTab === 'personal' && activeSubTab === 'content' && (
                <>
                  <AboutSection
                    bio={teacherApplication?.bio || ''}
                    introVideo={personalInfo.introVideo}
                    isEditing={editingStates.about}
                    isApproved={isApproved}
                    isPending={isPending}
                    onToggleEdit={() => toggleEdit('about')}
                    onSave={handleSavePersonalInfo}
                    saving={saving}
                  />
                  
                  <BenefitsSection
                    benefits={benefitsHook.benefits}
                    isEditing={editingStates.benefits}
                    isApproved={isApproved}
                    isPending={isPending}
                    onToggleEdit={() => toggleEdit('benefits')}
                    onAdd={benefitsHook.addBenefit}
                    onUpdate={benefitsHook.updateBenefit}
                    onDelete={benefitsHook.deleteBenefit}
                    onSave={benefitsHook.saveBenefits}
                    saving={benefitsHook.saving}
                  />
                  
                  <SessionContentSection
                    items={sessionContentHook.items}
                    isEditing={editingStates.sessionContent}
                    isApproved={isApproved}
                    isPending={isPending}
                    onToggleEdit={() => toggleEdit('sessionContent')}
                    onAdd={sessionContentHook.addItem}
                    onUpdate={sessionContentHook.updateItem}
                    onDelete={sessionContentHook.deleteItem}
                    onSave={sessionContentHook.saveItems}
                    saving={sessionContentHook.saving}
                  />
                </>
              )}
              
              {activeQuickTab === 'personal' && activeSubTab === 'qualifications' && (
                <>
                  <QualificationsSection
                    qualifications={qualificationsHook.qualifications}
                    isEditing={editingStates.qualifications}
                    isApproved={isApproved}
                    isPending={isPending}
                    onToggleEdit={() => toggleEdit('qualifications')}
                    onAdd={qualificationsHook.addQualification}
                    onUpdate={qualificationsHook.updateQualification}
                    onDelete={qualificationsHook.deleteQualification}
                    onSave={qualificationsHook.saveQualifications}
                    saving={qualificationsHook.saving}
                  />
                  
                  <IjazahsSection
                    ijazahs={ijazahsHook.ijazahs}
                    isEditing={editingStates.ijazahs}
                    isApproved={isApproved}
                    isPending={isPending}
                    onToggleEdit={() => toggleEdit('ijazahs')}
                    onAdd={ijazahsHook.addIjazah}
                    onUpdate={ijazahsHook.updateIjazah}
                    onDelete={ijazahsHook.deleteIjazah}
                    onSave={ijazahsHook.saveIjazahs}
                    saving={ijazahsHook.saving}
                  />
                </>
              )}
              
              {activeQuickTab === 'personal' && activeSubTab === 'availability' && (
                <AvailabilitySection
                  availability={availabilityHook.availability}
                  isEditing={editingStates.availability}
                  isApproved={isApproved}
                  isPending={isPending}
                  onToggleEdit={() => toggleEdit('availability')}
                  onToggleSlot={availabilityHook.toggleSlot}
                  onSave={availabilityHook.saveAvailability}
                  saving={availabilityHook.saving}
                />
              )}
              
              {activeQuickTab === 'personal' && activeSubTab === 'reviews' && (
                <ReviewsSection
                  reviews={reviews}
                  rating={rating}
                  reviewsCount={reviewsCount}
                  isApproved={isApproved}
                  isPending={isPending}
                />
              )}
              
              {activeQuickTab === 'wallet' && (
                <WalletSection
                  teacherId={teacherApplication?.userId || teacherApplication?.id || null}
                  onSave={showSaveMessage}
                />
              )}
              
              {activeQuickTab === 'support' && (
                <SupportSection
                  userId={user?.uid || null}
                  userName={userProfile?.displayName || user?.email || 'مستخدم'}
                  onSave={showSaveMessage}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
```

---

## 📊 Expected Results

### Before
- **1 file**: 1,528 lines
- **20+ useState hooks** in one component
- **Mixed concerns**: Data, logic, UI all together
- **Hard to test**: Business logic tied to component
- **Difficult to maintain**: Changes affect entire file

### After
- **~30 files**: Each with single responsibility
- **Main page**: ~100-150 lines (orchestration only)
- **Separated concerns**: Data, logic, UI in separate layers
- **Testable**: Hooks and utilities can be tested independently
- **Maintainable**: Changes isolated to specific files
- **Reusable**: Components and hooks can be reused elsewhere

---

## 🚀 Implementation Order

1. **Phase 1: Extract Constants & Utils** (Low risk)
   - Create constants files
   - Create utility functions
   - Test utilities independently

2. **Phase 2: Create Custom Hooks** (Medium risk)
   - Start with data fetching hook
   - Create editing states hook
   - Create save message hook
   - Create section-specific hooks one by one
   - Test each hook independently

3. **Phase 3: Extract UI Components** (Medium risk)
   - Start with shared components
   - Extract layout components
   - Extract section components one by one
   - Test components in isolation

4. **Phase 4: Refactor Main Page** (High risk - needs careful testing)
   - Replace inline code with hooks
   - Replace inline JSX with components
   - Test full page functionality
   - Fix any integration issues

---

## ✅ Success Criteria

- [ ] Main page file is under 200 lines
- [ ] Each component has single responsibility
- [ ] All business logic is in hooks
- [ ] All UI is in components
- [ ] No code duplication
- [ ] All existing functionality works
- [ ] Code is easier to test
- [ ] Code is easier to maintain

---

## 🔍 Testing Strategy

1. **Unit Tests**: Test hooks and utilities independently
2. **Component Tests**: Test each component in isolation
3. **Integration Tests**: Test main page with all components
4. **E2E Tests**: Test full user flows

---

## 📝 Notes

- Keep existing components (`PersonalInfoSection`, `WalletSection`, `SupportSection`) as they are already extracted
- Maintain backward compatibility during refactoring
- Test each phase before moving to next
- Consider using TypeScript strict mode for better type safety
- Document any breaking changes
