# خطة نقل teacher-profile إلى features/teachers

## 🎯 الهدف

نقل `app/teacher-profile/` إلى `features/teachers/presentation/` ليتوافق مع بنية التطبيق

## 📋 الخطوات

### 1. نقل المكونات (Components)
```
app/teacher-profile/components/ 
  → features/teachers/presentation/components/TeacherProfile/
```

**الملفات:**
- `components/ProfileCard.tsx`
- `components/QuickLinks.tsx`
- `components/SubTabs.tsx`
- `components/SaveMessageBanner.tsx`
- `components/PendingBanner.tsx`
- `components/sections/*.tsx` (7 files)
- `components/shared/*.tsx` (3 files)

### 2. نقل الـ Hooks
```
app/teacher-profile/hooks/
  → features/teachers/presentation/hooks/
```

**الملفات:**
- `hooks/useTeacherProfileData.ts` → دمج مع `useTeacherProfile.ts` الموجود
- `hooks/useEditingStates.ts`
- `hooks/useSaveMessage.ts`
- `hooks/useBenefits.ts`
- `hooks/useSessionContent.ts`
- `hooks/useQualifications.ts` → دمج مع `useSaveQualifications.ts` الموجود
- `hooks/useIjazahs.ts` → دمج مع `useSaveIjazahs.ts` الموجود
- `hooks/useAvailability.ts` → دمج مع `useSaveAvailability.ts` الموجود

### 3. نقل Constants
```
app/teacher-profile/constants/
  → features/teachers/presentation/constants/
  أو
  → shared/constants/ (إذا كانت مشتركة)
```

**الملفات:**
- `constants/schedule.ts`
- `constants/editingSections.ts`

### 4. نقل Utils
```
app/teacher-profile/utils/
  → features/teachers/presentation/utils/
  أو
  → shared/utils/ (إذا كانت مشتركة)
```

**الملفات:**
- `utils/dataParsing.ts`
- `utils/videoEmbed.ts`
- `utils/validation.ts`

### 5. نقل Types
```
app/teacher-profile/types/
  → features/teachers/domain/types/
  أو دمجها مع entities الموجود
```

**الملفات:**
- `types/index.ts` → دمج مع domain entities

### 6. نقل الصفحة
```
app/teacher-profile/page.tsx
  → features/teachers/presentation/pages/TeacherProfilePage.tsx
```

### 7. إنشاء Wrapper بسيط
```
app/teacher-profile/page.tsx (جديد)
  → wrapper بسيط يستدعي TeacherProfilePage من features
```

## ⚠️ ملاحظات مهمة

1. **دمج Hooks**: بعض الـ hooks موجودة بالفعل في `features/teachers/presentation/hooks/`، يجب دمجها
2. **Use Cases**: استخدم الـ use cases الموجودة في `features/teachers/application/use-cases/`
3. **Domain Entities**: استخدم الـ entities الموجودة في `features/teachers/domain/entities/`
4. **التحديثات**: تحديث جميع الـ imports في الملفات

## ✅ النتيجة النهائية

```
src/
├── app/
│   └── teacher-profile/
│       └── page.tsx              # wrapper بسيط فقط
│
└── features/teachers/
    ├── presentation/
    │   ├── pages/
    │   │   └── TeacherProfilePage.tsx
    │   ├── components/
    │   │   └── TeacherProfile/
    │   │       ├── ProfileCard.tsx
    │   │       ├── QuickLinks.tsx
    │   │       ├── SubTabs.tsx
    │   │       └── sections/
    │   └── hooks/
    │       ├── useTeacherProfile.ts (مدمج)
    │       ├── useEditingStates.ts
    │       └── ...
    ├── application/use-cases/    # موجودة بالفعل
    └── domain/entities/           # موجودة بالفعل
```
