# أماكن التحقق من Authentication - Authentication Check Locations

## 📍 الأماكن التي يتم فيها التحقق من Authentication

### 1. **AuthContext** - التحقق الرئيسي من Firebase
**الملف:** `src/contexts/AuthContext.tsx`

هذا هو المكان الرئيسي الذي يتحقق من حالة المصادقة باستخدام Firebase:

```typescript
// السطر 41 - يستخدم onAuthStateChanged من Firebase
const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
  setUser(currentUser);  // إذا كان currentUser موجود = مسجل دخول
  
  if (currentUser) {
    // المستخدم مسجل دخول ✅
    // جلب ملف المستخدم
  } else {
    // المستخدم غير مسجل دخول ❌
    // مسح ملف المستخدم
  }
});
```

**الاستخدام:**
```typescript
const { user, loading } = useAuth();

// التحقق من المصادقة
if (user) {
  // المستخدم مسجل دخول
} else {
  // المستخدم غير مسجل دخول
}
```

---

### 2. **ProtectedRoute** - حماية المسارات
**الملف:** `src/components/auth/ProtectedRoute.tsx`

يستخدم هذا المكون لحماية المسارات التي تتطلب تسجيل الدخول:

```typescript
// السطر 25 - جلب user من AuthContext
const { user, loading: authLoading } = useAuth();

// السطر 37 - التحقق من المصادقة
if (!user) {
  navigate('/login');  // إعادة التوجيه إلى صفحة تسجيل الدخول
  return;
}
```

**الاستخدام:**
```tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

---

### 3. **صفحة Personal Info** - التحقق في الصفحة
**الملف:** `src/app/personal-info/page.tsx`

```typescript
// السطر 18 - جلب user من AuthContext
const { user, userProfile, saveUserProfile } = useAuth();

// السطر 25 - التحقق من المصادقة
useEffect(() => {
  if (!user) {
    navigate('/login')  // إعادة التوجيه إذا لم يكن مسجل دخول
    return
  }
  // باقي الكود...
}, [user, userProfile, navigate]);
```

---

### 4. **useAuthGuard Hook** - Hook للتحقق من المصادقة
**الملف:** `src/hooks/useRequireAuth.ts`

```typescript
// السطر 10 - جلب isAuthenticated من useAppStore
const { isAuthenticated, openLoginModal } = useAppStore();

// السطر 13 - التحقق من المصادقة
const requireAuth = (callback?: () => void): boolean => {
  if (!isAuthenticated) {
    openLoginModal();  // فتح نافذة تسجيل الدخول
    return false;
  }
  return true;
};
```

**الاستخدام:**
```typescript
const { requireAuth } = useAuthGuard();

const handleAction = () => {
  if (requireAuth()) {
    // تنفيذ الإجراء
  }
};
```

---

### 5. **Firebase Rules** - التحقق على مستوى قاعدة البيانات
**الملف:** `firebase.rules`

```javascript
// السطر 8 - دالة التحقق من المصادقة
function isAuthenticated() {
  return request.auth != null;  // إذا كان request.auth موجود = مسجل دخول
}

// السطر 14 - دالة التحقق من الملكية
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

---

## 📝 ملخص طرق التحقق

| المكان | الملف | الطريقة | الاستخدام |
|--------|-------|---------|-----------|
| **AuthContext** | `src/contexts/AuthContext.tsx` | `onAuthStateChanged` | التحقق الرئيسي من Firebase |
| **ProtectedRoute** | `src/components/auth/ProtectedRoute.tsx` | `if (!user)` | حماية المسارات |
| **Personal Info** | `src/app/personal-info/page.tsx` | `if (!user)` | التحقق في الصفحة |
| **useAuthGuard** | `src/hooks/useRequireAuth.ts` | `if (!isAuthenticated)` | Hook للتحقق |
| **Firebase Rules** | `firebase.rules` | `request.auth != null` | حماية قاعدة البيانات |

---

## 🔍 مثال عملي - كيفية الاستخدام

### في أي Component:

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>جاري التحميل...</div>;
  }

  if (!user) {
    return <div>يجب تسجيل الدخول</div>;
  }

  return <div>مرحباً {user.email}</div>;
}
```

### لحماية Route:

```typescript
import ProtectedRoute from '../components/auth/ProtectedRoute';

<Route 
  path="/protected" 
  element={
    <ProtectedRoute requireProfileComplete={true}>
      <ProtectedPage />
    </ProtectedRoute>
  } 
/>
```

---

## ⚠️ ملاحظات مهمة

1. **AuthContext** هو المصدر الرئيسي للحالة - استخدمه دائماً
2. **ProtectedRoute** يستخدم AuthContext داخلياً
3. **useAuthGuard** يستخدم `useAppStore` (قد يكون قديماً)
4. **Firebase Rules** تحمي قاعدة البيانات على مستوى الخادم
