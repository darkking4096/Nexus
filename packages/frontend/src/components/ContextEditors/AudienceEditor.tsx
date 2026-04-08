import React, { useState } from 'react';

interface AudienceEditorProps {
  value: {
    age?: string;
    interests?: string[];
    [key: string]: unknown;
  };
  onChange: (value: Record<string, unknown>) => void;
}

export const AudienceEditor: React.FC<AudienceEditorProps> = ({ value, onChange }) => {
  const [newInterest, setNewInterest] = useState('');

  const handleAddInterest = () => {
    if (newInterest.trim()) {
      const interests = value.interests || [];
      onChange({
        ...value,
        interests: [...interests, newInterest.trim()],
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (index: number) => {
    const interests = (value.interests || []).filter((_, i) => i !== index);
    onChange({
      ...value,
      interests,
    });
  };

  return (
    <div className="audience-editor">
      <label>
        <strong>Target Audience</strong>
        <span className="required">*</span>
      </label>

      <div className="form-group">
        <label htmlFor="age">Age Range</label>
        <input
          id="age"
          type="text"
          value={value.age || ''}
          onChange={(e) => onChange({ ...value, age: e.target.value })}
          placeholder="e.g., 18-35"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="interests">Interests</label>
        <div className="interests-input-group">
          <input
            id="interests"
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddInterest();
              }
            }}
            placeholder="Add an interest and press Enter"
            className="form-control"
          />
          <button type="button" onClick={handleAddInterest} className="btn btn-secondary">
            Add
          </button>
        </div>

        {(value.interests || []).length > 0 && (
          <div className="interests-list">
            {value.interests?.map((interest, index) => (
              <span key={index} className="badge">
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className="btn-close"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudienceEditor;
