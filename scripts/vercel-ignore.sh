#!/usr/bin/env bash
# Vercel ignoreCommand: exit 0 = skip the build, exit 1 = build.
# Compare against the last deployed commit (VERCEL_GIT_PREVIOUS_SHA) rather than
# HEAD^, so a multi-commit push is judged as a whole. If the base commit is not
# in the clone, build to be safe. Content-only paths never trigger a build.
BASE="${VERCEL_GIT_PREVIOUS_SHA:-HEAD^}"
git cat-file -e "${BASE}^{commit}" 2>/dev/null || exit 1
git diff --quiet "$BASE" HEAD -- \
  ':(exclude)content/social-media' \
  ':(exclude)demo-video' \
  ':(exclude)content/DriveDE_Avatar_SoulX.ipynb' \
  ':(exclude)content/narrator-scripts.md' \
  ':(exclude)content/avatar-pipeline.md'
