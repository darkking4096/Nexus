import React from 'react';
import { Button } from '../atoms/Button';
import { ProgressBar } from '../molecules/ProgressBar';
import { Header } from './Header';
import { cn } from '../../utils/cn';

export interface StepContainerProps {
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
  nextLabel?: string;
  backLabel?: string;
  showSkip?: boolean;
  className?: string;
}

export const StepContainer = React.forwardRef<HTMLDivElement, StepContainerProps>(
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
      nextLabel = 'Next',
      backLabel = 'Back',
      showSkip = true,
      className,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('min-h-screen bg-background-primary flex flex-col', className)}>
        <Header />

        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-border bg-background-secondary">
            <ProgressBar current={step} total={totalSteps} showLabel={false} />
          </div>

          <main className="flex-1 flex flex-col p-6 md:p-12">
            {/* Header Section */}
            <div className="mb-8">
              {icon && <div className="text-4xl mb-4">{icon}</div>}
              <h1 className="text-3xl font-bold text-text-primary mb-2">{title}</h1>
              {subtitle && <p className="text-lg text-text-secondary">{subtitle}</p>}
            </div>

            {/* Content Section */}
            <div className="flex-1 mb-8">{children}</div>

            {/* Footer Section */}
            <div className="border-t border-border pt-8 mt-8">
              <div className="flex justify-between items-center gap-4 mb-4">
                <Button
                  variant="secondary"
                  onClick={onBack}
                  disabled={step === 1}
                  className="min-w-32"
                >
                  ◄ {backLabel}
                </Button>

                <div className="flex-1 flex justify-between items-center px-4">
                  <span className="text-sm text-text-secondary font-medium">
                    {step} of {totalSteps}
                  </span>
                </div>

                <Button
                  variant="primary"
                  onClick={onNext}
                  disabled={isNextDisabled}
                  loading={isNextLoading}
                  className="min-w-32"
                >
                  {nextLabel} ▶
                </Button>
              </div>

              {showSkip && onSkip && (
                <div className="flex justify-center">
                  <button
                    onClick={onSkip}
                    className="text-sm text-primary hover:text-primary-dark hover:underline transition-colors"
                  >
                    Skip remaining steps
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }
);

StepContainer.displayName = 'StepContainer';
