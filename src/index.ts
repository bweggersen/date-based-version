import {
  tryGetLatestVersion,
  isVersionFromToday,
  getVersionZeroForToday,
  bumpMinor,
  bumpPatch,
} from "./version";
import { toReleaseBranch } from "./branch";
import { checkoutNewBranch, tag } from "./git";

export function setVersion(options: {
  cwd: string;
  dryRun?: boolean;
  patch?: boolean;
}): string {
  const { cwd } = options;
  const dryRun = options.dryRun || false;
  const patch = options.patch || false;

  const latestVersion = tryGetLatestVersion(cwd);

  if (!patch) {
    const currentLatestVersionFromToday = isVersionFromToday(latestVersion)
      ? latestVersion
      : getVersionZeroForToday();

    const newVersion = bumpMinor(currentLatestVersionFromToday);

    if (dryRun) {
      console.log(`git tag ${newVersion.getTag()}`);
    } else {
      tag(newVersion.getTag(), cwd);
    }

    const newBranch = toReleaseBranch(newVersion);
    if (dryRun) {
      console.log(`git checkout -b ${newBranch.toString()}`);
    } else {
      checkoutNewBranch(newBranch.toString(), cwd);
    }
    return newVersion.getVersion();
  } else {
    if (!latestVersion) {
      throw new Error(
        "The current branch does not have any version tag in its history"
      );
    }

    const newVersion = bumpPatch(latestVersion);
    if (dryRun) {
      console.log(`git tag ${newVersion.getTag()}`);
    } else {
      tag(newVersion.getTag(), cwd);
    }
    return newVersion.getVersion();
  }
}
