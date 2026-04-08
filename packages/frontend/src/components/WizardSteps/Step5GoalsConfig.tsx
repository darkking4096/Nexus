import React, { useState } from 'react';
import type { WizardState } from '../../pages/ProfileWizard';

interface Props {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onPrev: () => void;
}

const PREDEFINED_GOALS = [
  'Increase followers',
  'Boost engagement (likes/comments)',
  'Drive traffic to website',
  'Generate sales',
  'Build brand awareness',
  'Establish thought leadership',
  'Community building',
  'Content consistency',
];

const Step5GoalsConfig: React.FC<Props> = ({ data, onChange, onPrev }) => {
  const [customGoal, setCustomGoal] = useState('');

  const handleGoalToggle = (goal: string) => {
    const updated = data.goals.includes(goal)
      ? data.goals.filter((g) => g !== goal)
      : [...data.goals, goal];
    onChange({ goals: updated });
  };

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !data.goals.includes(customGoal)) {
      onChange({ goals: [...data.goals, customGoal] });
      setCustomGoal('');
    }
  };

  const handleRemoveGoal = (goal: string) => {
    onChange({
      goals: data.goals.filter((g) => g !== goal),
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Goals & KPIs</h2>
      <p className="text-gray-600 mb-6">
        What are your main goals for this Instagram account? Select at least one to help NEXUS optimize content for your objectives.
      </p>

      <div className="space-y-6">
        {/* Predefined Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Primary Goals
          </label>
          <div className="space-y-3">
            {PREDEFINED_GOALS.map((goal) => (
              <button
                key={goal}
                onClick={() => handleGoalToggle(goal)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all flex items-center ${
                  data.goals.includes(goal)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.goals.includes(goal)}
                  onChange={() => handleGoalToggle(goal)}
                  className="mr-3 w-4 h-4 cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-900">{goal}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Custom Goal
          </label>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomGoal()}
              placeholder="E.g., Launch new product line..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleAddCustomGoal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Goals */}
        {data.goals.length > 0 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-3">Selected Goals:</p>
            <div className="flex flex-wrap gap-2">
              {data.goals.map((goal) => (
                <div
                  key={goal}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {goal}
                  <button
                    onClick={() => handleRemoveGoal(goal)}
                    className="font-bold hover:text-green-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Insight:</strong> Having clear goals helps NEXUS create a content strategy that drives measurable results. You can track these KPIs in your analytics dashboard.
          </p>
        </div>

        {/* Summary */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-700">Goals ({data.goals.length}):</dt>
              <dd className="text-gray-600 ml-4 mt-1">
                {data.goals.length > 0 ? data.goals.join(', ') : 'Not selected'}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-gray-500">
            After you submit, your profile will be created and you'll be able to start generating content!
          </p>
        </div>
      </div>

      <div className="flex gap-4 justify-between mt-8">
        <button
          onClick={onPrev}
          className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          ← Previous
        </button>
      </div>
    </div>
  );
};

export default Step5GoalsConfig;
