import React from 'react';
import type { WizardState } from '../../pages/ProfileWizard';

interface Props {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
}

const Step1CredentialsForm: React.FC<Props> = ({ data, onChange, onNext }) => {
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ instagram_username: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ instagram_password: e.target.value });
  };

  const isValid = data.instagram_username && data.instagram_password;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Instagram Credentials</h2>
      <p className="text-gray-600 mb-6">
        Enter your Instagram username and password. We'll connect securely and encrypt your credentials.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram Username
          </label>
          <input
            type="text"
            value={data.instagram_username}
            onChange={handleUsernameChange}
            placeholder="your_username"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instagram Password
          </label>
          <input
            type="password"
            value={data.instagram_password}
            onChange={handlePasswordChange}
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Security:</strong> Your credentials are encrypted with AES-256 and never stored in plain text.
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!isValid}
        className="w-full mt-6 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Validate Account
      </button>
    </div>
  );
};

export default Step1CredentialsForm;
