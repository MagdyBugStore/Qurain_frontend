# Firebase User Store - متجر بيانات المستخدم

## نظرة عامة

تم إنشاء نظام متكامل لإدارة بيانات المستخدم باستخدام Firebase Firestore. يتضمن النظام:

1. **UserModel** (`src/models/UserModel.ts`) - نموذج بيانات المستخدم
2. **useUserStore** (`src/store/useUserStore.ts`) - متجر Zustand لإدارة بيانات المستخدم من Firestore
3. **AuthContext** (محدث) - يستخدم Firestore بدلاً من localStorage
4. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`) - مكون لحماية المسارات

## الملفات المُنشأة

### 1. UserModel (`src/models/UserModel.ts`)
نموذج بيانات المستخدم يحتوي على:
- جميع الحقول المطلوبة لملف المستخدم
- دالة `isProfileComplete()` للتحقق من اكتمال الملف
- دالة `createDefaultUserProfile()` لإنشاء ملف افتراضي

### 2. useUserStore (`src/store/useUserStore.ts`)
متجر Zustand يوفر:
- `fetchUserProfile(user)` - جلب ملف المستخدم من Firestore
- `saveUserProfile(user, profile)` - حفظ ملف المستخدم في Firestore
- `updateUserProfile(user, updates)` - تحديث ملف المستخدم
- `subscribeToUserProfile(user)` - الاشتراك في التحديثات الفورية
- `clearUserProfile()` - مسح ملف المستخدم من المتجر
- `isProfileComplete()` - التحقق من اكتمال الملف

### 3. AuthContext (محدث)
تم تحديث `AuthContext` لاستخدام Firestore:
- يحمل ملف المستخدم تلقائياً عند تسجيل الدخول
- يشترك في التحديثات الفورية للملف
- يحفظ الملف في Firestore بدلاً من localStorage

### 4. ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)
مكون لحماية المسارات:
- يتحقق من تسجيل الدخول
- يمكنه التحقق من اكتمال الملف الشخصي
- يعيد التوجيه تلقائياً إذا لزم الأمر

## كيفية الاستخدام

### استخدام useUserStore مباشرة

```typescript
import { useUserStore } from '../store/useUserStore';
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user } = useAuth();
  const { userProfile, fetchUserProfile, saveUserProfile } = useUserStore();

  useEffect(() => {
    if (user) {
      fetchUserProfile(user);
    }
  }, [user, fetchUserProfile]);

  const handleSave = async () => {
    if (user) {
      await saveUserProfile(user, {
        firstName: 'أحمد',
        lastName: 'محمد',
      });
    }
  };

  return (
    <div>
      {userProfile && (
        <p>مرحباً {userProfile.firstName}</p>
      )}
    </div>
  );
}
```

### استخدام AuthContext (موصى به)

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, userProfile, saveUserProfile } = useAuth();

  const handleSave = async () => {
    await saveUserProfile({
      firstName: 'أحمد',
      lastName: 'محمد',
    });
  };

  return (
    <div>
      {userProfile && (
        <p>مرحباً {userProfile.firstName}</p>
      )}
    </div>
  );
}
```

### استخدام ProtectedRoute

```typescript
import ProtectedRoute from '../components/auth/ProtectedRoute';

// حماية مسار يتطلب تسجيل الدخول فقط
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>

// حماية مسار يتطلب تسجيل الدخول واكتمال الملف
<Route 
  path="/student-profile" 
  element={
    <ProtectedRoute requireProfileComplete={true}>
      <StudentProfilePage />
    </ProtectedRoute>
  } 
/>
```

## هيكل البيانات في Firestore

يتم حفظ بيانات المستخدم في collection باسم `users` مع document ID = `user.uid`:

```typescript
{
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  photoURL?: string;
  accountType: 'student' | 'teacher' | null;
  goals?: string[];
  ageGroup?: string | null;
  level?: string | null;
  budget?: number;
  learningGoal?: string | null;
  completed?: boolean;
  profileCompletedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
```

## ملاحظات مهمة

1. **التحديثات الفورية**: يتم الاشتراك تلقائياً في التحديثات الفورية عند تسجيل الدخول
2. **الملف الافتراضي**: إذا لم يكن ملف المستخدم موجوداً، يتم إنشاؤه تلقائياً
3. **التحقق من اكتمال الملف**: استخدم `isProfileComplete()` للتحقق من اكتمال الملف
4. **التوافق**: النظام متوافق مع الكود الحالي ويستخدم نفس الواجهة
