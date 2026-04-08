import React from 'react';
import type { WizardState } from '../../pages/ProfileWizard';
interface Props {
    data: WizardState;
    onChange: (updates: Partial<WizardState>) => void;
    onNext: () => void;
    onPrev: () => void;
}
declare const Step3VoiceConfig: React.FC<Props>;
export default Step3VoiceConfig;
//# sourceMappingURL=Step3VoiceConfig.d.ts.map