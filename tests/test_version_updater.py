import unittest

from scripts.version_updater import BumpLevel, Version, determine_bump


class VersionUpdaterTests(unittest.TestCase):
    def test_fix_is_patch(self):
        self.assertEqual(determine_bump("fix: correct typo"), BumpLevel.PATCH)

    def test_feat_is_minor(self):
        self.assertEqual(determine_bump("feat: add login system"), BumpLevel.MINOR)

    def test_feat_breaking_is_major(self):
        self.assertEqual(determine_bump("feat!: change API structure"), BumpLevel.MAJOR)

    def test_breaking_change_footer_is_major(self):
        msg = "feat: add endpoint\n\nBREAKING CHANGE: response format changed"
        self.assertEqual(determine_bump(msg), BumpLevel.MAJOR)

    def test_highest_bump_wins(self):
        msg = "fix: patch one\nfeat: cool thing\nfix: patch two"
        self.assertEqual(determine_bump(msg), BumpLevel.MINOR)

    def test_bump_output(self):
        start = Version.parse("1.5.3")
        self.assertEqual(str(start.bump(BumpLevel.PATCH)), "v1.5.4")
        self.assertEqual(str(start.bump(BumpLevel.MINOR)), "v1.6.0")
        self.assertEqual(str(start.bump(BumpLevel.MAJOR)), "v2.0.0")


if __name__ == "__main__":
    unittest.main()
