import React from 'react';

export interface PreviewPanelProps {
  imageUrl?: string;
  caption: string;
  alt?: string;
  mediaType?: 'image' | 'video' | 'carousel';
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  imageUrl,
  caption,
  alt = 'Preview content',
  mediaType = 'image',
}) => {
  return (
    <section
      className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm"
      aria-label="Preview panel - how content will appear when published"
      data-testid="preview-panel"
    >
      {/* Media Preview */}
      {imageUrl && (
        <div className="relative bg-gray-100 w-full aspect-square sm:aspect-video overflow-hidden">
          {mediaType === 'image' && (
            <img
              src={imageUrl}
              alt={alt}
              className="w-full h-full object-cover"
              aria-label="Preview image"
            />
          )}

          {mediaType === 'video' && (
            <video
              src={imageUrl}
              controls
              className="w-full h-full object-cover"
              aria-label="Preview video"
            />
          )}

          {mediaType === 'carousel' && (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span className="text-center">
                <p className="text-sm sm:text-base">Carousel Preview</p>
                <p className="text-xs mt-1">{imageUrl}</p>
              </span>
            </div>
          )}

          {/* Media Type Badge */}
          <div
            className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded"
            aria-label={`Media type: ${mediaType}`}
          >
            {mediaType}
          </div>
        </div>
      )}

      {/* Caption Preview */}
      <div className="p-4 sm:p-6 border-t border-gray-200">
        <div
          className="text-sm text-gray-600 mb-3"
          id="preview-caption-label"
        >
          Caption preview:
        </div>

        <p
          className="text-gray-900 text-sm sm:text-base whitespace-pre-wrap break-words"
          role="region"
          aria-labelledby="preview-caption-label"
          aria-label="Caption preview"
          data-testid="caption-preview"
        >
          {caption || (
            <span className="italic text-gray-400">No caption provided</span>
          )}
        </p>

        {/* Character Count */}
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <span aria-label={`Caption length: ${caption.length} characters`}>
            {caption.length} characters
          </span>
        </div>
      </div>

      {/* Footer - Publish Info */}
      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <p>
          This is how your content will appear when published to Instagram.
        </p>
      </div>
    </section>
  );
};

export default PreviewPanel;
