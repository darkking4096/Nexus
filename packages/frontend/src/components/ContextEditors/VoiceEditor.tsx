import React from 'react';

interface VoiceEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const VoiceEditor: React.FC<VoiceEditorProps> = ({ value, onChange }) => {
  return (
    <div className="voice-editor">
      <label htmlFor="voice">
        <strong>Voice Description</strong>
        <span className="required">*</span>
      </label>
      <textarea
        id="voice"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your brand voice. Ex: Inspiring, professional, conversational, etc."
        rows={4}
        className="form-control"
      />
      <small className="form-text text-muted">
        Describe the tone, personality, and style of communication for your brand.
      </small>
    </div>
  );
};

export default VoiceEditor;
