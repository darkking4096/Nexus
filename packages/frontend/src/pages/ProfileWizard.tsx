import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Step1CredentialsForm from '../components/WizardSteps/Step1CredentialsForm';
import Step2ValidationPanel from '../components/WizardSteps/Step2ValidationPanel';
import Step3VoiceConfig from '../components/WizardSteps/Step3VoiceConfig';
import Step4AudienceConfig from '../components/WizardSteps/Step4AudienceConfig';
import Step5GoalsConfig from '../components/WizardSteps/Step5GoalsConfig';

export interface WizardState {
  // Step 1
  instagram_username: string;
  instagram_password: string;
  // Step 2
  display_name: string;
  account_validated: boolean;
  // Step 3
  voice_description: string;
  tone: 'professional' | 'casual' | 'friendly';
  // Step 4
  audience_age: string;
  audience_interests: string[];
  // Step 5
  goals: string[];
}

const INITIAL_STATE: WizardState = {
  instagram_username: '',
  instagram_password: '',
  display_name: '',
  account_validated: false,
  voice_description: '',
  tone: 'professional',
  audience_age: '',
  audience_interests: [],
  goals: [],
};

export const ProfileWizard: React.FC = () => {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNext = () => {
    if (currentStep < 5) {
      setError(null);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStateChange = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        '/api/profiles/create',
        {
          instagram_username: state.instagram_username,
          instagram_password: state.instagram_password,
          display_name: state.display_name,
          voice_description: state.voice_description,
          tone: state.tone,
          audience: {
            age: state.audience_age,
            interests: state.audience_interests,
          },
          goals: state.goals,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      // Reset form after success
      setTimeout(() => {
        setState(INITIAL_STATE);
        setCurrentStep(1);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Unknown error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(state.instagram_username && state.instagram_password);
      case 2:
        return state.account_validated && !!state.display_name;
      case 3:
        return !!(state.voice_description && state.tone);
      case 4:
        return !!(state.audience_age && state.audience_interests.length > 0);
      case 5:
        return state.goals.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup Wizard</h1>
          <p className="text-gray-600">Connect your Instagram account and configure your brand voice</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex-1 mx-1 h-2 rounded-full ${
                  step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Step {currentStep} of 5
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">Profile created successfully! Redirecting...</p>
            </div>
          )}

          {/* Steps */}
          {currentStep === 1 && (
            <Step1CredentialsForm
              data={state}
              onChange={handleStateChange}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <Step2ValidationPanel
              data={state}
              onChange={handleStateChange}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
          {currentStep === 3 && (
            <Step3VoiceConfig
              data={state}
              onChange={handleStateChange}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
          {currentStep === 4 && (
            <Step4AudienceConfig
              data={state}
              onChange={handleStateChange}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
          {currentStep === 5 && (
            <Step5GoalsConfig
              data={state}
              onChange={handleStateChange}
              onPrev={handlePrev}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        )}

        {currentStep === 5 && (
          <div className="flex gap-4 justify-between">
            <button
              onClick={handlePrev}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canProceedToNext() || loading}
              className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
