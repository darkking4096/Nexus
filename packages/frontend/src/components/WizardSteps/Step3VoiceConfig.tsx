import React from 'react';
import type { WizardState } from '../../pages/ProfileWizard';

interface Props {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const Step3VoiceConfig: React.FC<Props> = ({ data, onChange, onNext, onPrev }) => {
  const handleVoiceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ voice_description: e.target.value });
  };

  const handleToneChange = (tone: 'professional' | 'casual' | 'friendly') => {
    onChange({ tone });
  };

  const isValid = data.voice_description && data.tone;

  const toneOptions = [
    {
      value: 'professional' as const,
      label: 'Professional',
      description: 'Formal, authoritative, business-focused',
    },
    {
      value: 'casual' as const,
      label: 'Casual',
      description: 'Relaxed, conversational, approachable',
    },
    {
      value: 'friendly' as const,
      label: 'Friendly',
      description: 'Warm, personable, engaging',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Brand Voice & Tone</h2>
      <p className="text-gray-600 mb-6">
        Describe your brand voice and tone. This helps NEXUS generate content that matches your style.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe Your Brand Voice
          </label>
          <textarea
            value={data.voice_description}
            onChange={handleVoiceChange}
            placeholder="E.g., We're a fitness brand that educates and motivates. We use inspiring language, share success stories, and focus on health transformation. We're genuine and relatable, avoiding hype..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <p className="mt-2 text-xs text-gray-500">
            {data.voice_description.length} / 500 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Primary Tone
          </label>
          <div className="space-y-3">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleToneChange(option.value)}
                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                  data.tone === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> The more specific your voice description, the better NEXUS can match your brand style in generated content.
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

export default Step3VoiceConfig;
