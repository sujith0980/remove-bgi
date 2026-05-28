export interface ProcessedImage {
  id: string;
  name: string;
  size: number;
  width: number;
  height: number;
  originalUrl: string;
  originalFile?: File | Blob; // Keep reference to file if uploaded
  processedUrl?: string; // The masked output from @imgly/background-removal (transparent bg)
  processedBlob?: Blob; // Keep mask blob
  editedUrl?: string; // If manually erased/restored, this holds the custom canvas data url/blob
  status: 'idle' | 'loading' | 'completed' | 'failed';
  progress: number;
  progressStep?: string;
  error?: string;
}

export type BackgroundType = 'transparent' | 'color' | 'gradient' | 'image' | 'ai';

export interface BackgroundPreset {
  id: string;
  name: string;
  value: string; // HEX color or Image URL
  type: 'color' | 'image' | 'gradient';
  colors?: string[]; // Color stops for gradients (e.g. ['#F97316', '#EC4899'])
}

export interface EditorSettings {
  backgroundType: BackgroundType;
  colorValue: string;
  gradientValue: string;
  imageValue: string;
  blurValue: number; // in pixels (0 for none, up to 20)
  brushType: 'erase' | 'restore';
  brushSize: number; // 5 to 100
  shadowValue?: number; // drop shadow blur radius (0 to 40px)
}
