# مراجعة تطابق المعطيات: `teacher-application` vs `teacher-profile`

هذه الوثيقة تراجع **تطابق أسماء/معاني/حفظ** حقول بيانات المعلم بين:

- صفحة التقديم: `src/app/teacher-application/page.tsx`
- الـ API الخاص بالمسودة/التقديم: `src/services/teacherApplicationApi.ts`
- نوع/نموذج التطبيق داخل الواجهة: `src/shared/types/teacher.types.ts` (واجهة `TeacherApplication`)
- صفحة ملف المعلم: `src/app/teacher-profile/page.tsx` + هوك `useTeacherProfileData`
- طبقة الخدمة التي تحوّل/تجلب البيانات: `src/services/teacherService.ts`

---

## 1) خريطة الحقول (Mapping Matrix)

### Step 1 (بيانات أساسية)

| الحقل | `teacher-application` (state) | `teacherApplicationApi.step1` | `TeacherApplication` (frontend) | استخدام `teacher-profile` |
|---|---|---|---|---|
| الاسم | `fullName` | `step1.fullName` | `fullName` | عرض الاسم عبر `getTeacherDisplayName(...)` |
| البريد | `email` | `step1.email` | `email` | ثانوي/عرض |
| الجوال | `phone` + `countryCode` | `step1.phone` + `step1.countryCode` | `phone` + `countryCode` | غير واضح داخل `teacher-profile` الحالي (يمر في `teacherApplication`) |
| النوع | `gender` | `step1.gender` | `gender` | ثانوي/عرض |
| الجنسية | `nationality` | `step1.nationality` | `nationality` | معروض في `ProfileCard` |
| سنوات الخبرة | `yearsOfExperience` | `step1.yearsOfExperience` | `yearsOfExperience` | معروض في `ProfileCard` |
| اللغات | `languages` | `step1.languages` | `languages` | تعتمد عليها صفحات/مكونات أخرى، موجودة |
| العنوان المهني | `title` | `step1.title` | `title` | يدخل في `getTeacherTitle(...)` غالباً |

### Step 2 (تفاصيل تعليمية)

| الحقل | `teacher-application` (state) | `teacherApplicationApi.step2` | `TeacherApplication` (frontend) | استخدام `teacher-profile` |
|---|---|---|---|---|
| المستوى التعليمي | `educationLevel` | `step2.educationLevel` | `educationLevel` | ضمن قسم المؤهلات/الملف |
| الشهادات | `certificates: File[]` | **لا يوجد رفع ملفات** (فقط `certificatesCount`) | `certificatesCount` (في التحويل) | غير مستخدم حالياً بشكل واضح |
| النبذة | `bio` | `step2.bio` | `bio` | تمرر إلى `AboutSection` للعرض والتحرير |
| الفيديو التعريفي | `introVideo?: string` | `step2.introVideo?` | `introVideo` | تمرر إلى `AboutSection` |
| المواد | `subjects: string[]` | `step2.subjects` | `subjects` | تُستخدم في صفحات المعلم/التفاصيل |
| السعر | `hourlyRate` | `step2.hourlyRate` | `hourlyRate` | معروض كسعر الجلسة في `ProfileCard` |
| العملة | `currency` | `step2.currency` | `currency` | معروض كرمز عملة في `ProfileCard` |

---

## 2) التعارضات / المشاكل المكتشفة (High Impact)

### (A) فقدان `introVideo` بعد التقديم (تحويل البيانات ناقص)

- **الوضع الحالي**
  - صفحة التقديم تحفظ `introVideo` داخل `teacherApplicationApi.saveStep2(...)`.
  - لكن `TeacherService.transformApplicationToFrontendFormat(...)` لا يضع `introVideo` على `TeacherApplication` رغم أنه موجود في `TeacherApplication` type.
- **الأثر**
  - صفحة `teacher-profile` تعتمد على `teacherApplication.introVideo` عبر `useTeacherProfileData` → `personalInfo`.
  - النتيجة: الفيديو التعريفي قد لا يظهر/لا يُستخدم عند عرض/تحرير الملف.
- **الإصلاح المقترح**
  - إضافة `introVideo: application.step2?.introVideo || ''` داخل التحويل.

### (B) `bio` يتم تعديله في `teacher-profile` لكن لا يتم حفظه فعلياً

- **الوضع الحالي**
  - `AboutSection` يستدعي `onSave(bio, introVideo)`.
  - في `teacher-profile/page.tsx`، الدالة `handleSavePersonalInfo(bio, introVideo)` **تتجاهل `bio`** وتستدعي `teacherService.updatePersonalInfo(...)` الذي يرسل `teachingStyle/sessionContent/introVideo` فقط.
- **الأثر**
  - المستخدم يرى أنه حفظ “النبذة” لكن قد لا تُحفظ في backend.
- **الإصلاح المقترح**
  - إمّا:
    - توسيع `updatePersonalInfo` ليشمل `bio`، أو
    - استدعاء `teacherService.updateApplication(...)`/endpoint مناسب لتحديث `bio`.

### (C) رفع الشهادات في Step2 “تمثيلي” والـ API يحفظ فقط `certificatesCount`

- **الوضع الحالي**
  - UI يسمح باختيار ملفات شهادات ويُظهر “قيد الرفع/مكتمل” عبر `setTimeout` (محاكاة).
  - `teacherApplicationApi.saveStep2` يرسل `certificatesCount` فقط، بدون رفع ملفات فعلية.
- **الأثر**
  - تجربة مستخدم مضللة: “الشهادة مرفوعة” بينما لا يوجد ملف محفوظ.
