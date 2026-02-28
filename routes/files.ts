import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { protect, AuthRequest } from '../middleware/auth.js';
import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const router = Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimeType = allowedTypes.test(file.mimetype);
        const ext = allowedTypes.test(extname(file.originalname).toLowerCase());
        if (mimeType && ext) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'));
    }
});

router.post('/upload', protect, upload.single('file'), async (req: AuthRequest, res) => {
    // FIX: Check if the service key is configured before attempting to upload.
    if (!config.supabaseServiceKey) {
        console.error('Supabase Service Key is not configured. File upload is disabled.');
        return res.status(503).json({ error: 'File upload is not configured on the server. Please contact an administrator.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.file;
    const fileName = `${uuidv4()}${extname(file.originalname)}`;

    try {
        const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

        const { data, error } = await supabase.storage
          .from('apartment-images')
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error('Supabase upload error:', error.message);
          return res.status(500).json({ error: `Supabase upload error: ${error.message}` });
        }

        const { data: publicUrlData } = supabase.storage
          .from('apartment-images')
          .getPublicUrl(fileName);

        if (!publicUrlData) {
            throw new Error('Could not get public URL for the uploaded file');
        }

        res.status(200).json({ url: publicUrlData.publicUrl });
      } catch (error: any) {
        console.error('Error uploading file:', error.message);
        res.status(500).json({ error: `Failed to upload file: ${error.message}` });
      }
    });

export default router;
