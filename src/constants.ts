import { BackgroundPreset } from './types';

export const SAMPLE_IMAGES = [
  {
    id: 'portrait',
    name: 'Professional Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    type: 'Person',
    badge: 'Popular',
  },
  {
    id: 'shoe',
    name: 'Red Running Shoe',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    type: 'Product',
    badge: 'Clean Edges',
  },
  {
    id: 'dog',
    name: 'Golden Retriever',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80',
    type: 'Animal',
    badge: 'Detailed Fur',
  },
  {
    id: 'car',
    name: 'Vintage Sports Car',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    type: 'Vehicle',
    badge: 'Sharp Outline',
  }
];

export const COLOR_PRESETS: BackgroundPreset[] = [
  { id: 'c-white', name: 'Studio White', value: '#FFFFFF', type: 'color' },
  { id: 'c-lightgray', name: 'Soft Gray', value: '#F3F4F6', type: 'color' },
  { id: 'c-charcoal', name: 'Deep Charcoal', value: '#1F2937', type: 'color' },
  { id: 'c-yellow', name: 'Product Yellow', value: '#FBBF24', type: 'color' },
  { id: 'c-orange', name: 'Vibrant Orange', value: '#F97316', type: 'color' },
  { id: 'c-red', name: 'Cherry Red', value: '#EF4444', type: 'color' },
  { id: 'c-green', name: 'Mint Green', value: '#10B981', type: 'color' },
  { id: 'c-blue', name: 'Breezy Blue', value: '#3B82F6', type: 'color' },
  { id: 'c-pink', name: 'Rose Pink', value: '#EC4899', type: 'color' },
  { id: 'c-purple', name: 'Electric Violet', value: '#8B5CF6', type: 'color' }
];

export const GRADIENT_PRESETS: BackgroundPreset[] = [
  { id: 'g-sunset', name: 'Sunset Glow', value: 'linear-gradient(to bottom right, #F97316, #EC4899)', type: 'gradient', colors: ['#F97316', '#EC4899'] },
  { id: 'g-ocean', name: 'Cool Wave', value: 'linear-gradient(to bottom right, #3B82F6, #10B981)', type: 'gradient', colors: ['#3B82F6', '#10B981'] },
  { id: 'g-neon', name: 'Cyberpunk Purple', value: 'linear-gradient(to bottom right, #8B5CF6, #EC4899)', type: 'gradient', colors: ['#8B5CF6', '#EC4899'] },
  { id: 'g-forest', name: 'Deep Moss', value: 'linear-gradient(to bottom right, #064E3B, #10B981)', type: 'gradient', colors: ['#064E3B', '#10B981'] },
  { id: 'g-aurora', name: 'Northern Lights', value: 'linear-gradient(to bottom right, #059669, #7C3AED, #3B82F6)', type: 'gradient', colors: ['#059669', '#7C3AED', '#3B82F6'] },
  { id: 'g-cotton', name: 'Sweet Cotton', value: 'linear-gradient(to bottom right, #FBCFE8, #C7D2FE)', type: 'gradient', colors: ['#FBCFE8', '#C7D2FE'] },
  { id: 'g-monochrome', name: 'Dark Metallic', value: 'linear-gradient(to bottom right, #374151, #111827)', type: 'gradient', colors: ['#374151', '#111827'] }
];

export const IMAGE_PRESETS: BackgroundPreset[] = [
  {
    id: 'i-studio',
    name: 'Soft Abstract Studio',
    value: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    id: 'i-office',
    name: 'Modern Office Loft',
    value: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    id: 'i-beach',
    name: 'Tropical Paradise',
    value: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    id: 'i-abstract',
    name: 'Aesthetic Marble',
    value: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    id: 'i-interior',
    name: 'Minimalist Interior',
    value: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    id: 'i-city',
    name: 'Blurry Times Square',
    value: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  },
  {
    id: 'i-mountain',
    name: 'Swiss Landscape',
    value: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    type: 'image'
  }
];
