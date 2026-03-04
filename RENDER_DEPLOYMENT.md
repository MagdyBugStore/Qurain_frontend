# نشر المشروع على Render

## ✅ الإعدادات الحالية

المشروع جاهز للـ Static Export! الإعدادات التالية موجودة بالفعل:

### 1. ملف `next.config.js`
```javascript
output: 'export', // ✅ موجود
images: {
  unoptimized: true, // ✅ موجود (ضروري للـ static export)
}
```

### 2. ملف `package.json`
```json
"build": "next build" // ✅ موجود
```

## 📋 خطوات النشر على Render

### الخطوة 1: إنشاء حساب على Render
1. اذهب إلى [render.com](https://render.com)
2. سجل حساب جديد أو سجل الدخول

### الخطوة 2: إنشاء Static Site جديد
1. من Dashboard، اضغط على **"New +"**
2. اختر **"Static Site"**

### الخطوة 3: ربط المستودع
1. اختر **"Connect GitHub"** (أو GitLab/Bitbucket)
2. اختر المستودع الخاص بك
3. اختر الفرع (Branch) - عادة `main` أو `master`

### الخطوة 4: إعدادات البناء (Build Settings)

**Build Command:**
```bash
npm run build
```

**Publish Directory:**
```
out
```

> **ملاحظة:** بعد تشغيل `npm run build`، Next.js سينشئ مجلد `out` تلقائياً يحتوي على جميع الملفات الثابتة.

### الخطوة 5: متغيرات البيئة (Environment Variables)
إذا كان لديك متغيرات بيئة، أضفها من قسم **"Environment"**:
- `NODE_ENV=production` (اختياري)

### الخطوة 6: النشر
1. اضغط على **"Create Static Site"**
2. Render سيقوم بـ:
   - تثبيت Dependencies (`npm install`)
   - تشغيل Build Command (`npm run build`)
   - نشر محتويات مجلد `out`

## 🔍 التحقق من النشر

بعد اكتمال النشر:
1. Render سيعطيك رابط مثل: `https://your-site.onrender.com`
2. افتح الرابط للتحقق من أن الموقع يعمل بشكل صحيح

## ⚠️ ملاحظات مهمة

### ما الذي لن يعمل مع Static Export:
- ❌ API Routes (`/api/*`)
- ❌ Image Optimization الافتراضية (لكن يمكن استخدام `unoptimized: true`)
- ❌ Server-Side Rendering (SSR)
- ❌ `getServerSideProps`
- ❌ `getStaticProps` مع `revalidate`

### ما الذي يعمل:
- ✅ Static Site Generation (SSG)
- ✅ Client-Side Rendering
- ✅ Dynamic Routes (مع `generateStaticParams`)
- ✅ الصور (مع `unoptimized: true`)

## 🛠️ استكشاف الأخطاء

### المشكلة: Build فشل
**الحل:** تأكد من:
- عدم استخدام API Routes
- عدم استخدام `getServerSideProps`
- جميع الصور تستخدم `unoptimized: true`

### المشكلة: الموقع لا يعمل بعد النشر
**الحل:** تأكد من:
- `Publish Directory` مضبوط على `out`
- Build Command هو `npm run build`
- لا توجد أخطاء في Console

### المشكلة: الصور لا تظهر
**الحل:** تأكد من:
- `images.unoptimized: true` في `next.config.js`
- استخدام `<img>` بدلاً من `next/image` أو استخدام `unoptimized` prop

## 📝 مثال على إعدادات Render

```
Name: quran-online
Repository: https://github.com/your-username/quran-online
Branch: main
Root Directory: (اتركه فارغاً)
Build Command: npm run build
Publish Directory: out
```

## 🎉 بعد النشر

بعد النشر الناجح، يمكنك:
- إضافة Custom Domain
- تفعيل HTTPS (مجاني على Render)
- إعداد Environment Variables
- مراقبة الـ Logs

---

**تم إعداد المشروع بنجاح! 🚀**
