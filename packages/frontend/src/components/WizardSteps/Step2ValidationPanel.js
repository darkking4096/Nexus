import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
const Step2ValidationPanel = ({ data, onChange, onNext, onPrev }) => {
    const { token } = useAuth();
    const [validating, setValidating] = useState(false);
    const [accountInfo, setAccountInfo] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const handleValidateAccount = async () => {
        try {
            setValidating(true);
            setValidationError(null);
            const response = await axios.post('/api/profiles/connect', {
                username: data.instagram_username,
                password: data.instagram_password,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const profile = response.data.profile;
            setAccountInfo({
                username: profile.instagram_username,
                followers_count: profile.followers_count || 0,
                bio: profile.bio || 'No bio',
                profile_picture_url: profile.profile_picture_url || '',
            });
            onChange({ account_validated: true });
        }
        catch (error) {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.error || error.message
                : 'Validation failed';
            setValidationError(message);
            onChange({ account_validated: false });
        }
        finally {
            setValidating(false);
        }
    };
    const handleDisplayNameChange = (e) => {
        onChange({ display_name: e.target.value });
    };
    const isValid = data.account_validated && data.display_name;
    return (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Validate Account" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Let's verify your Instagram account and set your display name in NEXUS." }), validationError && (_jsx("div", { className: "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg", children: _jsx("p", { className: "text-red-800 text-sm", children: validationError }) })), !accountInfo ? (_jsx("div", { className: "space-y-4 mb-6", children: _jsx("button", { onClick: handleValidateAccount, disabled: validating || !data.instagram_username || !data.instagram_password, className: "w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: validating ? 'Validating...' : 'Validate Instagram Account' }) })) : (_jsx("div", { className: "mb-6 p-4 bg-green-50 border border-green-200 rounded-lg", children: _jsxs("div", { className: "flex items-start gap-4", children: [accountInfo.profile_picture_url && (_jsx("img", { src: accountInfo.profile_picture_url, alt: accountInfo.username, className: "w-16 h-16 rounded-full" })), _jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "font-semibold text-gray-900", children: ["@", accountInfo.username] }), _jsxs("p", { className: "text-sm text-gray-600", children: [accountInfo.followers_count.toLocaleString(), " followers"] }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: accountInfo.bio }), _jsx("button", { onClick: handleValidateAccount, className: "mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium", children: "Validate Different Account" })] })] }) })), accountInfo && (_jsxs("div", { className: "space-y-4 mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Display Name in NEXUS" }), _jsx("input", { type: "text", value: data.display_name, onChange: handleDisplayNameChange, placeholder: "e.g., My Brand Account", className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" })] })), _jsxs("div", { className: "flex gap-4 justify-between", children: [_jsx("button", { onClick: onPrev, className: "flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium", children: "\u2190 Previous" }), _jsx("button", { onClick: onNext, disabled: !isValid || validating, className: "flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium", children: "Next \u2192" })] })] }));
};
export default Step2ValidationPanel;
//# sourceMappingURL=Step2ValidationPanel.js.map