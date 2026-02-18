#!/usr/bin/env bash
set -euo pipefail

# Rehydrates former submodule directories as regular folders at pinned commits.
# Requires network access to clone repositories.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

repos=(
  "Stockfish|https://github.com/official-stockfish/Stockfish.git|cf559b2c17e726cb0a1758c2c31b2d1dbe40ccfb"
  "WDL_model|https://github.com/official-stockfish/WDL_model.git|c7756b3771c874ca45040edf04c17036a3724e10"
  "books|https://github.com/official-stockfish/books.git|65815ccdbc7727cd4f6aee252ba8f67fb740e92f"
  "docs|https://github.com/official-stockfish/docs.git|7513d30cec51cb0409f264d22d2aea7eb846bb4d"
  "fishtest|https://github.com/official-stockfish/fishtest.git|864cc9023b60436ddadc0c3b3eb75bc1fee88407"
  "networks|https://github.com/official-stockfish/networks.git|fa185598ac465137e6d09146b3dc859b0414896c"
  "nnue-pytorch|https://github.com/official-stockfish/nnue-pytorch.git|ecf6ab88d3f7c3825e0180fe18ac2898ea61975d"
  "stockfish-web|https://github.com/official-stockfish/stockfish-web.git|8938d675db1c90bd03181e2bfbafff5a2e454ec9"
  "stockfish-wiki-bot|https://github.com/official-stockfish/stockfish-wiki-bot.git|278b5d58ee7ac8a611eae3051a3ac61bd1d0d4d1"
)

workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

for item in "${repos[@]}"; do
  IFS='|' read -r path url sha <<<"$item"
  echo "Hydrating $path @ ${sha:0:7}"

  git clone --no-checkout "$url" "$workdir/$path"
  git -C "$workdir/$path" checkout "$sha"

  rm -rf "$path"
  mkdir -p "$path"
  rsync -a --exclude='.git' "$workdir/$path/" "$path/"

done

echo "Done. Former submodule paths now contain pinned source content as regular folders."