- **الإصلاح المقترح**
  - خيار 1 (سريع): تعديل النصوص/الواجهة لتوضيح أنها **عدد الشهادات** فقط، أو إزالة محاكاة الرفع.
  - خيار 2 (صحيح): إضافة endpoint لرفع ملفات الشهادات وربطها بالطلب، وتخزين روابطها/metadata.

### (D) تعارض نوع `status` مع القيم المستخدمة فعلياً (`incomplete`)

- **الوضع الحالي**
  - `TeacherApplication.status` في `teacher.types.ts` معرف كـ `TeacherStatus = 'pending' | 'approved' | 'rejected'`.
  - لكن `TeacherService.mapApprovalStatusToApplicationStatus(...)` يعيد `'incomplete'` في حالات `step1/step2/review` عبر cast.
- **الأثر**
  - عدم اتساق TypeScript + منطق redirect في `teacher-profile` يعتمد على `approved/pending` فقط؛ وجود `'incomplete'` يؤدي للـ redirect إلى `/teacher-application` (وهو صحيح منطقيًا) لكن النوع غير صريح.
- **الإصلاح المقترح**
  - توحيد النوع: إضافة `INCOMPLETE` في `TEACHER_APPLICATION_STATUS` + تحديث `TeacherStatus`/`TeacherApplication.status` ليشملها.

### (E) عدم اتساق العملة الافتراضية بين أجزاء مختلفة

- **الوضع الحالي**
  - `teacher-application` يبدأ بـ `currency: 'USD'`.
  - `TeacherService.transformBackendTeacherToApplication(...)` يثبتها `'SAR'` (hardcoded).
  - `transformApplicationToFrontendFormat(...)` يجعل default `'SAR'` إذا لم توجد.
- **الأثر**
  - قد يرى المستخدم عملة مختلفة حسب مصدر البيانات.
- **الإصلاح المقترح**
  - اعتماد قيمة واحدة: إمّا default على مستوى UI `'SAR'` (أقرب للمنتج) أو إبقاء UI كما هو وتجنب hardcode داخل الخدمة.

---

## 3) فروقات “مفهوم البيانات” (Conceptual Mismatches)

### `teachingStyle` و `sessionContent` في `teacher-profile`

- **موجودة في `TeacherApplication`** وتُستخدم لتخزين JSON (يُparse عبر `parseBenefitsFromJSON` و `parseSessionContentFromJSON`).
- **غير موجودة في نموذج التقديم** (step1/step2) حالياً.
- هذا مش “تعارض” مباشر، لكنه يعني أن **جزء من بيانات الملف لا يأتي من التقديم** بل من تحرير ملف المعلم لاحقًا.

---

## 4) خطة التنفيذ (Execution Plan)

### Phase 1 — إصلاحات مطابقة سريعة (بدون تغيير UI كبير)

- [x] **(1) إصلاح تحويل `introVideo`**
  - [x] تحديث `TeacherService.transformApplicationToFrontendFormat(...)` ليشمل `introVideo`.
- [ ] **(2) إصلاح حفظ `bio` من صفحة `teacher-profile`**
  - [x] تحديث `TeacherService.updatePersonalInfo(...)` (أو إضافة دالة مخصصة) لتحديث `bio` في backend.
  - [x] تحديث `teacher-profile/page.tsx` لاستخدام المسار الصحيح لحفظ `bio`.
- [ ] **(3) توحيد نوع الحالة `status`**
  - [x] إضافة `INCOMPLETE` إلى `TEACHER_APPLICATION_STATUS` وتوسيع type المناسب.

### Phase 2 — توحيد نموذج البيانات (Schema Alignment)

- [x] **(4) توحيد أسماء/معاني الحقول بين backend وfrontend**
  - [x] مراجعة mapping: `experienceYears` (backend) ↔ `yearsOfExperience` (frontend) وتوحيد التحويلات.
  - [x] ضمان أن `getTeacherProfileData` يعيد `TeacherApplication` شامل لكل ما يلزم للعرض والتحرير (bio/introVideo/subjects/hourlyRate/currency...).
- [x] **(5) توحيد العملة الافتراضية**
  - [x] إزالة `currency: 'SAR'` hardcoded من `transformBackendTeacherToApplication` أو ضبط defaults في مكان واحد فقط.

### Phase 3 — الشهادات (إن كانت مطلوبة فعلاً)

- [x] **(6) قرار منتج (Product Decision)**
  - [x] تحديد هل نحتاج حفظ ملفات شهادات فعلياً أم يكفي `certificatesCount` → **سنحتفظ بالملفات الفعلية**.
- [x] **(7) إن نعم**
  - [x] إضافة endpoint لرفع الشهادات وربطها بطلب المعلم.
  - [x] حفظ روابط/metadata للشهادات (بدلاً من/بالإضافة إلى `certificatesCount`).
  - [x] عرض الشهادات في `teacher-profile` مع إمكانية الإدارة/الحذف.
- [ ] **(8) إن لا**
  - [ ] تعديل UI لإلغاء “محاكاة الرفع” والاكتفاء بـ `certificatesCount` أو إدخال نصي.

---

## 5) نقاط تحقق (Acceptance Checklist)

- `introVideo` يظهر بعد التقديم مباشرة داخل `teacher-profile` (بدون إعادة إدخال).
- تعديل `bio` من `teacher-profile` يُحفظ ويظهر بعد `refetch`.
- TypeScript لا يحتوي casts لإدخال قيم حالة غير معرفة.
- العملة والسعر يظهران بشكل ثابت حسب ما اختاره المعلم في التقديم.

