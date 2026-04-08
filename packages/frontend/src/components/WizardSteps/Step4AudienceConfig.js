import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const PREDEFINED_INTERESTS = [
    'Technology',
    'Fitness & Health',
    'Fashion & Beauty',
    'Travel',
    'Food & Cooking',
    'Business & Entrepreneurship',
    'Education',
    'Entertainment',
    'Lifestyle',
    'Personal Development',
    'Sports',
    'Art & Design',
];
const AGE_RANGES = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const Step4AudienceConfig = ({ data, onChange, onNext, onPrev }) => {
    const [customInterest, setCustomInterest] = useState('');
    const handleAgeChange = (age) => {
        onChange({ audience_age: age });
    };
    const handleInterestToggle = (interest) => {
        const updated = data.audience_interests.includes(interest)
            ? data.audience_interests.filter((i) => i !== interest)
            : [...data.audience_interests, interest];
        onChange({ audience_interests: updated });
    };
    const handleAddCustomInterest = () => {
        if (customInterest.trim() && !data.audience_interests.includes(customInterest)) {
            onChange({ audience_interests: [...data.audience_interests, customInterest] });
            setCustomInterest('');
        }
    };
    const handleRemoveInterest = (interest) => {
        onChange({
            audience_interests: data.audience_interests.filter((i) => i !== interest),
        });
    };
    const isValid = data.audience_age && data.audience_interests.length > 0;
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Target Audience" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Define your target audience to help NEXUS create relevant and engaging content." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-4", children: "Primary Age Range" }), _jsx("div", { className: "grid grid-cols-3 gap-3", children: AGE_RANGES.map((age) => (_jsx("button", { onClick: () => handleAgeChange(age), className: `p-3 border-2 rounded-lg text-center transition-all font-medium ${data.audience_age === age
                                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                                        : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'}`, children: age }, age))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-4", children: "Audience Interests" }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Select at least one interest, or add custom ones" }), _jsx("div", { className: "grid grid-cols-2 gap-3 mb-4", children: PREDEFINED_INTERESTS.map((interest) => (_jsx("button", { onClick: () => handleInterestToggle(interest), className: `p-3 border-2 rounded-lg text-left transition-all ${data.audience_interests.includes(interest)
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'}`, children: _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: data.audience_interests.includes(interest), onChange: () => handleInterestToggle(interest), className: "mr-2 w-4 h-4" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: interest })] }) }, interest))) }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx("input", { type: "text", value: customInterest, onChange: (e) => setCustomInterest(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleAddCustomInterest(), placeholder: "Add custom interest...", className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm" }), _jsx("button", { onClick: handleAddCustomInterest, className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm", children: "Add" })] }), data.audience_interests.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2", children: data.audience_interests.map((interest) => (_jsxs("div", { className: "bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm", children: [interest, _jsx("button", { onClick: () => handleRemoveInterest(interest), className: "font-bold hover:text-blue-600", children: "\u00D7" })] }, interest))) }))] }), _jsx("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Tip:" }), " Understanding your audience helps NEXUS generate content that resonates and drives engagement."] }) })] }), _jsxs("div", { className: "flex gap-4 justify-between mt-8", children: [_jsx("button", { onClick: onPrev, className: "flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium", children: "\u2190 Previous" }), _jsx("button", { onClick: onNext, disabled: !isValid, className: "flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Next \u2192" })] })] }));
};
export default Step4AudienceConfig;
//# sourceMappingURL=Step4AudienceConfig.js.map