import { apiClient, Visit, VisitComponent as ApiVisitComponent } from '@/lib/api';
import { VisitComponent as LocalVisitComponent } from '@/contexts/VisitContext';
import { ApiClient } from '@/lib/api';

export interface CreateVisitData {
  siteId: number;
  notes?: string;
  estimatedDurationMinutes?: number;
  components: LocalVisitComponent[];
}

export interface VisitValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface VisitComponent {
  id: number;
  name: string;
  groupName: string;
  beforePhoto?: File;
  afterPhoto?: File;
  beforeComment?: string;
  afterComment?: string;
  isSelected: boolean;
}

export interface ExtendedCreateVisitRequest {
  siteId: number;
  siteName?: string;
  siteAddress?: string;
  inspectorName?: string;
  visitDate?: string;
  visitTime?: string;
  weatherConditions?: string;
  temperature?: number;
  notes?: string;
  components: VisitComponent[];
}

export interface VisitResponse {
  visitId: string;
  success: boolean;
  message?: string;
}

export class VisitService {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // Validate visit data before creation
  static validateVisitData(data: CreateVisitData): VisitValidationResult {
    const errors: string[] = [];

    if (!data.siteId || data.siteId <= 0) {
      errors.push('Valid site selection is required');
    }

    if (!data.components || data.components.length === 0) {
      errors.push('At least one component must be selected');
    }

    if (data.components.length > 50) {
      errors.push('Cannot select more than 50 components');
    }

    // Check if all selected components have before images
    const componentsWithoutImages = data.components.filter(
      comp => !comp.beforeImage
    );
    if (componentsWithoutImages.length > 0) {
      errors.push(`${componentsWithoutImages.length} component(s) missing before images`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create visit with components
  async createVisit(visitData: ExtendedCreateVisitRequest): Promise<VisitResponse> {
    try {
      console.log('Creating visit with data:', visitData);

      // Validate required fields
      if (!visitData.siteId) {
        throw new Error('Site ID is required');
      }

      if (!visitData.components || visitData.components.length === 0) {
        throw new Error('At least one component must be selected');
      }

      const selectedComponents = visitData.components.filter(comp => comp.isSelected);
      if (selectedComponents.length === 0) {
        throw new Error('At least one component must be selected');
      }

      // Validate that all selected components have both before and after photos
      const incompleteComponents = selectedComponents.filter(
        comp => !comp.beforePhoto || !comp.afterPhoto
      );

      if (incompleteComponents.length > 0) {
        const incompleteNames = incompleteComponents.map(comp => comp.name).join(', ');
        throw new Error(`Missing photos for components: ${incompleteNames}`);
      }

      // Prepare the visit data for API
      const apiVisitData = {
        siteId: visitData.siteId,
        siteName: visitData.siteName,
        siteAddress: visitData.siteAddress,
        inspectorName: visitData.inspectorName || 'Inspector',
        visitDate: visitData.visitDate || new Date().toISOString().split('T')[0],
        visitTime: visitData.visitTime || new Date().toTimeString().split(' ')[0],
        weatherConditions: visitData.weatherConditions || 'Unknown',
        temperature: visitData.temperature,
        notes: visitData.notes,
        components: selectedComponents.map(comp => ({
          oramaItemId: comp.id,
          oramaItemName: comp.name,
          oramaGroupName: comp.groupName,
          beforePhoto: comp.beforePhoto,
          afterPhoto: comp.afterPhoto,
          beforeComment: comp.beforeComment,
          afterComment: comp.afterComment
        }))
      };

      console.log('Sending visit data to API:', apiVisitData);

      // Make real API call
      const response = await this.apiClient.createVisit(apiVisitData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to create visit');
      }

      console.log('Visit created successfully:', response);
      return {
        visitId: response.data.id.toString(),
        success: true,
        message: 'Visit created successfully'
      };

    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  }

  // Start visit
  static async startVisit(visitId: number, notes?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.startVisit(visitId);
      
      if (!response.success) {
        return {
          success: false,
          error: response.message || 'Failed to start visit'
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error starting visit:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Complete visit with enhanced data
  static async completeVisit(
    visitId: number, 
    visitData: any
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Upload after image if exists
      if (visitData.afterPhoto) {
        try {
          await apiClient.uploadVisitImage(visitData.afterPhoto, visitId);
        } catch (error) {
          console.error('Failed to upload after image:', error);
        }
      }

      // Update visit with completion data
      const completionData = {
        overallCondition: visitData.overallCondition,
        issuesFound: visitData.issuesFound,
        actionsTaken: visitData.actionsTaken,
        recommendations: visitData.recommendations,
        completionTime: visitData.completionTime,
        completionNotes: visitData.notes
      };

      const response = await apiClient.completeVisit(visitId);
      
      if (!response.success) {
        return {
          success: false,
          error: response.message || 'Failed to complete visit'
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error completing visit:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Save draft data for after inspection
  async saveDraft(visitData: Partial<ExtendedCreateVisitRequest>): Promise<void> {
    try {
      localStorage.setItem('visitDraft', JSON.stringify(visitData));
      console.log('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  }

  // Load draft data for after inspection
  async loadDraft(): Promise<Partial<ExtendedCreateVisitRequest> | null> {
    try {
      const draft = localStorage.getItem('visitDraft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        console.log('Draft loaded successfully:', parsedDraft);
        return parsedDraft;
      }
      return null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  // Clear draft data for after inspection
  async clearDraft(): Promise<void> {
    try {
      localStorage.removeItem('visitDraft');
      console.log('Draft cleared successfully');
    } catch (error) {
      console.error('Error clearing draft:', error);
      throw error;
    }
  }

  // Get visit details
  static async getVisitDetails(visitId: number): Promise<{ success: boolean; visit?: Visit; components?: ApiVisitComponent[]; error?: string }> {
    try {
      const [visitResponse, componentsResponse] = await Promise.all([
        apiClient.getVisitById(visitId),
        apiClient.getVisitComponents(visitId)
      ]);

      if (!visitResponse.success) {
        return {
          success: false,
          error: visitResponse.message || 'Failed to fetch visit details'
        };
      }

      return {
        success: true,
        visit: visitResponse.data,
        components: componentsResponse.success ? componentsResponse.data : []
      };
    } catch (error: any) {
      console.error('Error fetching visit details:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Check if visit can be started - simplified check based on visit status
  static async canStartVisit(visitId: number): Promise<{ success: boolean; canStart: boolean; error?: string }> {
    try {
      const response = await apiClient.getVisitById(visitId);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          canStart: false,
          error: response.message || 'Failed to fetch visit details'
        };
      }

      // Can start if status is Pending
      const canStart = response.data.status === 'Pending';

      return {
        success: true,
        canStart
      };
    } catch (error: any) {
      console.error('Error checking visit status:', error);
      return {
        success: false,
        canStart: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Check if visit can be completed - simplified check based on visit status
  static async canCompleteVisit(visitId: number): Promise<{ success: boolean; canComplete: boolean; error?: string }> {
    try {
      const response = await apiClient.getVisitById(visitId);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          canComplete: false,
          error: response.message || 'Failed to fetch visit details'
        };
      }

      // Can complete if status is InProgress
      const canComplete = response.data.status === 'InProgress';

      return {
        success: true,
        canComplete
      };
    } catch (error: any) {
      console.error('Error checking visit status:', error);
      return {
        success: false,
        canComplete: false,
        error: error.message || 'An unexpected error occurred'
      };
    }
  }

  // Optimize image before upload
  private async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Validate image file
  static validateImage(file: File): { isValid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image file size must be less than 10MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPG, PNG, and GIF images are allowed'
      };
    }

    return { isValid: true };
  }

  // Upload image to visit
  async uploadImage(file: File, type: 'before' | 'after'): Promise<string> {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File must be a valid image (JPEG, PNG, or WebP)');
      }

      // Optimize image if needed
      const optimizedFile = await this.optimizeImage(file);

      // For now, simulate upload with mock response
      // In production, this would be: const response = await this.apiClient.uploadImage(optimizedFile, type);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock successful upload
      const mockImageUrl = `https://example.com/uploads/${type}_${Date.now()}.jpg`;
      console.log(`Image uploaded successfully: ${mockImageUrl}`);
      
      return mockImageUrl;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Validate visit data
  async validateVisitData(visitData: Partial<ExtendedCreateVisitRequest>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate site selection
    if (!visitData.siteId) {
      errors.push('Site must be selected');
    }

    // Validate components
    if (!visitData.components || visitData.components.length === 0) {
      errors.push('At least one component must be selected');
    } else {
      const selectedComponents = visitData.components.filter(comp => comp.isSelected);
      if (selectedComponents.length === 0) {
        errors.push('At least one component must be selected');
      } else {
        // Check for missing photos
        const missingBeforePhotos = selectedComponents.filter(comp => !comp.beforePhoto);
        const missingAfterPhotos = selectedComponents.filter(comp => !comp.afterPhoto);

        if (missingBeforePhotos.length > 0) {
          const names = missingBeforePhotos.map(comp => comp.name).join(', ');
          errors.push(`Missing before photos for: ${names}`);
        }

        if (missingAfterPhotos.length > 0) {
          const names = missingAfterPhotos.map(comp => comp.name).join(', ');
          errors.push(`Missing after photos for: ${names}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export a singleton instance
export const visitService = new VisitService(); 