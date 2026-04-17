import React from 'react';
import { useOnboardingContext } from '../../context/OnboardingContext';
import { WelcomeScreen } from './WelcomeScreen';
import { TutorialStep } from './TutorialStep';
import { ProfileSetupForm } from './ProfileSetupForm';
import { InstagramConnectFlow } from './InstagramConnectFlow';

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

/**
 * Main onboarding flow orchestrator
 * Manages step progression and renders appropriate screen
 *
 * Flow:
 * - Welcome → Step 1 (Profile) → Step 2 (Instagram) → Step 3 (Post) → Step 4 (Publish) → Step 5 (Analytics) → Complete
 */
export const OnboardingFlow = React.forwardRef<HTMLDivElement, OnboardingFlowProps>(
  ({ onComplete, onSkip }, ref) => {
    const { data, updateProfileData, setInstagramConnected, nextStep, prevStep, goToStep, completeOnboarding } =
      useOnboardingContext();

    const [showWelcome, setShowWelcome] = React.useState(!data.currentStep || data.currentStep === 0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleStartTutorial = () => {
      setShowWelcome(false);
      goToStep(1);
    };

    const handleSkip = async () => {
      try {
        setIsLoading(true);
        // Mark onboarding as completed but not all steps finished
        await completeOnboarding();
        onSkip?.();
      } catch (error) {
        console.error('Error skipping onboarding:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleNext = async () => {
      // Validate current step before progressing
      const currentStepErrors = validateStep(data.currentStep);
      if (Object.keys(currentStepErrors).length > 0) {
        setErrors(currentStepErrors);
        return;
      }

      if (data.currentStep === 5) {
        try {
          setIsLoading(true);
          await completeOnboarding();
          onComplete?.();
        } catch (error) {
          console.error('Error completing onboarding:', error);
          setErrors({ submit: 'Failed to complete onboarding. Please try again.' });
        } finally {
          setIsLoading(false);
        }
      } else {
        nextStep();
      }
    };

    const validateStep = (step: number): Record<string, string> => {
      const newErrors: Record<string, string> = {};

      switch (step) {
        case 1:
          if (!data.profileData.name || data.profileData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
          }
          if (!data.profileData.bio || data.profileData.bio.length < 5) {
            newErrors.bio = 'Bio must be at least 5 characters';
          }
          break;
        case 2:
          if (!data.instagramConnected) {
            newErrors.instagram = 'Please connect your Instagram account';
          }
          break;
      }

      return newErrors;
    };

    if (showWelcome) {
      return (
        <WelcomeScreen
          onStartTutorial={handleStartTutorial}
          onSkip={handleSkip}
          showSkip={true}
        />
      );
    }

    return (
      <div ref={ref}>
        {data.currentStep === 1 && (
          <TutorialStep
            step={1}
            totalSteps={5}
            title="Create Your Profile"
            subtitle="Let's start by setting up your profile"
            icon="👤"
            onNext={handleNext}
            onBack={prevStep}
            onSkip={handleSkip}
            isNextDisabled={!data.profileData.name || !data.profileData.bio}
            isNextLoading={isLoading}
          >
            <ProfileSetupForm
              data={data.profileData}
              onChange={updateProfileData}
              errors={errors}
              loading={isLoading}
            />
          </TutorialStep>
        )}

        {data.currentStep === 2 && (
          <TutorialStep
            step={2}
            totalSteps={5}
            title="Connect Your Instagram"
            subtitle="Securely connect your Instagram account"
            icon="📱"
            onNext={handleNext}
            onBack={prevStep}
            onSkip={handleSkip}
            isNextDisabled={!data.instagramConnected}
            isNextLoading={isLoading}
          >
            <InstagramConnectFlow
              isConnected={data.instagramConnected}
              instagramHandle={data.instagramHandle}
              onConnect={() => {
                // Mock OAuth connection
                setInstagramConnected('john_doe', true);
              }}
              loading={isLoading}
            />
          </TutorialStep>
        )}

        {data.currentStep === 3 && (
          <TutorialStep
            step={3}
            totalSteps={5}
            title="Generate Your First Post"
            subtitle="Create content using AI-powered templates"
            icon="✨"
            onNext={handleNext}
            onBack={prevStep}
            onSkip={handleSkip}
            isNextLoading={isLoading}
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <p className="text-text-primary font-medium mb-4">Post Template Preview</p>
              <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="font-semibold text-lg mb-2">Sample Post Title</h3>
                <p className="text-text-secondary mb-4">This is a preview of your generated post</p>
                <div className="flex gap-2 justify-center text-sm">
                  <span className="bg-primary text-white px-3 py-1 rounded-full">#content</span>
                  <span className="bg-primary text-white px-3 py-1 rounded-full">#marketing</span>
                </div>
              </div>
            </div>
          </TutorialStep>
        )}

        {data.currentStep === 4 && (
          <TutorialStep
            step={4}
            totalSteps={5}
            title="Publish & Share"
            subtitle="Your post is ready to share with your audience"
            icon="🚀"
            onNext={handleNext}
            onBack={prevStep}
            onSkip={handleSkip}
            isNextLoading={isLoading}
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">Ready to Publish!</h3>
              <p className="text-text-secondary mb-6">Your post has been created and is ready to share</p>
              <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                <p className="text-sm text-text-secondary mb-4">
                  You can publish now or schedule for later
                </p>
                <div className="text-2xl">📅 Publishing is easy!</div>
              </div>
            </div>
          </TutorialStep>
        )}

        {data.currentStep === 5 && (
          <TutorialStep
            step={5}
            totalSteps={5}
            title="View Your Analytics"
            subtitle="Track your performance in real-time"
            icon="📊"
            onNext={handleNext}
            onBack={prevStep}
            isNextDisabled={false}
            isNextLoading={isLoading}
            showSkip={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Impressions', value: '1,234', icon: '👀' },
                { label: 'Likes', value: '567', icon: '❤️' },
                { label: 'Shares', value: '89', icon: '🔄' },
              ].map((metric) => (
                <div key={metric.label} className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="text-3xl mb-2">{metric.icon}</div>
                  <p className="text-sm text-text-secondary mb-2">{metric.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{metric.value}</p>
                </div>
              ))}
            </div>
          </TutorialStep>
        )}
      </div>
    );
  }
);

OnboardingFlow.displayName = 'OnboardingFlow';
