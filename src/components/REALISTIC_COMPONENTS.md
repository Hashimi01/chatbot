# المكونات الواقعية (Realistic Components)

تم إنشاء مكونات محسنة بنسب صحيحة وواقعية بناءً على أفضل الممارسات من Three.js.

## المكونات الجديدة

### 1. RealisticCar (سيارة واقعية)

سيارة بنسب صحيحة:
- **الطول**: 4.5 متر (في الواقع)
- **العرض**: 1.8 متر
- **الارتفاع**: 1.5 متر

**المميزات:**
- عجلات واقعية مع تفاصيل دقيقة
- نوافذ شفافة مع إطارات
- مصابيح أمامية وخلفية مع إشعاع
- مرايا جانبية
- مقابض أبواب
- شبكة أمامية
- هوائي على السقف

**الاستخدام:**
```tsx
import { RealisticCar } from '@/components';

<RealisticCar 
  position={[0, 0, 0]} 
  color="#ff0000" 
  animate={true}
  // modelUrl="/models/car.glb" // اختياري: لاستخدام نموذج glTF جاهز
/>
```

**دعم نماذج glTF:**
يمكنك استخدام نماذج glTF جاهزة من مصادر مثل:
- [Sketchfab](https://sketchfab.com)
- [TurboSquid](https://www.turbosquid.com)
- [CGTrader](https://www.cgtrader.com)

فقط أضف `modelUrl` prop:
```tsx
<RealisticCar modelUrl="/models/car.glb" />
```

### 2. RealisticEarth (كوب الأرض الواقعي)

أرض بنسيج حقيقي من Three.js:
- نسيج عالي الدقة (2048x2048)
- خريطة Normal للتفاصيل
- خريطة Specular للانعكاسات
- غلاف جوي شفاف
- نجوم في الخلفية

**الاستخدام:**
```tsx
import { RealisticEarth } from '@/components';

<RealisticEarth 
  rotationSpeed={0.01} 
  autoRotate={true} 
/>
```

## النسب الصحيحة

### السيارة
- نسبة الطول إلى العرض: 2.5:1
- نسبة الارتفاع إلى العرض: 0.83:1
- حجم العجلات: متناسب مع حجم السيارة
- موضع العجلات: 30% من الطول من الأمام والخلف

### المباني
- ارتفاع الطابق: 0.5 متر (في الواقع)
- حجم النوافذ: متناسب مع حجم المبنى
- المسافة بين النوافذ: 0.5 متر

## تحسينات الأداء

- استخدام `Suspense` لتحميل النماذج بشكل غير متزامن
- تقليل عدد المضلعات عند الحاجة
- استخدام LOD (Level of Detail) للنماذج المعقدة

## مصادر نماذج glTF مجانية

1. **Three.js Examples:**
   - نماذج تجريبية في مستودع Three.js
   - URL: `https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/`

2. **Sketchfab:**
   - آلاف النماذج المجانية
   - تصدير بتنسيق glTF

3. **Poly Haven:**
   - نماذج عالية الجودة مجانية
   - URL: https://polyhaven.com/models

## نصائح للاستخدام

1. **لنماذج glTF كبيرة:**
   - استخدم `useGLTF.preload()` لتحميلها مسبقاً
   - ضع النماذج في مجلد `public/models/`

2. **لتحسين الأداء:**
   - استخدم نماذج منخفضة المضلعات للعرض البعيد
   - استخدم LOD للتبديل التلقائي

3. **للإضاءة:**
   - استخدم `Environment` من drei للبيئة المحيطة
   - أضف `Sky` للسماء الواقعية

## مثال كامل

```tsx
'use client';

import { Scene, RealisticEarth, RealisticCar, Buildings } from '@/components';

export default function RealisticScene() {
  return (
    <Scene cameraPosition={[0, 5, 10]} backgroundColor="#87CEEB">
      <RealisticEarth rotationSpeed={0.005} />
      <RealisticCar 
        position={[3, 0, 3]} 
        color="#ff0000" 
        animate={true} 
      />
      <Buildings count={20} />
    </Scene>
  );
}
```







