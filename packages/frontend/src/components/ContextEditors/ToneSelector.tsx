import React from 'react';

interface ToneSelectorProps {
  value: 'professional' | 'casual' | 'friendly';
  onChange: (value: 'professional' | 'casual' | 'friendly') => void;
}

const TONE_OPTIONS: Array<{
  value: 'professional' | 'casual' | 'friendly';
  label: string;
  description: string;
}> = [
  {
    value: 'professional',
    label: 'Professional',
    description: 'Formal, authoritative, business-focused',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Relaxed, informal, friendly conversation',
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm, approachable, personable',
  },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="tone-selector">
      <label>
        <strong>Tone</strong>
        <span className="required">*</span>
      </label>
      <div className="tone-options">
        {TONE_OPTIONS.map((option) => (
          <label key={option.value} className="tone-option">
            <input
              type="radio"
              name="tone"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value as typeof value)}
            />
            <div className="option-content">
              <strong>{option.label}</strong>
              <p>{option.description}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ToneSelector;
