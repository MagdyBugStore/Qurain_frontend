# بنية وظائف Firestore في التطبيق

## 📊 الوضع الحالي

### ❌ **لا، وظائف Firestore ليست في ملف واحد**

الوظائف موزعة على عدة ملفات حسب الـ **Domain** (المجال):

## 📁 البنية الحالية

```
src/
├── infrastructure/firebase/repositories/
│   ├── TeacherRepository.ts      (656 lines) ✅ كل وظائف Firestore للمعلمين
│   ├── StudentRepository.ts       (484 lines) ✅ كل وظائف Firestore للطلاب
│   └── AdminRepository.ts         (123 lines) ✅ وظائف Firestore للإدارة
│
└── services/                       (Business Logic Layer)
    ├── teacherService.ts          ✅ يستخدم TeacherRepository
    ├── studentService.ts          ✅ يستخدم StudentRepository
    ├── bookingService.ts          ✅ يستخدم Repositories
    └── ...
```

## 🔍 تحليل TeacherRepository.ts

### الوظائف الموجودة (656 سطر):

**Teacher Application:**
- `findApplicationByUserId()`
- `findApprovedByUserId()`
- `findAllApproved()`
- `createApplication()`
- `updateApplication()`
- `updateApplicationStatus()`

**Qualifications:**
- `saveQualifications()`
- `getQualifications()`

**Ijazahs:**
- `saveIjazah()`
- `getIjazahs()`
- `updateIjazah()`
- `deleteIjazah()`

**Availability:**
- `saveAvailability()`
- `getAvailability()`
- `subscribeToAvailability()`

**Wallet:**
- `getWallet()`
- `createWithdrawalRequest()`
- `getWithdrawalRequests()`
- `updateWithdrawalStatus()`

**Support Tickets:**
- `createSupportTicket()`
- `getSupportTickets()`
- `addTicketReply()`
- `subscribeToSupportTickets()`

**Reviews:**
- `getReviews()`
- `getRating()`

## ⚠️ المشاكل الحالية

### 1. **ملفات كبيرة جداً**
- `TeacherRepository.ts`: **656 سطر** ❌
- `StudentRepository.ts`: **484 سطر** ❌

### 2. **كل شيء في ملف واحد**
- كل وظائف Firestore لـ domain معين في ملف واحد
- صعب الصيانة والاختبار
- انتهاك Single Responsibility Principle

### 3. **عدم التطابق مع Clean Architecture**
- يجب تقسيم Repository إلى عدة ملفات حسب الـ sub-domains

## ✅ الحل الموصى به

### تقسيم TeacherRepository إلى عدة ملفات:

```
src/infrastructure/firebase/repositories/teachers/
├── TeacherApplicationRepository.ts    (~100 lines)
├── TeacherQualificationRepository.ts   (~50 lines)
├── TeacherIjazahRepository.ts          (~80 lines)
├── TeacherAvailabilityRepository.ts    (~100 lines)
├── TeacherWalletRepository.ts           (~150 lines)
├── TeacherSupportRepository.ts         (~100 lines)
└── TeacherReviewRepository.ts          (~50 lines)
```

### أو استخدام Composition Pattern:

```
src/infrastructure/firebase/repositories/teachers/
├── TeacherRepository.ts                (Main - orchestrates)
├── application/
│   └── TeacherApplicationRepository.ts
├── qualifications/
│   └── QualificationRepository.ts
├── ijazahs/
│   └── IjazahRepository.ts
├── availability/
│   └── AvailabilityRepository.ts
├── wallet/
│   └── WalletRepository.ts
└── support/
    └── SupportRepository.ts
```

## 📋 التوصية

**نعم، يجب تقسيم الملفات الكبيرة** لأن:
1. ✅ أسهل في الصيانة
2. ✅ أسهل في الاختبار
3. ✅ يتبع Single Responsibility Principle
4. ✅ أسهل في الفهم
5. ✅ يمكن إعادة استخدام الـ repositories بشكل منفصل

## 🔧 الخطوات المقترحة

1. تقسيم `TeacherRepository.ts` إلى عدة ملفات حسب الـ sub-domains
2. إنشاء `TeacherRepository` رئيسي يستخدم Composition
3. تطبيق نفس الشيء على `StudentRepository.ts`
4. تحديث جميع الـ imports في التطبيق
