import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewPanel } from '../PreviewPanel';

describe('PreviewPanel', () => {
  it('renders the preview panel component', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
      />
    );

    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
  });

  it('displays image when imageUrl is provided', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
        alt="Test image"
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('displays media type badge for image', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
        mediaType="image"
      />
    );

    expect(screen.getByText('image')).toBeInTheDocument();
  });

  it('displays media type badge for video', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/video.mp4"
        caption="Test caption"
        mediaType="video"
      />
    );

    expect(screen.getByText('video')).toBeInTheDocument();
  });

  it('displays media type badge for carousel', () => {
    render(
      <PreviewPanel
        imageUrl="carousel-id"
        caption="Test caption"
        mediaType="carousel"
      />
    );

    expect(screen.getByText('carousel')).toBeInTheDocument();
  });

  it('displays caption text correctly', () => {
    const testCaption = 'This is a test caption';
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption={testCaption}
      />
    );

    expect(screen.getByText(testCaption)).toBeInTheDocument();
  });

  it('displays fallback message when caption is empty', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption=""
      />
    );

    expect(screen.getByText('No caption provided')).toBeInTheDocument();
  });

  it('displays character count for caption', () => {
    const testCaption = 'Test';
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption={testCaption}
      />
    );

    expect(screen.getByText('4 characters')).toBeInTheDocument();
  });

  it('displays character count for long caption', () => {
    const longCaption = 'a'.repeat(150);
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption={longCaption}
      />
    );

    expect(screen.getByText('150 characters')).toBeInTheDocument();
  });

  it('renders without image when imageUrl is not provided', () => {
    render(
      <PreviewPanel
        caption="Test caption without image"
      />
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Test caption without image')).toBeInTheDocument();
  });

  it('uses default alt text when not provided', () => {
    const { container } = render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
      />
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', 'Preview content');
  });

  it('displays publish info footer', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
      />
    );

    expect(screen.getByText(/This is how your content will appear when published to Instagram/)).toBeInTheDocument();
  });

  it('has proper accessibility attributes for preview region', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
      />
    );

    const captionPreview = screen.getByTestId('caption-preview');
    expect(captionPreview).toHaveAttribute('role', 'region');
    expect(captionPreview).toHaveAttribute('aria-label');
  });

  it('has proper accessibility attributes for section', () => {
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption="Test caption"
      />
    );

    const section = screen.getByTestId('preview-panel');
    expect(section).toHaveAttribute('aria-label');
  });

  it('handles multiline captions correctly', () => {
    const multilineCaption = 'Line 1\nLine 2\nLine 3';
    render(
      <PreviewPanel
        imageUrl="https://example.com/image.jpg"
        caption={multilineCaption}
      />
    );

    const captionElement = screen.getByTestId('caption-preview');
    expect(captionElement).toHaveTextContent('Line 1');
    expect(captionElement).toHaveTextContent('Line 2');
    expect(captionElement).toHaveTextContent('Line 3');
  });

  it('displays carousel preview text when mediaType is carousel without video player', () => {
    render(
      <PreviewPanel
        imageUrl="carousel-id-123"
        caption="Test caption"
        mediaType="carousel"
      />
    );

    expect(screen.getByText('Carousel Preview')).toBeInTheDocument();
    expect(screen.queryByRole('video')).not.toBeInTheDocument();
  });
});
