import React from 'react';
export interface WizardState {
    instagram_username: string;
    instagram_password: string;
    display_name: string;
    account_validated: boolean;
    voice_description: string;
    tone: 'professional' | 'casual' | 'friendly';
    audience_age: string;
    audience_interests: string[];
    goals: string[];
}
export declare const ProfileWizard: React.FC;
//# sourceMappingURL=ProfileWizard.d.ts.map