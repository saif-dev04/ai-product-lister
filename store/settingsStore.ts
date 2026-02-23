import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ToneOfVoice = 'professional' | 'casual' | 'luxury' | 'edgy';

interface SettingsState {
  geminiApiKey: string;
  brandName: string;
  brandColors: string[];
  defaultTone: ToneOfVoice;
  preferQuality: boolean;
}

interface SettingsActions {
  setGeminiApiKey: (key: string) => void;
  setBrandName: (name: string) => void;
  setBrandColors: (colors: string[]) => void;
  setDefaultTone: (tone: ToneOfVoice) => void;
  setPreferQuality: (prefer: boolean) => void;
  resetSettings: () => void;
}

const initialState: SettingsState = {
  geminiApiKey: '',
  brandName: '',
  brandColors: [],
  defaultTone: 'professional',
  preferQuality: false,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set) => ({
      ...initialState,

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),

      setBrandName: (name) => set({ brandName: name }),

      setBrandColors: (colors) => set({ brandColors: colors }),

      setDefaultTone: (tone) => set({ defaultTone: tone }),

      setPreferQuality: (prefer) => set({ preferQuality: prefer }),

      resetSettings: () => set(initialState),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
