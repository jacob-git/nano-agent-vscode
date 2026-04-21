# Release Process

Nano Agent publishes to the Visual Studio Marketplace from GitHub Actions when a version tag is pushed.

## One-time setup

Add the Marketplace publishing token as a GitHub Actions secret:

```sh
gh secret set VSCE_PAT --repo jacob-git/nano-agent-vscode
```

Paste a Visual Studio Marketplace/Azure DevOps Personal Access Token that can publish extensions for the `pallattu` publisher.

## Publish a new version

1. Update `version` in `package.json` and `package-lock.json`.
2. Update `CHANGELOG.md`.
3. Run:

```sh
npm test
npm run package
```

4. Commit and push the release prep.
5. Create and push a matching tag:

```sh
git tag v0.1.1
git push origin main
git push origin v0.1.1
```

The `Publish Marketplace` workflow packages and publishes the VSIX from that tag.
