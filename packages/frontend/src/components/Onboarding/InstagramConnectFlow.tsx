import React from 'react';
import { Button } from '../atoms/Button';
import { Card } from '../molecules/Card';

export interface InstagramConnectFlowProps {
  isConnected: boolean;
  instagramHandle?: string;
  onConnect: () => void;
  onDisconnect?: () => void;
  loading?: boolean;
}

export const InstagramConnectFlow = React.forwardRef<HTMLDivElement, InstagramConnectFlowProps>(
  ({ isConnected, instagramHandle, onConnect, onDisconnect, loading = false }, ref) => {
    return (
      <div ref={ref} className="space-y-6">
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl">📱</div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Connect Your Instagram</h3>
              <p className="text-sm text-text-secondary">
                Authorize access to manage your account securely
              </p>
            </div>
          </div>

          {isConnected && instagramHandle ? (
            <div className="bg-green-50 border border-success rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">✓</div>
                <div>
                  <p className="font-semibold text-text-primary">Connected!</p>
                  <p className="text-sm text-text-secondary">@{instagramHandle}</p>
                </div>
              </div>

              {onDisconnect && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onDisconnect}
                  disabled={loading}
                  className="w-full"
                >
                  Disconnect Account
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">Click the button below</p>
                    <p className="text-sm text-text-secondary">You'll be redirected to Instagram</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">Authorize access</p>
                    <p className="text-sm text-text-secondary">Grant permission to manage your account</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-text-primary">You're all set!</p>
                    <p className="text-sm text-text-secondary">Start creating content</p>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={onConnect}
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                Connect with Instagram
              </Button>

              <p className="text-xs text-text-secondary text-center mt-4">
                We only access the permissions needed to manage your content
              </p>
            </>
          )}
        </Card>
      </div>
    );
  }
);

InstagramConnectFlow.displayName = 'InstagramConnectFlow';
