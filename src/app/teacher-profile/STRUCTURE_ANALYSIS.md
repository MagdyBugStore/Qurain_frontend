# تحليل البنية الحالية لـ teacher-profile

## 🔍 الوضع الحالي

### البنية العامة للتطبيق:

```
src/
├── app/                          # صفحات بسيطة (wrappers)
│   ├── teachers/[id]/
│   │   └── page.tsx             # ✅ wrapper بسيط يستدعي features
│   ├── profile/[id]/
│   │   └── page.tsx             # ✅ wrapper بسيط
│   └── teacher-profile/
│       ├── page.tsx             # ❌ صفحة معقدة (456 سطر)
│       ├── components/          # ❌ مكونات داخل app/
│       ├── hooks/               # ❌ hooks داخل app/
│       ├── constants/           # ❌ constants داخل app/
│       ├── utils/                # ❌ utils داخل app/
│       └── types/                # ❌ types داخل app/
│
└── features/                     # Clean Architecture
    └── teachers/
        ├── application/use-cases/  # ✅ Business logic
        ├── domain/entities/        # ✅ Domain models
        ├── presentation/
        │   ├── hooks/              # ✅ Presentation hooks
        │   ├── components/         # ✅ Presentation components
        │   └── pages/              # ✅ Pages
        └── services/               # ✅ Services
```

## ❌ المشكلة

**teacher-profile لا يتبع نفس البنية!**

### المشاكل:
1. **الموقع**: موجود في `app/` بدلاً من `features/`
2. **البنية**: يحتوي على components, hooks, constants, utils, types داخل `app/`
3. **عدم التطابق**: باقي الصفحات في `app/` هي wrappers بسيطة فقط
4. **التكرار**: يوجد hooks في `app/teacher-profile/hooks/` و hooks في `features/teachers/presentation/hooks/`

## ✅ الحل المطلوب

### الخيار 1: نقل إلى features/teachers (مُوصى به)

```
src/
├── app/
│   └── teacher-profile/
│       └── page.tsx              # wrapper بسيط فقط
│
└── features/teachers/
    ├── presentation/
    │   ├── pages/
    │   │   └── TeacherProfilePage.tsx  # ✅ الصفحة الرئيسية
    │   ├── components/
    │   │   └── TeacherProfile/          # ✅ مكونات teacher-profile
    │   │       ├── ProfileCard.tsx
    │   │       ├── QuickLinks.tsx
    │   │       ├── SubTabs.tsx
    │   │       └── sections/
    │   │           ├── AboutSection.tsx
    │   │           ├── BenefitsSection.tsx
    │   │           └── ...
    │   └── hooks/                        # ✅ hooks
    │       ├── useTeacherProfileData.ts
    │       ├── useBenefits.ts
    │       └── ...
    ├── application/use-cases/            # ✅ موجودة بالفعل
    └── domain/entities/                  # ✅ موجودة بالفعل
```

### الخيار 2: إنشاء feature منفصل

```
src/
├── app/
│   └── teacher-profile/
│       └── page.tsx              # wrapper بسيط
│
└── features/
    └── teacher-profile/           # feature منفصل
        ├── presentation/
        │   ├── pages/
        │   ├── components/
        │   └── hooks/
        ├── application/use-cases/
        └── domain/entities/
```

## 📋 التوصية

**الخيار 1 أفضل** لأن:
1. teacher-profile جزء من feature teachers
2. يوجد بالفعل use-cases في `features/teachers/application/use-cases/`
3. يوجد domain entities في `features/teachers/domain/entities/`
4. يقلل التكرار ويوحد البنية

## 🔧 الخطوات المطلوبة

1. نقل `app/teacher-profile/components/` → `features/teachers/presentation/components/TeacherProfile/`
2. نقل `app/teacher-profile/hooks/` → `features/teachers/presentation/hooks/`
3. نقل `app/teacher-profile/constants/` → `features/teachers/presentation/constants/` أو `shared/constants/`
4. نقل `app/teacher-profile/utils/` → `features/teachers/presentation/utils/` أو `shared/utils/`
5. نقل `app/teacher-profile/types/` → `features/teachers/domain/types/` أو دمجها مع entities
6. نقل `app/teacher-profile/page.tsx` → `features/teachers/presentation/pages/TeacherProfilePage.tsx`
7. تحديث `app/teacher-profile/page.tsx` ليكون wrapper بسيط فقط
