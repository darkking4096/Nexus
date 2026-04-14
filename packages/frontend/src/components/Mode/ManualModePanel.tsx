import React from 'react';

export interface ManualModePanelProps {
  currentStep?: 'research' | 'analysis' | 'caption' | 'visual' | 'publish';
  onStepAction?: (step: string, action: 'approve' | 'reject' | 'edit') => void;
  disabled?: boolean;
}

const workflowSteps = [
  {
    id: 'research',
    name: 'Research',
    description: 'Gather content inspiration and references',
    icon: '🔍',
  },
  {
    id: 'analysis',
    name: 'Analysis',
    description: 'Analyze trends and audience insights',
    icon: '📊',
  },
  {
    id: 'caption',
    name: 'Caption',
    description: 'Generate and review caption',
    icon: '✏️',
  },
  {
    id: 'visual',
    name: 'Visual',
    description: 'Create and design visual content',
    icon: '🎨',
  },
  {
    id: 'publish',
    name: 'Publish',
    description: 'Review and approve for publishing',
    icon: '📤',
  },
];

export const ManualModePanel: React.FC<ManualModePanelProps> = ({
  currentStep = 'research',
  onStepAction,
  disabled = false,
}) => {
  const currentStepIndex = workflowSteps.findIndex((s) => s.id === currentStep);

  const handleAction = (stepId: string, action: 'approve' | 'reject' | 'edit') => {
    onStepAction?.(stepId, action);
  };

  return (
    <section
      className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg border border-gray-300 shadow-sm"
      aria-label="Manual mode workflow"
      data-testid="manual-mode-panel"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Approval Workflow</h2>
        <p className="text-sm text-gray-600 mt-2">
          Review and approve each step of the content creation process
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStepIndex + 1} of {workflowSteps.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStepIndex + 1) / workflowSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / workflowSteps.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={workflowSteps.length}
            aria-label={`Progress: ${currentStepIndex + 1} of ${workflowSteps.length} steps`}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {workflowSteps.map((step, index) => {
          const isCurrentStep = step.id === currentStep;
          const isCompletedStep = index < currentStepIndex;
          const status = isCompletedStep ? 'completed' : isCurrentStep ? 'current' : 'pending';

          return (
            <article
              key={step.id}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  isCurrentStep
                    ? 'border-blue-500 bg-blue-50'
                    : isCompletedStep
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                }
              `}
              data-testid={`workflow-step-${step.id}`}
              aria-current={isCurrentStep ? 'step' : undefined}
            >
              {/* Step Header */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Icon */}
                <span className="text-2xl flex-shrink-0" aria-hidden="true">
                  {step.icon}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
                    <span
                      className={`
                        px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap
                        ${
                          isCompletedStep
                            ? 'bg-green-200 text-green-800'
                            : isCurrentStep
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-gray-300 text-gray-800'
                        }
                      `}
                      role="status"
                      aria-label={`${step.name} status: ${status}`}
                    >
                      {status === 'completed'
                        ? '✓ Approved'
                        : status === 'current'
                          ? '⏳ Pending'
                          : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>

              {/* Actions (only visible for current step) */}
              {isCurrentStep && !disabled && (
                <div
                  className="mt-4 flex flex-col sm:flex-row gap-2"
                  role="group"
                  aria-label={`Actions for ${step.name} step`}
                >
                  <button
                    onClick={() => handleAction(step.id, 'approve')}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    data-testid={`action-approve-${step.id}`}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleAction(step.id, 'edit')}
                    className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                    data-testid={`action-edit-${step.id}`}
                  >
                    ✎ Edit
                  </button>
                  <button
                    onClick={() => handleAction(step.id, 'reject')}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    data-testid={`action-reject-${step.id}`}
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
