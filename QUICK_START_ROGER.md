# دليل البدء السريع - Tonton Roger

## خطوات سريعة للبدء

### 1. إعداد متغيرات البيئة

أنشئ ملف `.env.local` في جذر المشروع:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

احصل على المفتاح من: https://aistudio.google.com/app/apikey

### 2. تشغيل المشروع

```bash
npm run dev
```

### 3. فتح الصفحة

افتح المتصفح على: **http://localhost:3000/roger**

### 4. البدء في الدردشة

- انقر على زر "COMMENCER LA CONVERSATION" في شاشة الترحيب
- ابدأ الدردشة مع Roger!

## ملاحظات مهمة

### ملفات الصوت (اختياري)
- ضع `icq-notification.mp3` في `public/sounds/`
- ضع `keyboard-click.mp3` في `public/sounds/`
- بدون هذه الملفات، سيستخدم التطبيق أصوات بديلة

### ملف الفيديو (اختياري)
- ضع `roger-video-call.mp4` في `public/videos/`
- بدون الملف، سيظهر نص بديل

## استكشاف الأخطاء

### المشكلة: الصوت لا يعمل
**الحل:** تأكد من النقر على زر "COMMENCER" في شاشة الترحيب أولاً

### المشكلة: Gemini API لا يعمل
**الحل:** 
1. تأكد من إضافة `GEMINI_API_KEY` في `.env.local`
2. تأكد من تفعيل Gemini API في Google AI Studio
3. أعد تشغيل الخادم (`npm run dev`)

### المشكلة: react95 لا يعمل
**الحل:** تأكد من تثبيت التبعيات:
```bash
npm install react95 styled-components
```

## الميزات الممتعة

- جرب أن تسأل Roger عن التكنولوجيا الحديثة
- اسأله عن الوقت (سيحاول إرسال وصفة شوربة البصل!)
- انتظر مكالمة الفيديو العشوائية
- جرب الضغط على زر "ENVOYER" عدة مرات (قد يهرب!)

---

**Bises, Roger** :-) !!!!!!

