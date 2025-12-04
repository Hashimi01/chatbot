/// <reference types="@react-three/fiber" />

import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

// Placeholder to ensure file is treated as a module.
export {};
