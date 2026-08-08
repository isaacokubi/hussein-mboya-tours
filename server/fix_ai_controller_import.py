from pathlib import Path
import shutil
from datetime import datetime


route = Path("routes/aiRoutes.js")

backup = Path(
    f"../.ai-controller-import-backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
)

backup.mkdir(exist_ok=True)

shutil.copy2(route, backup / "aiRoutes.js")


text = route.read_text()


if "controllers/aiController.js" not in text:

    lines = text.splitlines()

    insert_at = 0

    for i,line in enumerate(lines):
        if line.startswith("import"):
            insert_at = i + 1


    lines.insert(
        insert_at,
        '\nimport { askAI } from "../controllers/aiController.js";'
    )

    text="\n".join(lines)


route.write_text(text + "\n")


print("AI controller import restored")
print("Backup:", backup)
