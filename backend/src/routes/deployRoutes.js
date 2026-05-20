import { Router } from 'express';
import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { config } from '../config.js';
import { requireRootAuth } from '../middleware/rootAuthMiddleware.js';

const router = Router();
router.use(requireRootAuth);

const commitSchema = z.object({
  path: z.string().min(1).max(500),
  content: z.string(),
  message: z.string().max(200).optional(),
});

router.post('/commit', async (req, res) => {
  const parsed = commitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.flatten() },
    });
  }
  if (!config.githubToken?.trim() || !config.githubOwner?.trim() || !config.githubRepo?.trim()) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'NOT_CONFIGURED',
        message: 'Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in backend/.env',
      },
    });
  }

  const { path: filePath, content, message } = parsed.data;
  const octokit = new Octokit({ auth: config.githubToken });
  const branch = config.githubBranch || 'main';

  let sha;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: config.githubOwner,
      repo: config.githubRepo,
      path: filePath,
      ref: branch,
    });
    if (!Array.isArray(data) && data && 'sha' in data) sha = data.sha;
  } catch {
    sha = undefined;
  }

  try {
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: config.githubOwner,
      repo: config.githubRepo,
      path: filePath,
      message: message || `Deploy: ${filePath} @ ${new Date().toISOString()}`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    });
    return res.json({
      success: true,
      data: {
        committed: true,
        branch,
        path: filePath,
      },
    });
  } catch (e) {
    console.error('[deploy/commit]', e?.message || e);
    return res.status(500).json({
      success: false,
      error: {
        code: 'GITHUB_ERROR',
        message: e?.response?.data?.message || e?.message || 'GitHub commit failed.',
      },
    });
  }
});

export default router;
