import React, { useState } from 'react';
import axios from 'axios';
import type { WizardState } from '../../pages/ProfileWizard';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  data: WizardState;
  onChange: (updates: Partial<WizardState>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface AccountInfo {
  username: string;
  followers_count: number;
  bio: string;
  profile_picture_url: string;
}

const Step2ValidationPanel: React.FC<Props> = ({ data, onChange, onNext, onPrev }) => {
  const { token } = useAuth();
  const [validating, setValidating] = useState(false);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidateAccount = async () => {
    try {
      setValidating(true);
      setValidationError(null);

      const response = await axios.post(
        '/api/profiles/connect',
        {
          username: data.instagram_username,
          password: data.instagram_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const profile = response.data.profile;
      setAccountInfo({
        username: profile.instagram_username,
        followers_count: profile.followers_count || 0,
        bio: profile.bio || 'No bio',
        profile_picture_url: profile.profile_picture_url || '',
      });

      onChange({ account_validated: true });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : 'Validation failed';
      setValidationError(message);
      onChange({ account_validated: false });
    } finally {
      setValidating(false);
    }
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ display_name: e.target.value });
  };

  const isValid = data.account_validated && data.display_name;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Validate Account</h2>
      <p className="text-gray-600 mb-6">
        Let's verify your Instagram account and set your display name in NEXUS.
      </p>

      {validationError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{validationError}</p>
        </div>
      )}

      {!accountInfo ? (
        <div className="space-y-4 mb-6">
          <button
            onClick={handleValidateAccount}
            disabled={validating || !data.instagram_username || !data.instagram_password}
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {validating ? 'Validating...' : 'Validate Instagram Account'}
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-4">
            {accountInfo.profile_picture_url && (
              <img
                src={accountInfo.profile_picture_url}
                alt={accountInfo.username}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">@{accountInfo.username}</h3>
              <p className="text-sm text-gray-600">{accountInfo.followers_count.toLocaleString()} followers</p>
              <p className="text-sm text-gray-600 mt-2">{accountInfo.bio}</p>
              <button
                onClick={handleValidateAccount}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Validate Different Account
              </button>
            </div>
          </div>
        </div>
      )}

      {accountInfo && (
        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Display Name in NEXUS
          </label>
          <input
            type="text"
            value={data.display_name}
            onChange={handleDisplayNameChange}
            placeholder="e.g., My Brand Account"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      )}

      <div className="flex gap-4 justify-between">
        <button
          onClick={onPrev}
          className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={!isValid || validating}
          className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Step2ValidationPanel;
