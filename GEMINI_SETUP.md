# إعداد Gemini API لـ Tonton Roger

## الحصول على مفتاح API

1. اذهب إلى [Google AI Studio](https://aistudio.google.com/app/apikey)
2. سجل الدخول بحساب Google الخاص بك
3. انقر على "Create API Key"
4. اختر مشروع Google Cloud أو أنشئ مشروع جديد
5. انسخ المفتاح الذي تم إنشاؤه

## إضافة المفتاح إلى المشروع

1. أنشئ ملف `.env.local` في جذر المشروع (إذا لم يكن موجوداً)
2. أضف السطر التالي:

```env
GEMINI_API_KEY=your-api-key-here
```

3. استبدل `your-api-key-here` بالمفتاح الذي نسخته
4. أعد تشغيل خادم التطوير:

```bash
npm run dev
```

## النماذج المتاحة

التطبيق يستخدم `gemini-1.5-flash` افتراضياً. يمكنك تغيير النموذج في `src/pages/api/roger/chat.ts`:

- `gemini-1.5-flash` - أسرع وأرخص (موصى به)
- `gemini-1.5-pro` - أكثر دقة ولكن أبطأ
- `gemini-pro` - الإصدار السابق

## الحدود والميزات المجانية

- Gemini API يوفر حد مجاني يومي
- `gemini-1.5-flash` سريع جداً ومناسب للتطبيقات التفاعلية
- يمكنك مراقبة الاستخدام في [Google AI Studio](https://aistudio.google.com/)

## استكشاف الأخطاء

### خطأ: "GEMINI_API_KEY is not configured"
- تأكد من وجود ملف `.env.local`
- تأكد من إضافة المفتاح بشكل صحيح
- أعد تشغيل الخادم بعد إضافة المفتاح

### خطأ: "API key not valid"
- تأكد من نسخ المفتاح بشكل كامل
- تأكد من عدم وجود مسافات إضافية
- جرب إنشاء مفتاح جديد من Google AI Studio

### خطأ: "Quota exceeded"
- انتظر حتى يتم تجديد الحد اليومي
- أو قم بترقية حسابك في Google Cloud


