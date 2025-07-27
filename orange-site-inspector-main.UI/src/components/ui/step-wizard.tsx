import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/api/utils";

export interface Step {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  status: 'pending' | 'current' | 'completed' | 'error';
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  currentStep,
  onStepClick,
  className
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isError = step.status === 'error';
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2",
                    {
                      "bg-orange-600 border-orange-600 text-white shadow-lg": isCurrent,
                      "bg-green-600 border-green-600 text-white": isCompleted,
                      "bg-red-600 border-red-600 text-white": isError,
                      "bg-gray-100 border-gray-300 text-gray-500": step.status === 'pending',
                      "cursor-pointer hover:scale-105": isClickable,
                      "cursor-default": !isClickable
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : isError ? (
                    <span className="text-sm font-bold">!</span>
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                
                {/* Step Info */}
                <div className="mt-3 text-center max-w-32">
                  <h3 className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-orange-600": isCurrent,
                      "text-green-600": isCompleted,
                      "text-red-600": isError,
                      "text-gray-500": step.status === 'pending'
                    }
                  )}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={cn(
                    "h-0.5 transition-all duration-300",
                    {
                      "bg-green-600": isCompleted,
                      "bg-orange-600": isCurrent && !isCompleted,
                      "bg-gray-300": step.status === 'pending'
                    }
                  )} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

interface StepContentProps {
  children: React.ReactNode;
  className?: string;
}

export const StepContent: React.FC<StepContentProps> = ({ children, className }) => {
  return (
    <div className={cn("mt-8 animate-in fade-in duration-300", className)}>
      {children}
    </div>
  );
};

interface StepActionsProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  skipLabel?: string;
  nextDisabled?: boolean;
  previousDisabled?: boolean;
  showSkip?: boolean;
  className?: string;
}

export const StepActions: React.FC<StepActionsProps> = ({
  onNext,
  onPrevious,
  onSkip,
  nextLabel = "Continue",
  previousLabel = "Back",
  skipLabel = "Skip",
  nextDisabled = false,
  previousDisabled = false,
  showSkip = false,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700", className)}>
      <div className="flex items-center space-x-3">
        {onPrevious && (
          <button
            onClick={onPrevious}
            disabled={previousDisabled}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              "border border-gray-300 text-gray-700 hover:bg-gray-50",
              "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {previousLabel}
          </button>
        )}
        
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {skipLabel}
          </button>
        )}
      </div>

      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={cn(
            "px-6 py-2 text-sm font-medium rounded-md transition-all duration-200",
            "bg-orange-600 text-white hover:bg-orange-700",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center space-x-2"
          )}
        >
          <span>{nextLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}; 