import React, { useState, useEffect } from 'react';

export interface EditCaptionFormProps {
  initialCaption: string;
  onSave: (caption: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EditCaptionForm: React.FC<EditCaptionFormProps> = ({
  initialCaption,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [caption, setCaption] = useState(initialCaption);
  const [isTouched, setIsTouched] = useState(false);

  useEffect(() => {
    setCaption(initialCaption);
    setIsTouched(false);
  }, [initialCaption]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
    setIsTouched(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (caption.trim()) {
      onSave(caption);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (caption.trim()) {
        onSave(caption);
      }
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const characterCount = caption.length;
  const maxCharacters = 2200;
  const isValid = caption.trim().length > 0 && characterCount <= maxCharacters;
  const isChanged = caption !== initialCaption;

  return (
    <form
      onSubmit={handleSave}
      className="border border-blue-300 rounded-lg p-4 sm:p-6 bg-blue-50"
      data-testid="edit-caption-form"
      aria-label="Edit caption form"
    >
      {/* Label */}
      <label
        htmlFor="caption-textarea"
        className="block text-sm font-semibold text-gray-900 mb-2"
      >
        Edit Caption
      </label>

      {/* Textarea */}
      <textarea
        id="caption-textarea"
        value={caption}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        className="w-full p-3 border border-gray-300 rounded font-sans text-sm sm:text-base resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        rows={6}
        placeholder="Enter caption text (max 2200 characters)"
        aria-label="Caption text area"
        aria-describedby="character-count"
        maxLength={maxCharacters}
        data-testid="caption-textarea"
      />

      {/* Character Count */}
      <div
        id="character-count"
        className={`text-xs sm:text-sm mt-2 ${
          characterCount > maxCharacters * 0.9
            ? 'text-red-600 font-medium'
            : 'text-gray-500'
        }`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {characterCount} / {maxCharacters} characters
      </div>

      {/* Validation Message */}
      {!isValid && isTouched && caption.trim() === '' && (
        <p className="text-red-600 text-xs sm:text-sm mt-2" role="alert">
          Caption cannot be empty
        </p>
      )}

      {characterCount > maxCharacters && (
        <p className="text-red-600 text-xs sm:text-sm mt-2" role="alert">
          Caption exceeds maximum length
        </p>
      )}

      {/* Help Text */}
      <p className="text-gray-600 text-xs sm:text-sm mt-3">
        Press <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl</kbd> +{' '}
        <kbd className="px-2 py-1 bg-gray-200 rounded">Enter</kbd> to save, or{' '}
        <kbd className="px-2 py-1 bg-gray-200 rounded">Esc</kbd> to cancel
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
        <button
          type="submit"
          disabled={!isValid || isLoading || !isChanged}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Save caption changes"
          data-testid="save-button"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded font-medium hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
          aria-label="Cancel editing"
          data-testid="cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditCaptionForm;
