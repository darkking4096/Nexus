import React from 'react';
import { FormField } from '../molecules/FormField';
import { FileUpload } from '../molecules/FileUpload';
import { Avatar } from '../atoms/Avatar';
import { Card } from '../molecules/Card';

export interface ProfileData {
  name: string;
  bio: string;
  profilePicture?: string;
}

export interface ProfileSetupFormProps {
  data: ProfileData;
  onChange: (data: ProfileData) => void;
  loading?: boolean;
  errors?: Partial<Record<keyof ProfileData, string>>;
}

export const ProfileSetupForm = React.forwardRef<HTMLDivElement, ProfileSetupFormProps>(
  ({ data, onChange, loading = false, errors = {} }, ref) => {
    const [imagePreview, setImagePreview] = React.useState<string>(data.profilePicture || '');

    const handleNameChange = (name: string) => {
      onChange({ ...data, name });
    };

    const handleBioChange = (bio: string) => {
      onChange({ ...data, bio });
    };

    const handleFileSelect = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setImagePreview(url);
        onChange({ ...data, profilePicture: url });
      };
      reader.readAsDataURL(file);
    };

    return (
      <div ref={ref} className="space-y-8">
        {/* Profile Picture */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Profile Picture</h3>

            {imagePreview && (
              <div className="flex justify-center">
                <Avatar size={64} src={imagePreview} alt="Profile preview" />
              </div>
            )}

            <FileUpload onFileSelect={handleFileSelect} accept="image/*" maxSize={5 * 1024 * 1024} />
          </div>
        </Card>

        {/* Name & Bio */}
        <div className="space-y-4">
          <FormField
            label="Full Name"
            id="profile-name"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="John Doe"
            required
            error={errors.name}
            helperText="This will be displayed as your profile name"
            disabled={loading}
          />

          <FormField
            label="Bio"
            id="profile-bio"
            value={data.bio}
            onChange={(e) => handleBioChange(e.target.value)}
            placeholder="Content creator • Digital marketer • Coffee enthusiast ☕"
            required
            error={errors.bio}
            helperText="Tell your audience about yourself (max 150 characters)"
            disabled={loading}
            maxLength={150}
          />
        </div>

        {/* Submitted Message */}
        {!errors.name && data.name && (
          <div className="p-4 rounded-lg bg-green-50 border border-success">
            <p className="text-sm text-success font-medium">✓ Profile information saved</p>
          </div>
        )}
      </div>
    );
  }
);

ProfileSetupForm.displayName = 'ProfileSetupForm';
