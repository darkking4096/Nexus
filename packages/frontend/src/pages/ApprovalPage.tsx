import React, { useState } from 'react';
import {
  ApprovalCard,
  EditCaptionForm,
  PreviewPanel,
  ApprovalToolbar,
} from '../components/Approval';

interface ApprovalStep {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface MockApprovalData {
  imageUrl: string;
  caption: string;
  steps: ApprovalStep[];
}

// TODO(human): Replace with real backend API calls
const mockData: MockApprovalData = {
  imageUrl: 'https://via.placeholder.com/500x500',
  caption: 'Sample Instagram caption',
  steps: [
    {
      id: 'visual',
      title: 'Visual Content Review',
      content: 'Image quality and visual appeal check',
      status: 'pending',
    },
    {
      id: 'caption',
      title: 'Caption Review',
      content: 'Caption text and messaging check',
      status: 'pending',
    },
    {
      id: 'hashtags',
      title: 'Hashtags & Links',
      content: 'Hashtags, mentions, and links validation',
      status: 'pending',
    },
  ],
};

export const ApprovalPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [approvalData, setApprovalData] = useState(mockData);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCaption, setEditingCaption] = useState(approvalData.caption);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = approvalData.steps[currentStep];
  const totalSteps = approvalData.steps.length;

  const handleApprove = () => {
    const updatedSteps = [...approvalData.steps];
    updatedSteps[currentStep].status = 'approved';
    setApprovalData({ ...approvalData, steps: updatedSteps });
    handleNext();
  };

  const handleReject = () => {
    const updatedSteps = [...approvalData.steps];
    updatedSteps[currentStep].status = 'rejected';
    setApprovalData({ ...approvalData, steps: updatedSteps });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveCaption = (newCaption: string) => {
    setEditingCaption(newCaption);
    setApprovalData({ ...approvalData, caption: newCaption });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditingCaption(approvalData.caption);
    setIsEditing(false);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsEditing(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setIsEditing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO(human): Call backend API to submit approval
      console.log('Submitting approval:', approvalData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Approval submitted successfully!');
    } catch (error) {
      console.error('Error submitting approval:', error);
      alert('Error submitting approval. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoBack = currentStep > 0;
  const canGoForward = currentStep < totalSteps - 1;
  const allApproved = approvalData.steps.every(
    (step) => step.status === 'approved'
  );

  return (
    <main
      className="min-h-screen bg-gray-100 py-4 sm:py-6"
      role="main"
      aria-label="Approval workflow page"
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-300 mb-4 sm:mb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Content Approval Workflow
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2">
            Review and approve content before publishing to Instagram
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-32">
        {/* Grid Layout: Card + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Left: Approval Card */}
          <section aria-labelledby="approval-card-title">
            <h2 id="approval-card-title" className="sr-only">
              Current Approval Step
            </h2>
            <ApprovalCard
              step={currentStepData.id}
              title={currentStepData.title}
              content={currentStepData.content}
              status={currentStepData.status}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEditClick}
            />
          </section>

          {/* Right: Preview or Edit Form */}
          <section
            aria-labelledby="preview-or-edit-title"
            className="space-y-4"
          >
            <h2 id="preview-or-edit-title" className="sr-only">
              Preview and Edit
            </h2>

            {isEditing && currentStepData.id === 'caption' ? (
              <EditCaptionForm
                initialCaption={editingCaption}
                onSave={handleSaveCaption}
                onCancel={handleCancelEdit}
              />
            ) : (
              <PreviewPanel
                imageUrl={approvalData.imageUrl}
                caption={approvalData.caption}
                mediaType="image"
                alt="Content preview"
              />
            )}

            {/* Approval Status Summary */}
            <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Approval Status
              </h3>
              <ul className="space-y-2 text-sm">
                {approvalData.steps.map((step, idx) => (
                  <li
                    key={step.id}
                    className={`flex items-center gap-2 ${
                      idx === currentStep ? 'font-semibold' : ''
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
                        step.status === 'approved'
                          ? 'bg-green-600'
                          : step.status === 'rejected'
                          ? 'bg-red-600'
                          : 'bg-gray-400'
                      }`}
                    >
                      {step.status === 'approved' ? '✓' : '○'}
                    </span>
                    <span className="text-gray-700">{step.title}</span>
                  </li>
                ))}
              </ul>

              {allApproved && (
                <p className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
                  ✓ All steps approved! Ready to submit.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Toolbar - Sticky at Bottom */}
      <ApprovalToolbar
        currentStep={currentStep}
        totalSteps={totalSteps}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </main>
  );
};

export default ApprovalPage;
