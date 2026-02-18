$ErrorActionPreference = "Stop"

$repos = @(
    "Stockfish|https://github.com/official-stockfish/Stockfish.git",
    "WDL_model|https://github.com/official-stockfish/WDL_model.git",
    "books|https://github.com/official-stockfish/books.git",
    "docs|https://github.com/official-stockfish/docs.git",
    "fishtest|https://github.com/official-stockfish/fishtest.git",
    "networks|https://github.com/official-stockfish/networks.git",
    "nnue-pytorch|https://github.com/official-stockfish/nnue-pytorch.git",
    "stockfish-web|https://github.com/official-stockfish/stockfish-web.git",
    "stockfish-wiki-bot|https://github.com/official-stockfish/stockfish-wiki-bot.git"
)

foreach ($repo in $repos) {

    $parts = $repo.Split("|")
    $folder = $parts[0]
    $url = $parts[1]

    Write-Host "Cloning $folder"

    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder
    }

    git clone $url $folder

    $gitFolder = Join-Path $folder ".git"
    if (Test-Path $gitFolder) {
        Remove-Item -Recurse -Force $gitFolder
    }
}

Write-Host "Done. All repositories cloned and converted to normal folders."
