import { create } from 'zustand';
import { ChatMessage } from './productStore';

interface EditorState {
  currentProductId: string | null;
  currentImagePath: string | null;
  chatHistory: ChatMessage[];
  isProcessing: boolean;
  variations: string[];
  selectedVariationIndex: number | null;
}

interface EditorActions {
  setCurrentProduct: (productId: string | null) => void;
  setCurrentImage: (imagePath: string | null) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
  setIsProcessing: (processing: boolean) => void;
  setVariations: (paths: string[]) => void;
  selectVariation: (index: number | null) => void;
  resetEditor: () => void;
}

const initialState: EditorState = {
  currentProductId: null,
  currentImagePath: null,
  chatHistory: [],
  isProcessing: false,
  variations: [],
  selectedVariationIndex: null,
};

export const useEditorStore = create<EditorState & EditorActions>()((set) => ({
  ...initialState,

  setCurrentProduct: (productId) => set({ currentProductId: productId }),

  setCurrentImage: (imagePath) => set({ currentImagePath: imagePath }),

  addChatMessage: (message) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, message],
    })),

  clearChatHistory: () => set({ chatHistory: [] }),

  setIsProcessing: (processing) => set({ isProcessing: processing }),

  setVariations: (paths) => set({ variations: paths }),

  selectVariation: (index) => set({ selectedVariationIndex: index }),

  resetEditor: () => set(initialState),
}));
