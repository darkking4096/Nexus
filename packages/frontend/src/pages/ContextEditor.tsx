import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import VoiceEditor from '../components/ContextEditors/VoiceEditor';
import ToneSelector from '../components/ContextEditors/ToneSelector';
import AudienceEditor from '../components/ContextEditors/AudienceEditor';
import GoalsEditor from '../components/ContextEditors/GoalsEditor';
import ContextPreview from '../components/ContextEditors/ContextPreview';

interface ProfileContext {
  voice: string;
  tone: 'professional' | 'casual' | 'friendly';
  audience: Record<string, unknown>;
  goals: string[];
}

export const ContextEditor: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { token } = useAuth();

  const [context, setContext] = useState<ProfileContext>({
    voice: '',
    tone: 'professional',
    audience: {},
    goals: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/profiles/${profileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profile = response.data;
        setContext({
          voice: profile.context_voice || '',
          tone: profile.context_tone || 'professional',
          audience: profile.context_audience
            ? JSON.parse(profile.context_audience)
            : {},
          goals: profile.context_goals ? JSON.parse(profile.context_goals) : [],
        });
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : 'Failed to load profile';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (profileId && token) {
      fetchProfile();
    }
  }, [profileId, token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate
      if (!context.voice.trim()) {
        setError('Voice description is required');
        return;
      }
      if (context.goals.length === 0) {
        setError('At least one goal is required');
        return;
      }

      await axios.patch(
        `/api/profiles/${profileId}/context`,
        {
          voice: context.voice,
          tone: context.tone,
          audience: context.audience,
          goals: context.goals,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to save context';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h2>Edit Profile Context</h2>
              <p className="text-muted">Configure your profile's voice, tone, audience, and goals</p>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && (
                <div className="alert alert-success">Context saved successfully!</div>
              )}

              <form>
                <VoiceEditor
                  value={context.voice}
                  onChange={(voice) => setContext({ ...context, voice })}
                />

                <ToneSelector
                  value={context.tone}
                  onChange={(tone) => setContext({ ...context, tone })}
                />

                <AudienceEditor
                  value={context.audience}
                  onChange={(audience) => setContext({ ...context, audience })}
                />

                <GoalsEditor
                  value={context.goals}
                  onChange={(goals) => setContext({ ...context, goals })}
                />
              </form>
            </div>

            <div className="card-footer">
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Context'}
              </button>
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="col-lg-4">
            <div className="card sticky-top" style={{ top: '20px' }}>
              <div className="card-body">
                <ContextPreview
                  voice={context.voice}
                  tone={context.tone}
                  audience={context.audience}
                  goals={context.goals}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextEditor;
