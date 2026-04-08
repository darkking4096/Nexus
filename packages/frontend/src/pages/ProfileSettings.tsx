import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface ProfileData {
  id: string;
  display_name?: string;
  bio?: string;
  instagram_username: string;
  followers_count: number;
}

export const ProfileSettings: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/profiles/${profileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
        setDisplayName(response.data.display_name || '');
        setBio(response.data.bio || '');
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

      await axios.patch(
        `/api/profiles/${profileId}`,
        {
          display_name: displayName,
          bio: bio,
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
        : 'Failed to save profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      await axios.delete(`/api/profiles/${profileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Redirect to dashboard after deletion
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to delete profile';
      setError(message);
      setDeleting(false);
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

  if (!profile) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h2>Profile Settings</h2>
              <p className="text-muted">Manage your Instagram profile information</p>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">Changes saved successfully!</div>}

              <div className="profile-info mb-4">
                <p>
                  <strong>Instagram Username:</strong> @{profile.instagram_username}
                </p>
                <p>
                  <strong>Followers:</strong> {profile.followers_count.toLocaleString()}
                </p>
              </div>

              <form>
                <div className="form-group mb-3">
                  <label htmlFor="displayName">Display Name</label>
                  <input
                    id="displayName"
                    type="text"
                    className="form-control"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your brand name"
                  />
                  <small className="form-text text-muted">
                    How you want to be displayed in the application
                  </small>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    className="form-control"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Your profile bio"
                    rows={4}
                  />
                  <small className="form-text text-muted">
                    A brief description of your profile
                  </small>
                </div>
              </form>
            </div>

            <div className="card-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          <div className="card mt-4 border-danger">
            <div className="card-header bg-danger text-white">
              <h3 className="mb-0">Danger Zone</h3>
            </div>

            <div className="card-body">
              <h5>Delete Profile</h5>
              <p className="text-muted">
                Once you delete a profile, it cannot be recovered. This will also delete all
                associated data including posts, credentials, and metrics.
              </p>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Profile
                </button>
              ) : (
                <div className="alert alert-danger">
                  <h5>Are you sure?</h5>
                  <p>This action cannot be undone. All data associated with this profile will be permanently deleted.</p>
                  <div>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Yes, Delete My Profile'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
