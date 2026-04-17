import React from 'react';
import { StepContainer } from '../organisms/StepContainer';

export interface TutorialStepProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  showSkip?: boolean;
}

/**
 * Wrapper around StepContainer for the onboarding flow.
 * Provides a reusable component for each step (1-5) of the tutorial.
 */
export const TutorialStep = React.forwardRef<HTMLDivElement, TutorialStepProps>(
  (
    {
      step,
      totalSteps,
      title,
      subtitle,
      icon,
      onNext,
      onBack,
      onSkip,
      children,
      isNextDisabled = false,
      isNextLoading = false,
      showSkip = true,
    },
    ref
  ) => {
    return (
      <StepContainer
        ref={ref}
        step={step}
        totalSteps={totalSteps}
        title={title}
        subtitle={subtitle}
        icon={icon}
        onNext={onNext}
        onBack={onBack}
        onSkip={onSkip}
        isNextDisabled={isNextDisabled}
        isNextLoading={isNextLoading}
        nextLabel={step === totalSteps ? 'Complete' : 'Next'}
        showSkip={showSkip}
      >
        {children}
      </StepContainer>
    );
  }
);

TutorialStep.displayName = 'TutorialStep';
