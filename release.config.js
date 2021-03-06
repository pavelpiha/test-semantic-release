const userName = require("git-user-name");
const userEmail = require("git-user-email");
const branch = require("git-branch");

process.env["GIT_AUTHOR_NAME"] = userName();
process.env["GIT_AUTHOR_EMAIL"] = userEmail();
process.env["GIT_COMMITTER_NAME"] = userName();
process.env["GIT_COMMITTER_EMAIL"] = userEmail();
process.env["CI"] = "local";
process.env["CI_BRANCH"] = branch.sync();

const branchesConfig = ["main", { name: "develop", prerelease: true }];

const branchName = branch.sync();
if (branchName.startsWith("feature/")) {
  branchesConfig.push({
    name: branchName,
    prerelease: branchName.replace(/\//g, "-"),
  });
}

module.exports = {
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: [
          "package.json",
          "package-lock.json",
          "CHANGELOG.md",
          "README.md",
        ],
        message:
          "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
  ],
  branches: branchesConfig,
  branch: branch.sync(),
  // repositoryUrl: "https://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@github.com/pavelpiha/test-semantic-release.git",
  repositoryUrl: "git@github.com/pavelpiha/test-semantic-release.git",
};
