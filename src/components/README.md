# Three.js Components

مجموعة من المكونات الجاهزة للاستخدام مع Three.js و React Three Fiber.

## المكونات المتوفرة

### 1. Earth (كوب الأرض)
مكون ثلاثي الأبعاد لكرة الأرض مع إمكانية الدوران التلقائي.

```tsx
import { Scene, Earth } from '@/components';

<Scene>
  <Earth rotationSpeed={0.01} autoRotate={true} />
</Scene>
```

**الخصائص:**
- `rotationSpeed`: سرعة الدوران (افتراضي: 0.01)
- `autoRotate`: تفعيل الدوران التلقائي (افتراضي: true)

### 2. Car (سيارة)
مكون سيارة ثلاثي الأبعاد مع تفاصيل كاملة.

```tsx
import { Scene, Car } from '@/components';

<Scene>
  <Car 
    position={[0, 0, 0]} 
    color="#ff0000" 
    animate={true} 
  />
</Scene>
```

**الخصائص:**
- `position`: موضع السيارة (افتراضي: [0, 0, 0])
- `rotation`: دوران السيارة (افتراضي: [0, 0, 0])
- `color`: لون السيارة (افتراضي: '#ff0000')
- `animate`: تفعيل الحركة (افتراضي: false)

### 3. Buildings (المباني)
مجموعة من المباني العشوائية لإنشاء مدينة.

```tsx
import { Scene, Buildings } from '@/components';

<Scene>
  <Buildings 
    count={20} 
    areaSize={20}
    minHeight={1}
    maxHeight={5}
  />
</Scene>
```

**الخصائص:**
- `count`: عدد المباني (افتراضي: 20)
- `areaSize`: حجم المنطقة (افتراضي: 20)
- `minHeight`: الحد الأدنى للارتفاع (افتراضي: 1)
- `maxHeight`: الحد الأقصى للارتفاع (افتراضي: 5)

### 4. Cube (مكعب)
مكعب بسيط مع إمكانية الدوران.

```tsx
import { Scene, Cube } from '@/components';

<Scene>
  <Cube 
    position={[0, 0, 0]}
    size={1}
    color="#ff6b6b"
    rotationSpeed={0.01}
    autoRotate={true}
  />
</Scene>
```

### 5. Sphere (كرة)
كرة ثلاثية الأبعاد.

```tsx
import { Scene, Sphere } from '@/components';

<Scene>
  <Sphere 
    position={[0, 0, 0]}
    radius={1}
    color="#4ecdc4"
    wireframe={false}
  />
</Scene>
```

### 6. Plane (سطح)
سطح مستوٍ.

```tsx
import { Scene, Plane } from '@/components';

<Scene>
  <Plane 
    position={[0, 0, 0]}
    width={10}
    height={10}
    color="#90EE90"
  />
</Scene>
```

### 7. Torus (طوق)
شكل طوقي ثلاثي الأبعاد.

```tsx
import { Scene, Torus } from '@/components';

<Scene>
  <Torus 
    position={[0, 0, 0]}
    radius={1}
    tube={0.3}
    color="#ffa500"
  />
</Scene>
```

### 8. Cone (مخروط)
شكل مخروطي.

```tsx
import { Scene, Cone } from '@/components';

<Scene>
  <Cone 
    position={[0, 0, 0]}
    radius={1}
    height={2}
    color="#9370DB"
  />
</Scene>
```

### 9. Cylinder (أسطوانة)
شكل أسطواني.

```tsx
import { Scene, Cylinder } from '@/components';

<Scene>
  <Cylinder 
    position={[0, 0, 0]}
    radiusTop={1}
    radiusBottom={1}
    height={2}
    color="#20B2AA"
  />
</Scene>
```

### 10. Scene (المشهد)
مكون المشهد الأساسي الذي يحتوي على الكاميرا والإضاءة.

```tsx
import { Scene } from '@/components';

<Scene 
  cameraPosition={[0, 0, 5]}
  backgroundColor="#000011"
  showControls={true}
>
  {/* المكونات هنا */}
</Scene>
```

**الخصائص:**
- `cameraPosition`: موضع الكاميرا (افتراضي: [0, 0, 5])
- `backgroundColor`: لون الخلفية (افتراضي: '#000011')
- `showControls`: إظهار أدوات التحكم (افتراضي: true)

## مثال الاستخدام الكامل

```tsx
'use client';

import { Scene, Earth, Car, Buildings } from '@/components';

export default function MyThreeJSPage() {
  return (
    <Scene cameraPosition={[0, 5, 10]} backgroundColor="#000011">
      <Earth rotationSpeed={0.005} />
      <Car position={[3, 0, 3]} color="#ff0000" animate={true} />
      <Buildings count={20} />
    </Scene>
  );
}
```

## صفحة العرض التوضيحي

يمكنك زيارة `/threejs-demo` لرؤية جميع المكونات في العمل.

## ملاحظات

- جميع المكونات تستخدم `'use client'` لأنها تحتاج إلى تفاعل العميل
- المكونات متوافقة مع React 18 و Next.js 15
- يمكن تخصيص جميع المكونات من خلال الخصائص (props)






