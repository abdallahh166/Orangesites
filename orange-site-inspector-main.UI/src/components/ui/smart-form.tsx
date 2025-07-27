import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/api/utils";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: ValidationRule;
  required?: boolean;
  disabled?: boolean;
  helpText?: string;
  group?: string;
}

interface SmartFormProps {
  fields: FieldConfig[];
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  submitLabel?: string;
  className?: string;
  showProgress?: boolean;
  onFieldChange?: (name: string, value: any) => void;
}

export const SmartForm: React.FC<SmartFormProps> = ({
  fields,
  onSubmit,
  initialData = {},
  submitLabel = "Submit",
  className,
  showProgress = true,
  onFieldChange
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group fields by their group property
  const groupedFields = fields.reduce((acc, field) => {
    const group = field.group || 'default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(field);
    return acc;
  }, {} as Record<string, FieldConfig[]>);

  const validateField = (name: string, value: any, config: FieldConfig): string | null => {
    const validation = config.validation || {};
    
    // Required validation
    if (validation.required && (!value || value.toString().trim() === '')) {
      return `${config.label} is required`;
    }

    if (!value || value.toString().trim() === '') {
      return null; // Skip other validations if field is empty and not required
    }

    // Length validations
    if (validation.minLength && value.toString().length < validation.minLength) {
      return `${config.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && value.toString().length > validation.maxLength) {
      return `${config.label} must be no more than ${validation.maxLength} characters`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(value.toString())) {
      return `${config.label} format is invalid`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name], field);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (name: string, value: any) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);

    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));

    // Real-time validation for touched fields
    if (touched[name]) {
      const fieldConfig = fields.find(f => f.name === name);
      if (fieldConfig) {
        const error = validateField(name, value, fieldConfig);
        setErrors(prev => ({
          ...prev,
          [name]: error || ''
        }));
      }
    }

    onFieldChange?.(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const baseInputClasses = cn(
      "w-full px-3 py-2 border rounded-md transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
      "disabled:bg-gray-100 disabled:cursor-not-allowed",
      {
        "border-red-500": showError,
        "border-gray-300 dark:border-gray-600": !showError,
        "bg-white dark:bg-gray-800": !field.disabled
      }
    );

    const renderInput = () => {
      switch (field.type) {
        case 'textarea':
          return (
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={cn(baseInputClasses, "resize-none min-h-[100px]")}
            />
          );

        case 'select':
          return (
            <select
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              disabled={field.disabled}
              className={baseInputClasses}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );

        case 'date':
        case 'time':
          return (
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={baseInputClasses}
            />
          );

        default:
          return (
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              disabled={field.disabled}
              className={baseInputClasses}
            />
          );
      }
    };

    return (
      <div key={field.name} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        {renderInput()}
        
        {showError && (
          <div className="flex items-center space-x-1 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        {field.helpText && !showError && (
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Info className="w-4 h-4" />
            <span>{field.helpText}</span>
          </div>
        )}
      </div>
    );
  };

  const getCompletionPercentage = () => {
    const requiredFields = fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f => {
      const value = formData[f.name];
      return value && value.toString().trim() !== '';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Form Progress</span>
            <span>{getCompletionPercentage()}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Fields */}
      {Object.entries(groupedFields).map(([groupName, groupFields]) => (
        <div key={groupName} className="space-y-4">
          {groupName !== 'default' && (
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              {groupName}
            </h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupFields.map(renderField)}
          </div>
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className={cn(
            "px-6 py-2 text-sm font-medium rounded-md transition-all duration-200",
            "bg-orange-600 text-white hover:bg-orange-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center space-x-2"
          )}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Submitting...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
}; 