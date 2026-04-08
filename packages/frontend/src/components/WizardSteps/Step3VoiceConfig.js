import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Step3VoiceConfig = ({ data, onChange, onNext, onPrev }) => {
    const handleVoiceChange = (e) => {
        onChange({ voice_description: e.target.value });
    };
    const handleToneChange = (tone) => {
        onChange({ tone });
    };
    const isValid = data.voice_description && data.tone;
    const toneOptions = [
        {
            value: 'professional',
            label: 'Professional',
            description: 'Formal, authoritative, business-focused',
        },
        {
            value: 'casual',
            label: 'Casual',
            description: 'Relaxed, conversational, approachable',
        },
        {
            value: 'friendly',
            label: 'Friendly',
            description: 'Warm, personable, engaging',
        },
    ];
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Brand Voice & Tone" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Describe your brand voice and tone. This helps NEXUS generate content that matches your style." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Describe Your Brand Voice" }), _jsx("textarea", { value: data.voice_description, onChange: handleVoiceChange, placeholder: "E.g., We're a fitness brand that educates and motivates. We use inspiring language, share success stories, and focus on health transformation. We're genuine and relatable, avoiding hype...", rows: 5, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" }), _jsxs("p", { className: "mt-2 text-xs text-gray-500", children: [data.voice_description.length, " / 500 characters"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-4", children: "Primary Tone" }), _jsx("div", { className: "space-y-3", children: toneOptions.map((option) => (_jsxs("button", { onClick: () => handleToneChange(option.value), className: `w-full p-4 border-2 rounded-lg text-left transition-all ${data.tone === option.value
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'}`, children: [_jsx("div", { className: "font-medium text-gray-900", children: option.label }), _jsx("div", { className: "text-sm text-gray-600", children: option.description })] }, option.value))) })] }), _jsx("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " The more specific your voice description, the better NEXUS can match your brand style in generated content."] }) })] }), _jsxs("div", { className: "flex gap-4 justify-between mt-8", children: [_jsx("button", { onClick: onPrev, className: "flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium", children: "\u2190 Previous" }), _jsx("button", { onClick: onNext, disabled: !isValid, className: "flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Next \u2192" })] })] }));
};
export default Step3VoiceConfig;
//# sourceMappingURL=Step3VoiceConfig.js.map