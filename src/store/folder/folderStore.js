import { create } from 'zustand';
import { createFolder, deleteFolderById, fetchFolders, updateFolder } from '../../service/folderApi';

export const useFolderStore = create((set, get) => ({
  folders: [],
  isLoading: false,
  error: null,

  // 폴더 목록 불러오기
  fetchFolders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchFolders();
      set({ folders: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // 폴더 추가
  addFolder: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const newFolder = await createFolder(name);
      set((state) => ({ 
        folders: [newFolder, ...state.folders],
        isLoading: false 
      }));
      return newFolder;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 폴더 수정
  updateFolder: async (id, name) => {
    set({ isLoading: true, error: null });
    try {
      const updatedFolder = await updateFolder(id, name);
      set((state) => ({
        folders: state.folders.map((f) => (f.id === id ? updatedFolder : f)),
        isLoading: false
      }));
      return updatedFolder;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // 폴더 삭제
  deleteFolder: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteFolderById(id);
      set((state) => ({
        folders: state.folders.filter((f) => f.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));
