import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../types';

interface ChatState {
  messages: Message[];
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  signIn: (user: { name: string; email: string }) => void;
  signOut: () => void;
  checkAuth: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isAuthenticated: false,
      user: null,

      addMessage: (message: Message) =>
        set((state) => ({
          messages: [...state.messages, message]
        })),

      clearMessages: () =>
        set({ messages: [] }),

      signIn: (user: { name: string; email: string }) =>
        set({
          isAuthenticated: true,
          user
        }),

      signOut: () =>
        set({
          isAuthenticated: false,
          user: null,
          messages: [] // Clear messages on sign out for privacy
        }),

      checkAuth: () => {
        // This would typically check for stored tokens or session
        // For now, we'll just check if user data exists
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'hike-planner-chat',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        messages: state.messages
      })
    }
  )
);
