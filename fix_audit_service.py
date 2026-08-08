from pathlib import Path
import re
import shutil
from datetime import datetime

file = Path("server/services/auditService.js")

backup = Path(
    ".audit-fix-backup-" +
    datetime.now().strftime("%Y%m%d-%H%M%S")
)

backup.mkdir()

shutil.copy2(
    file,
    backup / "auditService.js"
)

text = file.read_text(encoding="utf-8")


# remove duplicate empty blocks left by previous repair
text = re.sub(
    r"\nexport const createAuditLog\s*=\s*async\s*\(data\)\s*=>\s*\{\s*return\s*\{\s*success:\s*true,\s*data\s*\};\s*\};\s*$",
    "",
    text,
    flags=re.S
)


# remove excessive closing braces at file end
text = text.rstrip()

while text.endswith("};\n};") or text.endswith("};};"):
    text = text[:-3].rstrip()


file.write_text(
    text + "\n",
    encoding="utf-8"
)

print("auditService repaired")
print("Backup:", backup)
