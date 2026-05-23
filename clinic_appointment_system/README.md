# ClinicPlus — Railway Fix Guide

## المشكلة
`start` script كان يشغّل `drizzle-kit migrate` وهذا يسبب crash لأن:
1. `drizzle-kit` أداة تطوير وليست مخصصة لـ production
2. الجداول غير موجودة في MySQL الجديدة

---

## الملفات المُصلحة في هذا الـ zip

| الملف | التغيير |
|---|---|
| `package.json` | أُزيل `drizzle-kit migrate` من `start` — الـ start الآن `node dist/index.js` فقط |
| `drizzle.config.ts` | يقرأ متغيرات Railway تلقائياً (MYSQLHOST, MYSQLUSER...) |
| `src/db/schema.ts` | Schema كامل لكل الجداول |
| `src/db/migrate.ts` | سكريبت migrate آمن يُشغَّل يدوياً |
| `src/db/seed.ts` | يُنشئ admin + doctor افتراضيين |
| `nixpacks.toml` | يخبر Railway كيف يبني المشروع |

---

## خطوات الإصلاح

### الخطوة 1 — نسخ الملفات إلى مشروعك

انسخ هذه الملفات إلى مجلد المشروع:
```
package.json          ← استبدل الملف الموجود
drizzle.config.ts     ← استبدل أو أنشئ
nixpacks.toml         ← جديد
src/db/migrate.ts     ← جديد
src/db/seed.ts        ← أنشئ إذا ما موجود
src/db/schema.ts      ← تحقق إنه يطابق schema مشروعك
```

### الخطوة 2 — رفع التغييرات على GitHub
```bash
git add .
git commit -m "fix: remove drizzle-kit from start script"
git push
```

### الخطوة 3 — إنشاء الجداول في Railway

**الطريقة الأولى (الأسهل) — من Railway Shell:**
1. افتح Railway → مشروعك → Backend service
2. اضغط على "Shell" أو "Connect"
3. شغّل:
```bash
npx drizzle-kit push
```
هذا سيُنشئ الجداول مباشرة بدون ملفات migration.

**الطريقة الثانية — عبر Railway Variables:**
أضف هذا الـ script مؤقتاً كـ start command:
```
npx tsx src/db/migrate.ts && node dist/index.js
```
بعد ما تتأكد الجداول اتخلقت، ارجع لـ `node dist/index.js`

### الخطوة 4 — إنشاء المستخدم الأول (Seed)
بعد إنشاء الجداول، من Railway Shell:
```bash
npx tsx src/db/seed.ts
```

**بيانات الدخول الافتراضية:**
| الحساب | الإيميل | الباسورد |
|---|---|---|
| Admin | admin@clinicplus.com | admin123 |
| Doctor | doctor@clinicplus.com | doctor123 |

---

## متغيرات البيئة المطلوبة في Railway

Railway يضيف هذه تلقائياً عند ربط MySQL service:
```
MYSQLHOST
MYSQLPORT
MYSQLUSER
MYSQLPASSWORD
MYSQLDATABASE
```

تأكد إن الـ Backend service عنده Reference لـ MySQL service.

---

## التحقق من نجاح الإصلاح

1. Railway Deployment يمر بدون error ✅
2. زيارة: `clinicappointmentsystem-production.up.railway.app`
3. تسجيل دخول بـ `admin@clinicplus.com` / `admin123`
4. يجب أن يعمل بدون خطأ `Failed query: select from users`
