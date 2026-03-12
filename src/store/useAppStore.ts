import { create } from 'zustand'

interface AppState {
  // Popup state
  isPopupOpen: boolean
  openPopup: () => void
  closePopup: () => void
  
  // Login modal state
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
  
  // Booking modal state
  isBookingModalOpen: boolean
  bookingTeacherId: string | null
  openBookingModal: (teacherId: string) => void
  closeBookingModal: () => void
  
  // Authentication state
  isAuthenticated: boolean
  user: { email: string; name?: string } | null
  setAuthenticated: (isAuth: boolean, user?: { email: string; name?: string }) => void
  
  // Email submission state
  emailSubmitted: string | null
  setEmailSubmitted: (email: string) => void
  
  // Program selection
  selectedProgram: string | null
  setSelectedProgram: (program: string | null) => void
  
  // Roadmap interactions
  currentStep: number
  setCurrentStep: (step: number) => void
  
  // Multi-step form state
  formData: {
    goals: string[]
    ageGroup: string | null
    level: string | null
    learningGoal: string[]
  }
  updateFormData: (data: Partial<AppState['formData']>) => void
  resetFormData: () => void
  
  // Toast notifications
  toasts: { id: number; msg: string; type: string }[]
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

export const useAppStore = create<AppState>((set) => ({
  // Popup state
  isPopupOpen: false,
  openPopup: () => set({ isPopupOpen: true }),
  closePopup: () => set({ isPopupOpen: false }),
  
  // Login modal state
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  
  // Booking modal state
  isBookingModalOpen: false,
  bookingTeacherId: null,
  openBookingModal: (teacherId) => set({ isBookingModalOpen: true, bookingTeacherId: teacherId }),
  closeBookingModal: () => set({ isBookingModalOpen: false, bookingTeacherId: null }),
  
  // Authentication state
  isAuthenticated: false,
  user: null,
  setAuthenticated: (isAuth, user) => set({ isAuthenticated: isAuth, user: user || null }),
  
  // Email submission state
  emailSubmitted: null,
  setEmailSubmitted: (email) => set({ emailSubmitted: email }),
  
  // Program selection
  selectedProgram: null,
  setSelectedProgram: (program) => set({ selectedProgram: program }),
  
  // Roadmap interactions
  currentStep: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  
  // Multi-step form state
  formData: {
    goals: [],
    ageGroup: null,
    level: null,
    learningGoal: [],
  },
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  resetFormData: () => set({
    formData: {
      goals: [],
      ageGroup: null,
      level: null,
      learningGoal: [],
    }
  }),
  
  // Toast notifications
  toasts: [],
  addToast: (msg, type = 'success') => {
    const id = Date.now()
    set((state) => ({
      toasts: [...state.toasts, { id, msg, type }]
    }))
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 3500)
  },
}))
