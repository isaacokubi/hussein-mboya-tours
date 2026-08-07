#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, shutil, subprocess
from pathlib import Path

def run(cmd, cwd):
    print("\n$ " + " ".join(cmd))
    return subprocess.run(cmd, cwd=cwd).returncode

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    root = Path(ap.parse_args().root).resolve()
    client, server = root / "client", root / "server"
    if not shutil.which("node") or not shutil.which("npm"):
        raise SystemExit("Node.js and npm are required.")

    failures = 0
    if (client / "package.json").exists():
        failures += run(["npm", "install"], client) != 0
        failures += run(["npm", "run", "build"], client) != 0
        scripts = json.loads((client / "package.json").read_text()).get("scripts", {})
        if "lint" in scripts:
            failures += run(["npm", "run", "lint"], client) != 0

    if (server / "package.json").exists():
        failures += run(["npm", "install"], server) != 0
        for p in server.rglob("*.js"):
            if "node_modules" not in p.parts:
                failures += run(["node", "--check", str(p)], root) != 0

    print("\nVERIFICATION " + ("PASSED" if failures == 0 else f"FOUND {failures} FAILURE(S)"))
    raise SystemExit(0 if failures == 0 else 1)

if __name__ == "__main__":
    main()
