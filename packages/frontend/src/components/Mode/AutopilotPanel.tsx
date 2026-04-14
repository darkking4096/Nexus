import React, { useState } from 'react';

export interface AutopilotConfig {
  enabled: boolean;
  days: string[];
  times: string[];
  frequency?: string;
  nextPublishTime?: string;
}

export interface AutopilotPanelProps {
  config?: AutopilotConfig;
  onConfigChange?: (config: AutopilotConfig) => void;
  onToggleEnabled?: (enabled: boolean) => void;
  disabled?: boolean;
}

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const calculateFrequency = (days: string[], times: string[]): string => {
  if (!days.length || !times.length) return '0x per week';
  const frequency = days.length * times.length;
  return `${frequency}x per week`;
};

export const AutopilotPanel: React.FC<AutopilotPanelProps> = ({
  config = {
    enabled: false,
    days: ['MON', 'WED', 'FRI'],
    times: ['09:00', '17:00'],
  },
  onConfigChange,
  onToggleEnabled,
  disabled = false,
}) => {
  const [localConfig, setLocalConfig] = useState<AutopilotConfig>(config);
  const frequency = calculateFrequency(localConfig.days, localConfig.times);

  const handleToggleDay = (day: string) => {
    const newDays = localConfig.days.includes(day)
      ? localConfig.days.filter((d) => d !== day)
      : [...localConfig.days, day];

    const newConfig = { ...localConfig, days: newDays };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleToggleTime = (time: string, index: number) => {
    const newTime = time.trim();
    if (!newTime) return;

    const newTimes = [...localConfig.times];
    newTimes[index] = newTime;

    const newConfig = { ...localConfig, times: newTimes };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleAddTime = () => {
    const newConfig = {
      ...localConfig,
      times: [...localConfig.times, '12:00'],
    };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleRemoveTime = (index: number) => {
    const newTimes = localConfig.times.filter((_, i) => i !== index);
    const newConfig = { ...localConfig, times: newTimes };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    const newConfig = { ...localConfig, enabled };
    setLocalConfig(newConfig);
    onToggleEnabled?.(enabled);
    onConfigChange?.(newConfig);
  };

  return (
    <section
      className="w-full max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg border border-gray-300 shadow-sm"
      aria-label="Autopilot mode configuration"
      data-testid="autopilot-panel"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Autopilot Schedule</h2>
          <p className="text-sm text-gray-600 mt-2">
            Configure automatic content publishing without manual approval
          </p>
        </div>

        {/* Enable/Disable Toggle */}
        <label className="flex items-center gap-3 cursor-pointer" htmlFor="autopilot-toggle">
          <input
            id="autopilot-toggle"
            type="checkbox"
            checked={localConfig.enabled}
            onChange={(e) => handleToggleEnabled(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Enable or disable Autopilot mode"
            data-testid="autopilot-toggle"
          />
          <span className="text-sm font-medium text-gray-700">
            {localConfig.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {/* Status Indicator */}
      {localConfig.enabled && (
        <div
          className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg"
          role="status"
          aria-live="polite"
          aria-label={`Autopilot is ${localConfig.enabled ? 'active' : 'inactive'}`}
        >
          <p className="text-sm text-purple-800">
            ✓ Autopilot is active. Content will be published automatically according to schedule.
          </p>
        </div>
      )}

      {/* Configuration Form */}
      <div className="space-y-6">
        {/* Days Selection */}
        <fieldset>
          <legend className="text-lg font-semibold text-gray-900 mb-3">
            Days of Publication
          </legend>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                onClick={() => handleToggleDay(day)}
                disabled={disabled || !localConfig.enabled}
                className={`
                  px-3 py-2 rounded-lg font-medium text-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    localConfig.days.includes(day)
                      ? 'bg-purple-500 text-white border-2 border-purple-600'
                      : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                  }
                `}
                aria-pressed={localConfig.days.includes(day)}
                data-testid={`day-toggle-${day}`}
              >
                {day.slice(0, 2)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">Select at least one day</p>
        </fieldset>

        {/* Times Selection */}
        <fieldset>
          <legend className="text-lg font-semibold text-gray-900 mb-3">
            Publication Times
          </legend>
          <div className="space-y-2">
            {localConfig.times.map((time, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleToggleTime(e.target.value, index)}
                  disabled={disabled || !localConfig.enabled}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Publication time ${index + 1}`}
                  data-testid={`time-input-${index}`}
                />
                {localConfig.times.length > 1 && (
                  <button
                    onClick={() => handleRemoveTime(index)}
                    disabled={disabled || !localConfig.enabled}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Remove time ${index + 1}`}
                    data-testid={`remove-time-${index}`}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTime}
            disabled={disabled || !localConfig.enabled || localConfig.times.length >= 5}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="add-time-button"
          >
            + Add Time
          </button>
          <p className="text-xs text-gray-600 mt-2">Up to 5 times per day</p>
        </fieldset>

        {/* Frequency Display */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Publication Frequency</p>
          <p className="text-2xl font-bold text-purple-600">{frequency}</p>
          {localConfig.nextPublishTime && (
            <p className="text-xs text-gray-600 mt-2">
              Next publish: <time dateTime={localConfig.nextPublishTime}>{localConfig.nextPublishTime}</time>
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
