# تحديث: الانتقال من OpenAI إلى Gemini API

## التغييرات الرئيسية

### 1. تحديث API Route
- تم تحديث `src/pages/api/roger/chat.ts` لاستخدام Gemini API بدلاً من OpenAI
- النموذج المستخدم: `gemini-1.5-flash`
- System Instruction بدلاً من System Message

### 2. تحديث التبعيات
- إزالة: `openai`
- إضافة: `@google/generative-ai`

### 3. تحديث متغيرات البيئة
- القديم: `OPENAI_API_KEY`
- الجديد: `GEMINI_API_KEY`

### 4. تحديث التوثيق
- تم تحديث `README_ROGER.md`
- تم تحديث `QUICK_START_ROGER.md`
- تم إضافة `GEMINI_SETUP.md`

## كيفية الترقية

1. تثبيت التبعية الجديدة:
```bash
npm install @google/generative-ai
```

2. تحديث ملف `.env.local`:
```env
# احذف هذا السطر:
# OPENAI_API_KEY=...

# أضف هذا السطر:
GEMINI_API_KEY=your-gemini-api-key-here
```

3. احصل على مفتاح API من: https://aistudio.google.com/app/apikey

4. أعد تشغيل الخادم:
```bash
npm run dev
```

## المزايا

- **أسرع**: Gemini 1.5 Flash أسرع من GPT-4o-mini
- **أرخص**: حد مجاني يومي أكبر
- **أفضل للغة الفرنسية**: Gemini يدعم الفرنسية بشكل ممتاز

## ملاحظات

- System Prompt لا يزال يعمل بنفس الطريقة
- شخصية Roger لم تتغير
- جميع الميزات الأخرى تعمل كما هي


