#!/usr/bin/env python3
"""Calculate semantic version bumps from conventional commit messages."""

from __future__ import annotations

import argparse
import re
from dataclasses import dataclass
from enum import IntEnum
from pathlib import Path
import os
import os
import sys


class BumpLevel(IntEnum):
    NONE = 0
    PATCH = 1
    MINOR = 2
    MAJOR = 3


BREAKING_HEADER_RE = re.compile(r"^[a-z]+(?:\([^)]+\))?!:", re.IGNORECASE)
FEAT_RE = re.compile(r"^feat(?:\([^)]+\))?:", re.IGNORECASE)
FIX_RE = re.compile(r"^fix(?:\([^)]+\))?:", re.IGNORECASE)


@dataclass(frozen=True)
class Version:
    major: int
    minor: int
    patch: int

    @classmethod
    def parse(cls, raw: str) -> "Version":
        value = raw.strip()
        if value.startswith("v"):
            value = value[1:]

        parts = value.split(".")
        if len(parts) != 3 or not all(part.isdigit() for part in parts):
            raise ValueError(f"Invalid semantic version: {raw!r}")

        return cls(*(int(part) for part in parts))

    def bump(self, level: BumpLevel) -> "Version":
        if level == BumpLevel.MAJOR:
            return Version(self.major + 1, 0, 0)
        if level == BumpLevel.MINOR:
            return Version(self.major, self.minor + 1, 0)
        if level == BumpLevel.PATCH:
            return Version(self.major, self.minor, self.patch + 1)
        return self

    def __str__(self) -> str:
        return f"v{self.major}.{self.minor}.{self.patch}"


def determine_bump(commit_text: str) -> BumpLevel:
    level = BumpLevel.NONE

    for line in commit_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue

        if "BREAKING CHANGE" in stripped.upper() or BREAKING_HEADER_RE.match(stripped):
            return BumpLevel.MAJOR

        if FEAT_RE.match(stripped):
            level = max(level, BumpLevel.MINOR)
        elif FIX_RE.match(stripped):
            level = max(level, BumpLevel.PATCH)

    return level


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--current", required=True, help="Current version (e.g., v1.2.3 or 1.2.3)")
    parser.add_argument("--commits-file", required=True, help="Path to file containing commit messages")
    args = parser.parse_args()

    current = Version.parse(args.current)
    commits_file_root = os.environ.get("COMMITS_FILE_ROOT")
    commits_path = Path(args.commits_file)

    # Determine the allowed root for commits files. If COMMITS_FILE_ROOT is not set,
    # default to the current working directory.
    root_path = Path(commits_file_root or os.getcwd()).resolve()
    resolved_commits_path = commits_path.resolve()

    try:
        is_within_root = resolved_commits_path.is_relative_to(root_path)  # type: ignore[attr-defined]
    except AttributeError:
        # Python < 3.9 compatibility
        try:
            resolved_commits_path.relative_to(root_path)
            is_within_root = True
        except ValueError:
            is_within_root = False

    if not is_within_root:
        print(
            f"Error: commits file '{resolved_commits_path}' is outside the allowed root '{root_path}'",
            file=sys.stderr,
        )
        return 1

    safe_commits_path = resolved_commits_path

    commits = safe_commits_path.read_text(encoding="utf-8")
    bump_level = determine_bump(commits)
    next_version = current.bump(bump_level)

    print(f"BUMP_LEVEL={bump_level.name.lower()}")
    print(f"NEXT_VERSION={next_version}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
