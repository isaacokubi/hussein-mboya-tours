#!/usr/bin/env python3
from __future__ import annotations
import argparse, json, os, re, shutil, subprocess
from pathlib import Path

EXTS = {".js", ".jsx", ".mjs", ".cjs"}

def resolve_import(base: Path, spec: str):
    p = (base / spec).resolve()
    candidates = [
        p, p.with_suffix(".js"), p.with_suffix(".jsx"),
        p.with_suffix(".mjs"), p.with_suffix(".json"),
        p / "index.js", p / "index.jsx",
    ]
    return next((x for x in candidates if x.exists()), None)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--root", default=".")
    root = Path(ap.parse_args().root).resolve()

    print(f"\nAUDITING: {root}\n")
    missing, markers, assets = [], [], []

    for p in root.rglob("*"):
        if not p.is_file() or "node_modules" in p.parts:
            continue
        if p.suffix.lower() not in EXTS:
            continue
        text = p.read_text(errors="ignore")

        for spec in re.findall(r'(?:from\s+|import\s*\(\s*)["\'](\.[^"\']+)["\']', text):
            if resolve_import(p.parent, spec) is None:
                missing.append((p.relative_to(root), spec))

        for i, line in enumerate(text.splitlines(), 1):
            if re.search(r"\b(TODO|FIXME|NOT IMPLEMENTED|IMPLEMENT ME)\b", line, re.I):
                markers.append((p.relative_to(root), i, line.strip()))

        for spec in re.findall(r'["\'](/(?:images|destinations|gallery|videos|uploads)[^"\']+)["\']', text):
            if not (root / "client" / "public" / spec.lstrip("/")).exists():
                assets.append((p.relative_to(root), spec))

    print("== Missing relative imports ==")
    for x in missing or [("none", "")]:
        print("  none" if x[0] == "none" else f"  {x[0]}: {x[1]}")

    print("\n== TODO/FIXME markers ==")
    for x in markers or [("none", 0, "")]:
        print("  none" if x[0] == "none" else f"  {x[0]}:{x[1]}: {x[2]}")

    print("\n== Missing referenced public assets ==")
    for x in assets or [("none", "")]:
        print("  none" if x[0] == "none" else f"  {x[0]}: {x[1]}")

    print("\n== Node syntax checks (.js only) ==")
    node = shutil.which("node")
    if not node:
        print("  node not found; skipped")
    else:
        bad = 0
        for p in root.rglob("*.js"):
            if "node_modules" in p.parts:
                continue
            r = subprocess.run([node, "--check", str(p)], capture_output=True, text=True)
            if r.returncode:
                bad += 1
                print(f"  FAIL: {p.relative_to(root)}")
                print("    " + r.stderr.strip().replace("\n", "\n    "))
        print(f"  {'No failures' if bad == 0 else f'{bad} file(s) failed'}")

    for rel in ("client/package.json", "server/package.json"):
        p = root / rel
        print(f"\n== {rel} ==")
        if not p.exists():
            print("  MISSING")
        else:
            try:
                data = json.loads(p.read_text())
                print(f"  name: {data.get('name')}")
                print(f"  scripts: {data.get('scripts', {})}")
            except Exception as e:
                print(f"  INVALID JSON: {e}")

if __name__ == "__main__":
    main()
