import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

interface Asset {
  id: string;
  asset_type: 'image' | 'video' | 'document';
  file_name: string;
  file_size_readable: string;
  created_at: string;
}

export const AssetUploader: React.FC = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { token } = useAuth();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video' | 'document'>('all');

  useEffect(() => {
    fetchAssets();
  }, [profileId, token, selectedType]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params = selectedType !== 'all' ? `?type=${selectedType}` : '';
      const response = await axios.get(`/api/profiles/${profileId}/assets${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAssets(response.data.assets);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to load assets';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      await axios.post(`/api/profiles/${profileId}/assets`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAssets();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to upload file';
      setError(message);
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;

    try {
      await axios.delete(`/api/profiles/${profileId}/assets/${assetId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchAssets();
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : 'Failed to delete asset';
      setError(message);
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
        <div className="col-lg-10">
          <div className="card">
            <div className="card-header">
              <h2>Profile Assets</h2>
              <p className="text-muted">
                Upload images, videos, and documents to use as context for content generation
              </p>
            </div>

            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">Operation successful!</div>}

              <div className="upload-section mb-4">
                <h5>Upload New Asset</h5>
                <div className="form-group">
                  <label htmlFor="fileUpload" className="form-label">
                    Choose File
                  </label>
                  <input
                    id="fileUpload"
                    type="file"
                    className="form-control"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept="image/*,video/*,.pdf,.txt"
                  />
                  <small className="form-text text-muted">
                    Supported: Images (jpg, png, gif, webp), Videos (mp4, mov, avi), Documents
                    (pdf, txt). Max: 10MB for images, 100MB for videos, 50MB for documents.
                  </small>
                </div>
              </div>

              <hr />

              <div className="assets-section">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Your Assets ({assets.length})</h5>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedType('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedType === 'image' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedType('image')}
                    >
                      Images
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedType === 'video' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedType('video')}
                    >
                      Videos
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${selectedType === 'document' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedType('document')}
                    >
                      Documents
                    </button>
                  </div>
                </div>

                {assets.length === 0 ? (
                  <div className="alert alert-info">No assets yet. Upload your first asset above!</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>File Name</th>
                          <th>Size</th>
                          <th>Uploaded</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assets.map((asset) => (
                          <tr key={asset.id}>
                            <td>
                              <span className="badge bg-secondary">{asset.asset_type}</span>
                            </td>
                            <td>{asset.file_name}</td>
                            <td>{asset.file_size_readable}</td>
                            <td>{new Date(asset.created_at).toLocaleDateString()}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteAsset(asset.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetUploader;
