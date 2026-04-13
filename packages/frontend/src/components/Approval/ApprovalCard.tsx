import React from 'react';

export interface ApprovalCardProps {
  step: string;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  approved: 'bg-green-100 text-green-800 border border-green-300',
  rejected: 'bg-red-100 text-red-800 border border-red-300',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  step,
  title,
  content,
  status,
  onApprove,
  onReject,
  onEdit,
}) => {
  return (
    <article
      className="border border-gray-300 rounded-lg p-4 sm:p-6 bg-white shadow-sm"
      aria-label={`${title} - ${statusLabels[status]}`}
      data-testid="approval-card"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600" id={`step-label-${step}`}>
            Step: {step}
          </span>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mt-1">
            {title}
          </h3>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${statusColors[status]}`}
          role="status"
          aria-live="polite"
          aria-label={`Status: ${statusLabels[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      {/* Content */}
      <div
        className="bg-gray-50 rounded p-4 mb-4 text-gray-700 text-sm sm:text-base whitespace-pre-wrap"
        role="region"
        aria-label="Content for approval"
      >
        {content}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={onApprove}
          className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          aria-label="Approve this content"
          data-testid="approve-button"
        >
          Approve
        </button>

        <button
          onClick={onReject}
          className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          aria-label="Reject this content"
          data-testid="reject-button"
        >
          Reject
        </button>

        <button
          onClick={onEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Edit this content"
          data-testid="edit-button"
        >
          Edit
        </button>
      </div>
    </article>
  );
};

export default ApprovalCard;
