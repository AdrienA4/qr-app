import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const videosDir = path.join(process.cwd(), 'public/videos');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { videoData } = req.body;
      const base64Data = videoData.replace(/^data:video\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const filename = `video-${Date.now()}.mp4`;
      const filepath = path.join(videosDir, filename);
      
      await fs.promises.writeFile(filepath, buffer);
      
      res.status(200).json({ 
        url: `/videos/${filename}`,
        filename
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save video' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}