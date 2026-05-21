#!/usr/bin/env python3
"""Build data/questions-slugs.json from committed exam JSON (optional SEO deep links)."""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "questions-slugs.json"
sys.path.insert(0, str(ROOT / "scripts"))

from question_seo import build_slug_registry  # noqa: E402


def main() -> int:
    registry = build_slug_registry()
    registry["generatedAt"] = datetime.now(timezone.utc).isoformat()
    OUT.write_text(json.dumps(registry, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(registry['bySlug'])} slugs -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
