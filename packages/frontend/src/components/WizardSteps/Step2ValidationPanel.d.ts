import React from 'react';
import type { WizardState } from '../../pages/ProfileWizard';
interface Props {
    data: WizardState;
    onChange: (updates: Partial<WizardState>) => void;
    onNext: () => void;
    onPrev: () => void;
}
declare const Step2ValidationPanel: React.FC<Props>;
export default Step2ValidationPanel;
//# sourceMappingURL=Step2ValidationPanel.d.ts.map