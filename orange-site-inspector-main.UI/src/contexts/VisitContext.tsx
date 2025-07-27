import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Types
export interface VisitComponent {
  id: number;
  name: string;
  description: string;
  category: string;
  beforeImage?: File;
  afterImage?: File;
  notes?: string;
  status?: 'good' | 'needs-attention' | 'critical';
}

export interface VisitState {
  selectedSiteId: number | null;
  siteInfo: {
    name: string;
    location: string;
    coordinates: string;
    notes: string;
  };
  selectedComponents: VisitComponent[];
  uploadedImages: { [key: number]: File };
  visitId?: number;
  isDraft: boolean;
  lastSaved: Date | null;
}

export interface VisitAction {
  type: 'SET_SITE' | 'SET_SITE_INFO' | 'ADD_COMPONENT' | 'REMOVE_COMPONENT' | 'UPDATE_COMPONENT' | 'UPLOAD_IMAGE' | 'SET_VISIT_ID' | 'CLEAR_VISIT' | 'LOAD_DRAFT' | 'SAVE_DRAFT';
  payload?: any;
}

// Initial state
const initialState: VisitState = {
  selectedSiteId: null,
  siteInfo: {
    name: '',
    location: '',
    coordinates: '',
    notes: ''
  },
  selectedComponents: [],
  uploadedImages: {},
  isDraft: false,
  lastSaved: null
};

// Reducer
const visitReducer = (state: VisitState, action: VisitAction): VisitState => {
  switch (action.type) {
    case 'SET_SITE':
      return {
        ...state,
        selectedSiteId: action.payload.siteId,
        siteInfo: {
          ...state.siteInfo,
          name: action.payload.name || '',
          location: action.payload.location || ''
        }
      };

    case 'SET_SITE_INFO':
      return {
        ...state,
        siteInfo: {
          ...state.siteInfo,
          ...action.payload
        }
      };

    case 'ADD_COMPONENT':
      return {
        ...state,
        selectedComponents: [...state.selectedComponents, action.payload]
      };

    case 'REMOVE_COMPONENT':
      return {
        ...state,
        selectedComponents: state.selectedComponents.filter(comp => comp.id !== action.payload)
      };

    case 'UPDATE_COMPONENT':
      return {
        ...state,
        selectedComponents: state.selectedComponents.map(comp =>
          comp.id === action.payload.id ? { ...comp, ...action.payload } : comp
        )
      };

    case 'UPLOAD_IMAGE':
      return {
        ...state,
        uploadedImages: {
          ...state.uploadedImages,
          [action.payload.componentId]: action.payload.file
        }
      };

    case 'SET_VISIT_ID':
      return {
        ...state,
        visitId: action.payload,
        isDraft: false
      };

    case 'CLEAR_VISIT':
      return initialState;

    case 'LOAD_DRAFT':
      return {
        ...action.payload,
        isDraft: true
      };

    case 'SAVE_DRAFT':
      return {
        ...state,
        isDraft: true,
        lastSaved: new Date()
      };

    default:
      return state;
  }
};

// Context
interface VisitContextType {
  state: VisitState;
  dispatch: React.Dispatch<VisitAction>;
  saveDraft: () => void;
  loadDraft: () => boolean;
  clearDraft: () => void;
  hasUnsavedChanges: () => boolean;
}

const VisitContext = createContext<VisitContextType | undefined>(undefined);

// Provider
export const VisitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(visitReducer, initialState);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.selectedSiteId || state.selectedComponents.length > 0) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.selectedSiteId, state.selectedComponents]);

  // Save draft to localStorage
  const saveDraft = () => {
    try {
      const draftData = {
        ...state,
        lastSaved: new Date()
      };
      localStorage.setItem('visitDraft', JSON.stringify(draftData));
      dispatch({ type: 'SAVE_DRAFT' });
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Load draft from localStorage
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem('visitDraft');
      if (saved) {
        const draftData = JSON.parse(saved);
        // Only load if draft is less than 24 hours old
        const draftAge = new Date().getTime() - new Date(draftData.lastSaved).getTime();
        if (draftAge < 24 * 60 * 60 * 1000) {
          dispatch({ type: 'LOAD_DRAFT', payload: draftData });
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return false;
  };

  // Clear draft
  const clearDraft = () => {
    try {
      localStorage.removeItem('visitDraft');
      dispatch({ type: 'CLEAR_VISIT' });
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // Check for unsaved changes
  const hasUnsavedChanges = () => {
    return state.selectedSiteId !== null || state.selectedComponents.length > 0;
  };

  const value: VisitContextType = {
    state,
    dispatch,
    saveDraft,
    loadDraft,
    clearDraft,
    hasUnsavedChanges
  };

  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );
};

// Hook
export const useVisit = () => {
  const context = useContext(VisitContext);
  if (context === undefined) {
    throw new Error('useVisit must be used within a VisitProvider');
  }
  return context;
}; 