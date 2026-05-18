# دليل نشر ClinicPlus على استضافة خاصة

## المتطلبات

- **Node.js**: v18 أو أحدث
- **npm/pnpm**: مدير الحزم
- **قاعدة بيانات**: MySQL 8.0+ أو MariaDB
- **خادم ويب**: Nginx أو Apache (اختياري - يمكن استخدام Node مباشرة)

## خطوات التثبيت

### 1. استخراج الملفات

```bash
unzip clinic_appointment_system.zip
cd clinic_appointment_system
```

### 2. تثبيت المتطلبات

```bash
pnpm install
# أو
npm install
```

### 3. إعداد متغيرات البيئة

أنشئ ملف `.env` في جذر المشروع:

```env
# قاعدة البيانات
DATABASE_URL="mysql://user:password@localhost:3306/clinicplus"

# JWT Secret
JWT_SECRET="your-secret-key-here-change-this"

# OAuth (اختياري - إذا كنت تريد استخدام Manus OAuth)
VITE_APP_ID="your-app-id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://manus.im"

# Server
PORT=3000
NODE_ENV=production

# Storage (S3 - اختياري)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### 4. إعداد قاعدة البيانات

```bash
# توليد ملفات الهجرة
pnpm drizzle-kit generate

# تطبيق الهجرات
pnpm drizzle-kit migrate
```

أو استخدم MySQL مباشرة:

```bash
mysql -u root -p clinicplus < drizzle/migrations/*.sql
```

### 5. البناء للإنتاج

```bash
pnpm build
```

### 6. تشغيل التطبيق

```bash
# تطوير
pnpm dev

# إنتاج
pnpm start
```

## نشر على خوادم شهيرة

### على Heroku

```bash
# تثبيت Heroku CLI
npm install -g heroku

# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create clinicplus

# تعيين متغيرات البيئة
heroku config:set DATABASE_URL="mysql://..."
heroku config:set JWT_SECRET="..."

# نشر
git push heroku main
```

### على DigitalOcean App Platform

1. ربط مستودع GitHub
2. اختر الفرع الرئيسي
3. عيّن متغيرات البيئة
4. انقر على Deploy

### على AWS EC2

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت MySQL
sudo apt install -y mysql-server

# استنساخ المشروع
git clone your-repo-url
cd clinic_appointment_system

# تثبيت المتطلبات
pnpm install

# بناء
pnpm build

# تشغيل باستخدام PM2
npm install -g pm2
pm2 start "pnpm start" --name clinicplus
pm2 save
pm2 startup
```

### على Render

1. ربط مستودع GitHub
2. اختر "Web Service"
3. عيّن الأوامر:
   - Build: `pnpm install && pnpm build`
   - Start: `pnpm start`
4. أضف متغيرات البيئة
5. انقر على Deploy

## إعدادات Nginx (اختياري)

```nginx
server {
    listen 80;
    server_name clinicplus.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## إعدادات SSL/TLS

```bash
# استخدام Let's Encrypt مع Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d clinicplus.example.com
```

## النسخ الاحتياطية

### نسخ احتياطية من قاعدة البيانات

```bash
# يومية
mysqldump -u root -p clinicplus > backup-$(date +%Y-%m-%d).sql

# استعادة
mysql -u root -p clinicplus < backup-2024-01-15.sql
```

### نسخ احتياطية من الملفات

```bash
tar -czf clinicplus-backup-$(date +%Y-%m-%d).tar.gz clinic_appointment_system/
```

## المراقبة والصيانة

### عرض السجلات

```bash
# PM2
pm2 logs clinicplus

# Systemd
journalctl -u clinicplus -f
```

### تحديث التطبيق

```bash
git pull origin main
pnpm install
pnpm build
pm2 restart clinicplus
```

## استكشاف الأخطاء

### المشكلة: خطأ في الاتصال بقاعدة البيانات

```bash
# تحقق من بيانات الاتصال
echo $DATABASE_URL

# اختبر الاتصال
mysql -u user -p -h localhost -e "SELECT 1"
```

### المشكلة: الصفحة لا تحمل

```bash
# تحقق من المنافذ
netstat -tulpn | grep 3000

# تحقق من السجلات
pm2 logs clinicplus
```

### المشكلة: مشاكل الأداء

```bash
# استخدم PM2 Plus للمراقبة
pm2 plus

# أو استخدم New Relic
npm install newrelic
```

## الأمان

1. **غيّر JWT_SECRET** إلى قيمة عشوائية قوية
2. **استخدم HTTPS** على الإنتاج
3. **قيّد الوصول** إلى لوحة المسؤول
4. **حدّث المتطلبات** بانتظام
5. **فعّل جدار الحماية** على الخادم

## الدعم والمساعدة

للمزيد من المعلومات، اطلع على:
- [توثيق Node.js](https://nodejs.org/docs/)
- [توثيق Drizzle ORM](https://orm.drizzle.team/)
- [توثيق Express](https://expressjs.com/)
- [توثيق React](https://react.dev/)
