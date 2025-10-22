export interface ComicPanel {
  id: string;
  order: number;
  scene: string;
  dialogue: string;
  character: string;
  emotion?: string;
  imageUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  progress?: number;
  consistencyScore?: number;
}

export interface ComicProject {
  id: string;
  theme: string;
  artStyle: string;
  numPanels: number;
  characterDescription?: string;
  referenceImageUrl?: string;
  imageRatio?: ImageRatio;
  panels: ComicPanel[];
  status: 'draft' | 'script' | 'generating' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export type ArtStyle = 
  | 'Comic Illustration'
  | 'Japanese Manga' 
  | 'American Comic' 
  | 'Webtoon' 
  | 'Chibi'
  | 'Anime Style'
  | 'Watercolor'
  | 'Cyberpunk'
  | 'Chinese Ink'
  | 'Disney Style'
  | 'Realistic'
  | 'Pixel Art'
  | 'Vintage Comic'
  | 'Studio Ghibli'
  | 'Marvel Style';

export type ImageRatio = '1:1' | '3:4' | '16:9' | '9:16';

export interface GenerateScriptRequest {
  theme: string;
  artStyle: string;
  numPanels: number;
  characterDescription?: string;
}

export interface GenerateScriptResponse {
  panels: Omit<ComicPanel, 'id' | 'order' | 'imageUrl' | 'status'>[];
}

export interface GenerateImageRequest {
  panelId: string;
  scene: string;
  artStyle: string;
  characterDescription?: string;
  referenceImageUrl?: string;
  imageRatio?: ImageRatio;
}

export interface GenerateImageResponse {
  imageUrl: string;
  consistencyScore?: number;
}

