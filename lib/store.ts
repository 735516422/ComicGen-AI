"use client";

import { create } from 'zustand';
import { ComicProject, ComicPanel } from './types';

interface ComicStore {
  currentProject: ComicProject | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProject: (project: ComicProject) => void;
  updateProject: (updates: Partial<ComicProject>) => void;
  addPanel: (panel: ComicPanel) => void;
  updatePanel: (panelId: string, updates: Partial<ComicPanel>) => void;
  removePanel: (panelId: string) => void;
  reorderPanels: (panels: ComicPanel[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetProject: () => void;
}

export const useComicStore = create<ComicStore>((set) => ({
  currentProject: null,
  isLoading: false,
  error: null,

  setProject: (project) => set({ currentProject: project }),

  updateProject: (updates) =>
    set((state) => ({
      currentProject: state.currentProject
        ? { ...state.currentProject, ...updates, updatedAt: new Date() }
        : null,
    })),

  addPanel: (panel) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            panels: [...state.currentProject.panels, panel],
            updatedAt: new Date(),
          }
        : null,
    })),

  updatePanel: (panelId, updates) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            panels: state.currentProject.panels.map((panel) =>
              panel.id === panelId ? { ...panel, ...updates } : panel
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  removePanel: (panelId) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            panels: state.currentProject.panels.filter(
              (panel) => panel.id !== panelId
            ),
            updatedAt: new Date(),
          }
        : null,
    })),

  reorderPanels: (panels) =>
    set((state) => ({
      currentProject: state.currentProject
        ? {
            ...state.currentProject,
            panels: panels.map((panel, index) => ({ ...panel, order: index })),
            updatedAt: new Date(),
          }
        : null,
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  resetProject: () =>
    set({ currentProject: null, isLoading: false, error: null }),
}));

