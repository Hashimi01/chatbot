# مصادر نماذج السيارات الحقيقية

## مصادر موصى بها:

### 1. **Sketchfab** (https://sketchfab.com)
- ابحث عن: "car gltf free"
- فلتر: "Downloadable" + "Free"
- تصدير: glTF Binary (.glb)
- **مثال**: https://sketchfab.com/3d-models?q=car+gltf+free&features=downloadable&sort_by=-likeCount

### 2. **Poly Pizza** (https://poly.pizza)
- نماذج مجانية عالية الجودة
- ابحث عن: "car"
- تصدير مباشر: glTF

### 3. **TurboSquid** (https://www.turbosquid.com)
- ابحث عن: "free car gltf"
- رابط مباشر: https://www.turbosquid.com/Search/3D-Models/free/cars/gltf
- نماذج مجانية ومدفوعة

### 4. **Open3dModel** (https://open3dmodel.com)
- رابط مباشر: https://open3dmodel.com/ar/3d-models/cars
- نماذج متنوعة بتنسيقات متعددة

### 5. **CGTrader** (https://www.cgtrader.com)
- ابحث عن: "free car gltf"
- نماذج مجانية ومدفوعة

## كيفية الاستخدام:

### الخطوة 1: تحميل النموذج
1. اذهب إلى أحد المصادر أعلاه
2. ابحث عن نموذج سيارة مناسب
3. قم بتحميله بتنسيق `.glb` أو `.gltf`

### الخطوة 2: وضع الملف في المشروع
1. ضع الملف في `public/models/car.glb`
2. أو استخدم أي اسم آخر

### الخطوة 3: استخدامه في الكود
```tsx
import { RealCar } from '@/components';

<RealCar 
  modelUrl="/models/car.glb"
  position={[0, 0, 0]}
  scale={1}
  animate={true}
/>
```

## نماذج جاهزة للاختبار:

### نموذج من Three.js Examples:
```tsx
<CarFromURL 
  modelUrl="https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/LittlestTokyo.glb"
  position={[0, 0, 0]}
  scale={0.5}
/>
```

## نصائح:

1. **الحجم**: حاول أن يكون الملف أقل من 10MB
2. **التنسيق**: `.glb` أفضل من `.gltf` (ملف واحد)
3. **الجودة**: نماذج عالية الجودة قد تكون بطيئة
4. **المواد**: تأكد من أن النموذج يحتوي على مواد (materials)

## ملاحظات:

- بعض النماذج قد تحتاج إلى تعديلات في الإضاءة
- استخدم `scale` لضبط حجم النموذج
- استخدم `OrbitControls` للتحكم في الكاميرا







