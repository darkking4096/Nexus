import { Router, Response } from 'express';
import type { DatabaseAdapter } from '../config/database';
import multer from 'multer';
import { ProfileAsset } from '../models/ProfileAsset.js';
import { Profile } from '../models/Profile.js';
import { AssetService } from '../services/AssetService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

// Configure multer for file uploads (in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export function createAssetsRoutes(db: DatabaseAdapter): Router {
  const router = Router({ mergeParams: true });
  const assetModel = new ProfileAsset(db);
  const profileModel = new Profile(db);

  /**
   * POST /api/profiles/:profileId/assets
   * Upload asset (image, video, or document)
   */
  router.post(
    '/',
    verifyAccessToken,
    upload.single('file'),
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId;
        if (!userId) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }

        const { profileId } = req.params;
        const file = req.file;

        if (!file) {
          res.status(400).json({ error: 'No file provided' });
          return;
        }

        // Check profile ownership
        const profile = await profileModel.getById(profileId);
        if (!profile) {
          res.status(404).json({ error: 'Profile not found' });
          return;
        }

        if (profile.user_id !== userId) {
          res.status(403).json({ error: 'Access denied' });
          return;
        }

        // Validate file
        const validation = AssetService.validateFile({
          mimeType: file.mimetype,
          size: file.size,
        });

        if (!validation.valid) {
          res.status(400).json({ error: validation.error });
          return;
        }

        // Generate file path and save
        const filePath = AssetService.generateFilePath(profileId, file.originalname);
        await AssetService.saveFile(filePath, file.buffer);

        // Create asset record
        const asset = await assetModel.create({
          profile_id: profileId,
          asset_type: validation.assetType!,
          file_path: filePath,
          file_name: file.originalname,
          file_size: file.size,
          mime_type: file.mimetype,
        });

        res.status(201).json({
          message: 'Asset uploaded successfully',
          asset: {
            ...asset,
            file_size_readable: AssetService.formatFileSize(asset.file_size),
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Upload asset error:', errorMessage);
        res.status(500).json({ error: 'Failed to upload asset' });
      }
    }
  );

  /**
   * GET /api/profiles/:profileId/assets
   * List all assets for a profile
   */
  router.get('/', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;
      const { type } = req.query; // Optional filter by type

      // Check profile ownership
      const profile = await profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get assets
      let assets;
      if (type && ['image', 'video', 'document'].includes(type as string)) {
        assets = await assetModel.getByProfileIdAndType(profileId, type as string);
      } else {
        assets = await assetModel.getByProfileId(profileId);
      }

      res.json({
        count: assets.length,
        assets: assets.map((asset) => ({
          ...asset,
          file_size_readable: AssetService.formatFileSize(asset.file_size),
        })),
      });
    } catch (error) {
      console.error('List assets error:', error);
      res.status(500).json({ error: 'Failed to list assets' });
    }
  });

  /**
   * DELETE /api/profiles/:profileId/assets/:assetId
   * Delete an asset
   */
  router.delete('/:assetId', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId, assetId } = req.params;

      // Check profile ownership
      const profile = await profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Check asset exists and belongs to profile
      const asset = await assetModel.getById(assetId);
      if (!asset || asset.profile_id !== profileId) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      // Delete file from storage
      await AssetService.deleteFile(asset.file_path);

      // Delete asset record
      const deleted = await assetModel.delete(assetId);

      if (!deleted) {
        res.status(500).json({ error: 'Failed to delete asset' });
        return;
      }

      res.json({ message: 'Asset deleted successfully' });
    } catch (error) {
      console.error('Delete asset error:', error);
      res.status(500).json({ error: 'Failed to delete asset' });
    }
  });

  return router;
}
