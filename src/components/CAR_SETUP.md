# إعداد سيارة حقيقية

## الخطوات:

### 1. تحميل نموذج سيارة

قم بتحميل نموذج سيارة بتنسيق `.glb` من أحد المصادر التالية:

#### مصادر مجانية موصى بها:

1. **Sketchfab** (https://sketchfab.com)
   - ابحث عن "car gltf"
   - فلتر: "Downloadable" + "Free"
   - تصدير: glTF Binary (.glb)

2. **Poly Haven** (https://polyhaven.com/models)
   - نماذج عالية الجودة
   - مجانية تماماً

3. **Open3dModel** (https://open3dmodel.com)
   - نماذج سيارات متنوعة
   - تنسيقات متعددة

4. **CGTrader** (https://www.cgtrader.com)
   - ابحث عن "free car gltf"
   - نماذج مجانية ومدفوعة

### 2. وضع الملف في المشروع

1. أنشئ مجلد `public/models/` إذا لم يكن موجوداً
2. ضع ملف `.glb` في المجلد
3. اسم الملف: `car.glb` (أو أي اسم آخر)

### 3. استخدام المكون

#### الطريقة 1: من ملف محلي
```tsx
import { RealCar } from '@/components';

<RealCar 
  modelUrl="/models/car.glb"
  position={[0, 0, 0]}
  scale={1}
  animate={true}
/>
```

#### الطريقة 2: من URL مباشر
```tsx
import { CarFromURL } from '@/components';

<CarFromURL 
  modelUrl="https://example.com/car.glb"
  position={[0, 0, 0]}
  scale={0.5}
  animate={true}
/>
```

### 4. أمثلة على نماذج مجانية

#### نموذج من Three.js Examples:
```tsx
<CarFromURL 
  modelUrl="https://threejs.org/examples/models/gltf/[model-name].glb"
  position={[0, 0, 0]}
  scale={1}
/>
```

#### نموذج من glTF Sample Models:
```tsx
<CarFromURL 
  modelUrl="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/[model]/glTF-Binary/[model].glb"
  position={[0, 0, 0]}
  scale={1}
/>
```

### 5. نصائح

- **الحجم**: حاول أن يكون الملف أقل من 10MB
- **التنسيق**: `.glb` أفضل من `.gltf` (ملف واحد)
- **الجودة**: نماذج عالية الجودة قد تكون بطيئة، استخدم LOD إذا لزم الأمر
- **المواد**: تأكد من أن النموذج يحتوي على مواد (materials)

### 6. حل المشاكل

#### المشكلة: النموذج لا يظهر
- تحقق من مسار الملف
- تأكد من أن الملف موجود في `public/models/`
- تحقق من console للأخطاء

#### المشكلة: النموذج كبير جداً
- استخدم `scale` أصغر
- أو استخدم نموذج أقل جودة

#### المشكلة: النموذج بطيء
- قلل عدد المضلعات
- استخدم LOD (Level of Detail)
- استخدم compression

### 7. أمثلة جاهزة للاستخدام

يمكنك استخدام هذه النماذج للاختبار:

```tsx
// نموذج بطة (للاختبار)
<CarFromURL 
  modelUrl="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb"
  position={[0, 0, 0]}
  scale={2}
/>
```

### 8. تحسين الأداء

```tsx
// تحميل مسبق
import { useGLTF } from '@react-three/drei';

// في ملف منفصل أو في _app.tsx
useGLTF.preload('/models/car.glb');
```

## ملاحظات مهمة:

- تأكد من أن النموذج متوافق مع Three.js
- بعض النماذج قد تحتاج إلى تعديلات في الإضاءة
- استخدم `OrbitControls` للتحكم في الكاميرا
- أضف `Suspense` حول المكون للتحميل التدريجي







