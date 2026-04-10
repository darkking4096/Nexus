import React from 'react';

interface ContextPreviewProps {
  voice: string;
  tone: string;
  audience: Record<string, unknown>;
  goals: string[];
}

export const ContextPreview: React.FC<ContextPreviewProps> = ({
  voice,
  tone,
  audience,
  goals,
}) => {
  const typedAudience = audience as Record<string, string | string[]>;
  const ageValue = typedAudience.age;
  const interestsValue = typedAudience.interests;

  return (
    <div className="context-preview">
      <h3>Context Preview</h3>

      <div className="preview-section">
        <h4>Voice</h4>
        <p>{voice || <em>No voice description provided</em>}</p>
      </div>

      <div className="preview-section">
        <h4>Tone</h4>
        <p>
          <span className="badge">{tone}</span>
        </p>
      </div>

      <div className="preview-section">
        <h4>Target Audience</h4>
        {audience && Object.keys(audience).length > 0 ? (
          <ul>
            {ageValue && (
              <li>
                <strong>Age Range:</strong> {ageValue}
              </li>
            )}
            {Array.isArray(interestsValue) && interestsValue.length > 0 && (
              <li>
                <strong>Interests:</strong> {interestsValue.join(', ')}
              </li>
            )}
          </ul>
        ) : (
          <p>
            <em>No audience information provided</em>
          </p>
        )}
      </div>

      <div className="preview-section">
        <h4>Goals</h4>
        {goals && goals.length > 0 ? (
          <ul>
            {goals.map((goal, index) => (
              <li key={index}>{goal}</li>
            ))}
          </ul>
        ) : (
          <p>
            <em>No goals defined</em>
          </p>
        )}
      </div>
    </div>
  );
};

export default ContextPreview;
