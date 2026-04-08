import React, { useState } from 'react';

interface GoalsEditorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const GoalsEditor: React.FC<GoalsEditorProps> = ({ value, onChange }) => {
  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      onChange([...value, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="goals-editor">
      <label htmlFor="goals">
        <strong>Goals</strong>
        <span className="required">*</span>
      </label>
      <p className="form-text text-muted">
        Add goals for your profile content strategy.
      </p>

      <div className="goals-input-group">
        <input
          id="goals"
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddGoal();
            }
          }}
          placeholder="Add a goal (e.g., Increase engagement) and press Enter"
          className="form-control"
        />
        <button type="button" onClick={handleAddGoal} className="btn btn-secondary">
          Add Goal
        </button>
      </div>

      {value.length > 0 && (
        <div className="goals-list">
          {value.map((goal, index) => (
            <div key={index} className="goal-item">
              <span>{goal}</span>
              <button
                type="button"
                onClick={() => handleRemoveGoal(index)}
                className="btn-remove"
                aria-label="Remove goal"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && (
        <div className="alert alert-warning">
          <strong>Note:</strong> At least one goal is required.
        </div>
      )}
    </div>
  );
};

export default GoalsEditor;
