# Submodule migration

These paths are no longer git submodules and are now regular directories in this repository:

- `Stockfish` (was `https://github.com/official-stockfish/Stockfish.git` @ `cf559b2`)
- `WDL_model` (was `https://github.com/official-stockfish/WDL_model.git` @ `c7756b3`)
- `books` (was `https://github.com/official-stockfish/books.git` @ `65815cc`)
- `docs` (was `https://github.com/official-stockfish/docs.git` @ `7513d30`)
- `fishtest` (was `https://github.com/official-stockfish/fishtest.git` @ `864cc90`)
- `networks` (was `https://github.com/official-stockfish/networks.git` @ `fa18559`)
- `nnue-pytorch` (was `https://github.com/official-stockfish/nnue-pytorch.git` @ `ecf6ab8`)
- `stockfish-web` (was `https://github.com/official-stockfish/stockfish-web.git` @ `8938d67`)
- `stockfish-wiki-bot` (was `https://github.com/official-stockfish/stockfish-wiki-bot.git` @ `278b5d5`)

## Current state in this branch

Because the execution environment could not access GitHub while this change was applied, these directories currently contain only placeholders.

To hydrate them with the exact pinned repository contents as normal folders, run:

```bash
./scripts/hydrate_submodules_as_folders.sh
```

After hydration, commit the resulting files.
