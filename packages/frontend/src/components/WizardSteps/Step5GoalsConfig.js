import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const PREDEFINED_GOALS = [
    'Increase followers',
    'Boost engagement (likes/comments)',
    'Drive traffic to website',
    'Generate sales',
    'Build brand awareness',
    'Establish thought leadership',
    'Community building',
    'Content consistency',
];
const Step5GoalsConfig = ({ data, onChange, onPrev }) => {
    const [customGoal, setCustomGoal] = useState('');
    const handleGoalToggle = (goal) => {
        const updated = data.goals.includes(goal)
            ? data.goals.filter((g) => g !== goal)
            : [...data.goals, goal];
        onChange({ goals: updated });
    };
    const handleAddCustomGoal = () => {
        if (customGoal.trim() && !data.goals.includes(customGoal)) {
            onChange({ goals: [...data.goals, customGoal] });
            setCustomGoal('');
        }
    };
    const handleRemoveGoal = (goal) => {
        onChange({
            goals: data.goals.filter((g) => g !== goal),
        });
    };
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Goals & KPIs" }), _jsx("p", { className: "text-gray-600 mb-6", children: "What are your main goals for this Instagram account? Select at least one to help NEXUS optimize content for your objectives." }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-4", children: "Primary Goals" }), _jsx("div", { className: "space-y-3", children: PREDEFINED_GOALS.map((goal) => (_jsxs("button", { onClick: () => handleGoalToggle(goal), className: `w-full p-4 border-2 rounded-lg text-left transition-all flex items-center ${data.goals.includes(goal)
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 bg-white hover:border-gray-400'}`, children: [_jsx("input", { type: "checkbox", checked: data.goals.includes(goal), onChange: () => handleGoalToggle(goal), className: "mr-3 w-4 h-4 cursor-pointer" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: goal })] }, goal))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Add Custom Goal" }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx("input", { type: "text", value: customGoal, onChange: (e) => setCustomGoal(e.target.value), onKeyPress: (e) => e.key === 'Enter' && handleAddCustomGoal(), placeholder: "E.g., Launch new product line...", className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" }), _jsx("button", { onClick: handleAddCustomGoal, className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium", children: "Add" })] })] }), data.goals.length > 0 && (_jsxs("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: [_jsx("p", { className: "text-sm font-medium text-green-900 mb-3", children: "Selected Goals:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: data.goals.map((goal) => (_jsxs("div", { className: "bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm", children: [goal, _jsx("button", { onClick: () => handleRemoveGoal(goal), className: "font-bold hover:text-green-600", children: "\u00D7" })] }, goal))) })] })), _jsx("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Insight:" }), " Having clear goals helps NEXUS create a content strategy that drives measurable results. You can track these KPIs in your analytics dashboard."] }) }), _jsxs("div", { className: "p-6 bg-gray-50 border border-gray-200 rounded-lg", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Profile Summary" }), _jsx("dl", { className: "space-y-3 text-sm", children: _jsxs("div", { children: [_jsxs("dt", { className: "font-medium text-gray-700", children: ["Goals (", data.goals.length, "):"] }), _jsx("dd", { className: "text-gray-600 ml-4 mt-1", children: data.goals.length > 0 ? data.goals.join(', ') : 'Not selected' })] }) }), _jsx("p", { className: "mt-4 text-xs text-gray-500", children: "After you submit, your profile will be created and you'll be able to start generating content!" })] })] }), _jsx("div", { className: "flex gap-4 justify-between mt-8", children: _jsx("button", { onClick: onPrev, className: "flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium", children: "\u2190 Previous" }) })] }));
};
export default Step5GoalsConfig;
//# sourceMappingURL=Step5GoalsConfig.js.map