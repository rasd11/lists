const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const SOURCE_DIR = path.resolve(process.env.SOURCE_DIR || "./repo");

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "50mb" }));


// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function safeRepoPath(repoPath = "") {
  // Prevent ../../ escapes from SOURCE_DIR.
  const normalized = path.normalize("/" + repoPath).replace(/^[/\\]+/, "");
  const fullPath = path.resolve(SOURCE_DIR, normalized);

  if (
    fullPath !== SOURCE_DIR &&
    !fullPath.startsWith(SOURCE_DIR + path.sep)
  ) {
    throw new Error("Path escapes repository root");
  }

  return fullPath;
}

function relativeRepoPath(fullPath) {
  return path.relative(SOURCE_DIR, fullPath).split(path.sep).join("/");
}

function githubSha(buffer) {
  // Approximate Git blob SHA:
  // sha1("blob " + byteLength + "\0" + content)
  const crypto = require("crypto");
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return crypto
    .createHash("sha1")
    .update(Buffer.concat([header, buffer]))
    .digest("hex");
}

function githubEntry(fullPath) {
  const stat = fs.statSync(fullPath);
  const repoPath = relativeRepoPath(fullPath);

  if (stat.isDirectory()) {
    return {
      name: path.basename(fullPath),
      path: repoPath,
      sha: null,
      size: 0,
      url: null,
      html_url: null,
      git_url: null,
      download_url: null,
      type: "dir",
    };
  }

  const content = fs.readFileSync(fullPath);

  return {
    name: path.basename(fullPath),
    path: repoPath,
    sha: githubSha(content),
    size: stat.size,
    url: null,
    html_url: null,
    git_url: null,
    download_url: null,
    type: "file",
  };
}

function listDirectory(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => githubEntry(path.join(dir, entry.name)));
}

// -----------------------------------------------------------------------------
// GET /repos/:owner/:repo/contents
// GET /repos/:owner/:repo/contents/*
// -----------------------------------------------------------------------------

app.get(/^\/repos\/([^/]+)\/([^/]+)\/contents(?:\/(.*))?$/, (req, res) => {
  try {
    const repoPath = req.params[2] || "";
    const fullPath = safeRepoPath(repoPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        message: "Not Found",
        documentation_url: "https://docs.github.com/rest/repos/contents",
      });
    }

    const stat = fs.statSync(fullPath);

    // Directory -> GitHub returns an array
    if (stat.isDirectory()) {
      return res.json(listDirectory(fullPath));
    }

    // File
    const content = fs.readFileSync(fullPath);

    // Support raw response similar to GitHub's raw media type.
    const accept = req.headers.accept || "";

    if (
      accept.includes("application/vnd.github.raw") ||
      req.query.raw === "true"
    ) {
      res.type(path.extname(fullPath) || "application/octet-stream");
      return res.send(content);
    }

    return res.json({
      name: path.basename(fullPath),
      path: relativeRepoPath(fullPath),
      sha: githubSha(content),
      size: content.length,
      url: null,
      html_url: null,
      git_url: null,
      download_url: null,
      type: "file",
      encoding: "base64",
      content: content.toString("base64"),
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message || "Internal Server Error",
    });
  }
});

// -----------------------------------------------------------------------------
// PUT /repos/:owner/:repo/contents/*
// Blindly replaces/creates the file.
//
// GitHub normally requires `sha` for an update.
// This mock intentionally ignores it.
// -----------------------------------------------------------------------------

app.put(/^\/repos\/([^/]+)\/([^/]+)\/contents\/(.+)$/, (req, res) => {
  try {
    const repoPath = req.params[3];
    const fullPath = safeRepoPath(repoPath);

    const { message, content, branch } = req.body || {};

    if (typeof content !== "string") {
      return res.status(422).json({
        message: "content is required and must be a base64 string",
      });
    }

    let decoded;

    try {
      decoded = Buffer.from(content, "base64");
    } catch {
      return res.status(422).json({
        message: "Invalid base64 content",
      });
    }

    // Make parent directories automatically.
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    const existed = fs.existsSync(fullPath);

    // BLIND REPLACE:
    // No existing file read, no SHA check.
    fs.writeFileSync(fullPath, decoded);

    const newSha = githubSha(decoded);

    const response = {
      content: {
        name: path.basename(fullPath),
        path: relativeRepoPath(fullPath),
        sha: newSha,
        size: decoded.length,
        url: null,
        html_url: null,
        git_url: null,
        download_url: null,
        type: "file",
        encoding: "base64",
        content: decoded.toString("base64"),
      },

      commit: {
        sha: newSha,
        message: message || "Update file",
        branch: branch || "main",
      },

      operation: existed ? "update" : "create",
    };

    return res.status(existed ? 200 : 201).json(response);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message || "Internal Server Error",
    });
  }
});

// -----------------------------------------------------------------------------
// Health check
// -----------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    ok: true,
    source: SOURCE_DIR,
  });
});

// -----------------------------------------------------------------------------
// Start
// -----------------------------------------------------------------------------

fs.mkdirSync(SOURCE_DIR, { recursive: true });

const HOST = process.env.HOST || "localhost";

app.listen(PORT, HOST, () => {
  console.log(`GitHub mock API listening on http://${HOST}:${PORT}`);
  console.log(`Repository source: ${SOURCE_DIR}`);
});