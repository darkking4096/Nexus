import React from 'react';

export interface ApprovalToolbarProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const ApprovalToolbar: React.FC<ApprovalToolbarProps> = ({
  currentStep,
  totalSteps,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting = false,
}) => {
  const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <nav
      className="border-t border-gray-300 bg-white sticky bottom-0 shadow-lg z-40"
      aria-label="Approval workflow navigation"
      data-testid="approval-toolbar"
    >
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span
              className="text-xs sm:text-sm font-medium text-gray-700"
              aria-label={`Progress: ${progressPercent} percent`}
            >
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Approval workflow progress"
          >
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-6 text-xs sm:text-sm">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`flex flex-col items-center ${
                i <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
              aria-label={`Step ${i + 1}${i === currentStep ? ' (current)' : ''}`}
            >
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold ${
                  i < currentStep
                    ? 'bg-green-600 text-white'
                    : i === currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className="mt-1 text-center">Step {i + 1}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onPrevious}
            disabled={!canGoBack || isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to previous step"
            data-testid="previous-button"
          >
            ← Previous
          </button>

          <button
            onClick={onNext}
            disabled={!canGoForward || isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Go to next step"
            data-testid="next-button"
          >
            Next →
          </button>

          {/* Submit Button - Only on Last Step */}
          {currentStep === totalSteps - 1 && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
              aria-label="Submit approval"
              data-testid="submit-button"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Approval'}
            </button>
          )}
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300">
              ←
            </kbd>
            {' '}Previous{' '}
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 ml-2">
              →
            </kbd>
            {' '}Next
          </p>
        </div>
      </div>
    </nav>
  );
};

export default ApprovalToolbar;
