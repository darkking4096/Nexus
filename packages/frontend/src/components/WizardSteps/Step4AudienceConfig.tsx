import React, { useState } from 'react';
import type { WizardState } from '../../pages/ProfileWizard';

interface Props {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PREDEFINED_INTERESTS = [
  'Technology',
  'Fitness & Health',
  'Fashion & Beauty',
  'Travel',
  'Food & Cooking',
  'Business & Entrepreneurship',
  'Education',
  'Entertainment',
  'Lifestyle',
  'Personal Development',
  'Sports',
  'Art & Design',
];

const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

const Step4AudienceConfig: React.FC<Props> = ({ data, onChange, onNext, onPrev }) => {
  const [customInterest, setCustomInterest] = useState('');

  const handleAgeChange = (age: string) => {
    onChange({ audience_age: age });
  };

  const handleInterestToggle = (interest: string) => {
    const updated = data.audience_interests.includes(interest)
      ? data.audience_interests.filter((i) => i !== interest)
      : [...data.audience_interests, interest];
    onChange({ audience_interests: updated });
  };

  const handleAddCustomInterest = () => {
    if (customInterest.trim() && !data.audience_interests.includes(customInterest)) {
      onChange({ audience_interests: [...data.audience_interests, customInterest] });
      setCustomInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    onChange({
      audience_interests: data.audience_interests.filter((i) => i !== interest),
    });
  };

  const isValid = data.audience_age && data.audience_interests.length > 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Target Audience</h2>
      <p className="text-gray-600 mb-6">
        Define your target audience to help NEXUS create relevant and engaging content.
      </p>

      <div className="space-y-6">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Primary Age Range
          </label>
          <div className="grid grid-cols-3 gap-3">
            {AGE_RANGES.map((age) => (
              <button
                key={age}
                onClick={() => handleAgeChange(age)}
                className={`p-3 border-2 rounded-lg text-center transition-all font-medium ${
                  data.audience_age === age
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Audience Interests
          </label>
          <p className="text-sm text-gray-600 mb-4">
            Select at least one interest, or add custom ones
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {PREDEFINED_INTERESTS.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  data.audience_interests.includes(interest)
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.audience_interests.includes(interest)}
                    onChange={() => handleInterestToggle(interest)}
                    className="mr-2 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-900">{interest}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Interest */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomInterest()}
              placeholder="Add custom interest..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={handleAddCustomInterest}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
            >
              Add
            </button>
          </div>

          {/* Selected Interests */}
          {data.audience_interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.audience_interests.map((interest) => (
                <div
                  key={interest}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="font-bold hover:text-blue-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Understanding your audience helps NEXUS generate content that resonates and drives engagement.
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
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Step4AudienceConfig;
