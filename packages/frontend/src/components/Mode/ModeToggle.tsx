import React from 'react';

export interface ModeToggleProps {
  activeMode: 'manual' | 'autopilot';
  onModeChange: (mode: 'manual' | 'autopilot') => void;
  disabled?: boolean;
}

const modeConfig = {
  manual: {
    label: 'Manual',
    description: 'Review and approve each step',
    icon: '✓',
    color: 'blue',
  },
  autopilot: {
    label: 'Autopilot',
    description: 'Automatic scheduling',
    icon: '⚙',
    color: 'purple',
  },
};

const colorClasses = {
  blue: {
    active: 'bg-blue-500 text-white border-blue-600',
    inactive: 'bg-white text-blue-600 border-blue-300',
  },
  purple: {
    active: 'bg-purple-500 text-white border-purple-600',
    inactive: 'bg-white text-purple-600 border-purple-300',
  },
};

export const ModeToggle: React.FC<ModeToggleProps> = ({
  activeMode,
  onModeChange,
  disabled = false,
}) => {
  const handleModeClick = (mode: 'manual' | 'autopilot') => {
    if (!disabled && activeMode !== mode) {
      onModeChange(mode);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto"
      role="group"
      aria-label="Mode selection"
      data-testid="mode-toggle"
    >
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Select Mode</h2>
        <p className="text-sm text-gray-600 mt-1">Choose how you want to manage content</p>
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-2 sm:gap-3 flex-col sm:flex-row">
        {(['manual', 'autopilot'] as const).map((mode) => {
          const config = modeConfig[mode];
          const colors = colorClasses[config.color as keyof typeof colorClasses];
          const isActive = activeMode === mode;
          const buttonClasses = isActive ? colors.active : colors.inactive;

          return (
            <button
              key={mode}
              onClick={() => handleModeClick(mode)}
              disabled={disabled}
              className={`
                flex-1 px-4 py-3 sm:py-4 rounded-lg border-2 font-medium
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
                hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                flex flex-col items-center gap-2
                ${buttonClasses}
                ${isActive ? 'ring-2 ring-offset-2 ring-' + config.color + '-500' : ''}
              `}
              aria-pressed={isActive}
              aria-label={`${config.label} mode: ${config.description}`}
              data-testid={`mode-button-${mode}`}
            >
              {/* Icon */}
              <span className="text-2xl" aria-hidden="true">
                {config.icon}
              </span>

              {/* Label and Description */}
              <div className="text-center">
                <div className="font-semibold text-base">{config.label}</div>
                <div className="text-xs sm:text-sm opacity-75">{config.description}</div>
              </div>

              {/* Active Badge */}
              {isActive && (
                <span
                  className="text-xs font-bold mt-2 px-2 py-1 bg-opacity-20 rounded-full"
                  role="status"
                  aria-live="polite"
                >
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mode Indicator Line */}
      <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            activeMode === 'manual' ? 'bg-blue-500 w-1/2' : 'bg-purple-500 w-1/2 ml-auto'
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
