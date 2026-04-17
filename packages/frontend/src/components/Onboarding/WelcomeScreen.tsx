import React from 'react';
import { Button } from '../atoms/Button';

export interface WelcomeScreenProps {
  onStartTutorial: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
}

export const WelcomeScreen = React.forwardRef<HTMLDivElement, WelcomeScreenProps>(
  ({ onStartTutorial, onSkip, showSkip = true }, ref) => {
    return (
      <div
        ref={ref}
        className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-6"
      >
        <div className="max-w-2xl w-full text-center text-white">
          {/* Hero Icon/Image */}
          <div className="mb-8">
            <div className="text-9xl">🚀</div>
          </div>

          {/* Title & Description */}
          <h1 className="text-5xl font-bold mb-4">Welcome to Your Marketing Hub</h1>

          <p className="text-xl text-blue-100 mb-8">
            Create engaging content, manage your Instagram profile, and track your analytics — all in one place.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold mb-2">Create Content</h3>
              <p className="text-sm text-blue-100">Generate posts with AI-powered templates</p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Connect Instagram</h3>
              <p className="text-sm text-blue-100">Seamlessly link your Instagram account</p>
            </div>

            <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold mb-2">Track Analytics</h3>
              <p className="text-sm text-blue-100">Monitor your performance in real-time</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={onStartTutorial}
              className="text-lg font-semibold"
            >
              Start Tutorial
            </Button>

            {showSkip && onSkip && (
              <Button
                size="lg"
                variant="ghost"
                onClick={onSkip}
                className="text-lg font-semibold border-white text-white hover:bg-white/10"
              >
                Skip for now
              </Button>
            )}
          </div>

          {/* Footer Text */}
          <p className="text-blue-100 text-sm mt-8">
            Tutorial takes about 5-10 minutes to complete
          </p>
        </div>
      </div>
    );
  }
);

WelcomeScreen.displayName = 'WelcomeScreen';
