import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import Step1CredentialsForm from '../components/WizardSteps/Step1CredentialsForm';
import Step2ValidationPanel from '../components/WizardSteps/Step2ValidationPanel';
import Step3VoiceConfig from '../components/WizardSteps/Step3VoiceConfig';
import Step4AudienceConfig from '../components/WizardSteps/Step4AudienceConfig';
import Step5GoalsConfig from '../components/WizardSteps/Step5GoalsConfig';
const INITIAL_STATE = {
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
export const ProfileWizard = () => {
    const { token } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [state, setState] = useState(INITIAL_STATE);
    const [error, setError] = useState(null);
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
    const handleStateChange = (updates) => {
        setState((prev) => ({ ...prev, ...updates }));
        setError(null);
    };
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);
            await axios.post('/api/profiles/create', {
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
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccess(true);
            // Reset form after success
            setTimeout(() => {
                setState(INITIAL_STATE);
                setCurrentStep(1);
                setSuccess(false);
            }, 2000);
        }
        catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.error || err.message
                : 'Unknown error';
            setError(message);
        }
        finally {
            setLoading(false);
        }
    };
    const canProceedToNext = () => {
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
    return (_jsx("div", { className: "min-h-screen bg-gray-100 py-12 px-4", children: _jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Profile Setup Wizard" }), _jsx("p", { className: "text-gray-600", children: "Connect your Instagram account and configure your brand voice" })] }), _jsxs("div", { className: "mb-8", children: [_jsx("div", { className: "flex justify-between mb-2", children: [1, 2, 3, 4, 5].map((step) => (_jsx("div", { className: `flex-1 mx-1 h-2 rounded-full ${step <= currentStep ? 'bg-blue-600' : 'bg-gray-300'}` }, step))) }), _jsxs("p", { className: "text-sm text-gray-600 text-center", children: ["Step ", currentStep, " of 5"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 mb-8", children: [error && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-red-800 text-sm", children: error }) })), success && (_jsx("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg", children: _jsx("p", { className: "text-green-800 text-sm", children: "Profile created successfully! Redirecting..." }) })), currentStep === 1 && (_jsx(Step1CredentialsForm, { data: state, onChange: handleStateChange, onNext: handleNext })), currentStep === 2 && (_jsx(Step2ValidationPanel, { data: state, onChange: handleStateChange, onNext: handleNext, onPrev: handlePrev })), currentStep === 3 && (_jsx(Step3VoiceConfig, { data: state, onChange: handleStateChange, onNext: handleNext, onPrev: handlePrev })), currentStep === 4 && (_jsx(Step4AudienceConfig, { data: state, onChange: handleStateChange, onNext: handleNext, onPrev: handlePrev })), currentStep === 5 && (_jsx(Step5GoalsConfig, { data: state, onChange: handleStateChange, onPrev: handlePrev }))] }), currentStep < 5 && (_jsxs("div", { className: "flex gap-4 justify-between", children: [_jsx("button", { onClick: handlePrev, disabled: currentStep === 1, className: "px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u2190 Previous" }), _jsx("button", { onClick: handleNext, disabled: !canProceedToNext(), className: "px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: "Next \u2192" })] })), currentStep === 5 && (_jsxs("div", { className: "flex gap-4 justify-between", children: [_jsx("button", { onClick: handlePrev, className: "px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50", children: "\u2190 Previous" }), _jsx("button", { onClick: handleSubmit, disabled: !canProceedToNext() || loading, className: "px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Creating...' : 'Create Profile' })] }))] }) }));
};
//# sourceMappingURL=ProfileWizard.js.map