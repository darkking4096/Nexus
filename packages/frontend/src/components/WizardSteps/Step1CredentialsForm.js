import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Step1CredentialsForm = ({ data, onChange, onNext }) => {
    const handleUsernameChange = (e) => {
        onChange({ instagram_username: e.target.value });
    };
    const handlePasswordChange = (e) => {
        onChange({ instagram_password: e.target.value });
    };
    const isValid = data.instagram_username && data.instagram_password;
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Instagram Credentials" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Enter your Instagram username and password. We'll connect securely and encrypt your credentials." }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Instagram Username" }), _jsx("input", { type: "text", value: data.instagram_username, onChange: handleUsernameChange, placeholder: "your_username", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Instagram Password" }), _jsx("input", { type: "password", value: data.instagram_password, onChange: handlePasswordChange, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" })] }), _jsx("div", { className: "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Security:" }), " Your credentials are encrypted with AES-256 and never stored in plain text."] }) })] }), _jsx("button", { onClick: onNext, disabled: !isValid, className: "w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Validate Account" })] }));
};
export default Step1CredentialsForm;
//# sourceMappingURL=Step1CredentialsForm.js.map