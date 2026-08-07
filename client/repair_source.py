#!/usr/bin/env python3

from pathlib import Path
import re
import shutil
import subprocess
import sys
from datetime import datetime

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"

if not SRC.exists():
    sys.exit("ERROR: client/src was not found.")

BACKUP = ROOT / f"src-repair-backup-{datetime.now():%Y%m%d-%H%M%S}"
shutil.copytree(SRC, BACKUP)

print(f"Backup: {BACKUP}")


def read(rel):
    return (SRC / rel).read_text(encoding="utf-8")


def write(rel, text):
    path = SRC / rel
    path.write_text(text, encoding="utf-8")
    print(f"FIXED  {rel}")


def replace(rel, old, new, count=1):
    text = read(rel)

    if old not in text:
        print(f"SKIP   {rel}: pattern not found")
        return False

    text = text.replace(old, new, count)
    write(rel, text)
    return True


# ---------------------------------------------------------------------
# 1. PaymentAnalytics.jsx
# ---------------------------------------------------------------------

replace(
    "components/admin/dashboard/PaymentAnalytics.jsx",
    """value={
paymentStats.pending
}""",
    """value={
payments.pending
}""",
)

replace(
    "components/admin/dashboard/PaymentAnalytics.jsx",
    """value={
paymentStats.failed
}""",
    """value={
payments.failed
}""",
)


# ---------------------------------------------------------------------
# 2. DestinationDetails.jsx
# ---------------------------------------------------------------------

replace(
    "pages/DestinationDetails.jsx",
    'import {useParams,Link} from "react-router-dom";',
    'import {useParams,Link,useNavigate} from "react-router-dom";',
)

text = read("pages/DestinationDetails.jsx")

if "const navigate = useNavigate();" not in text:
    marker = 'const {slug}=useParams();'
    text = text.replace(
        marker,
        marker + '\n\nconst navigate = useNavigate();',
        1,
    )
    write("pages/DestinationDetails.jsx", text)


# ---------------------------------------------------------------------
# 3. TourAnalytics.jsx
# ---------------------------------------------------------------------

text = read("pages/tourManager/TourAnalytics.jsx")

if 'from "../../api/analyticsApi"' not in text:
    text = text.replace(
        'import { useQuery } from "@tanstack/react-query";',
        'import { useQuery } from "@tanstack/react-query";\nimport { getAnalytics } from "../../api/analyticsApi";',
        1,
    )
    write("pages/tourManager/TourAnalytics.jsx", text)


# ---------------------------------------------------------------------
# 4. AdminPayments.jsx
# ---------------------------------------------------------------------

text = read("pages/admin/payments/AdminPayments.jsx")

if "refundPayment" not in text.split("export default", 1)[0]:
    text = text.replace(
        """getPaymentStats,
  updatePaymentStatus""",
        """getPaymentStats,
  updatePaymentStatus,
  refundPayment""",
        1,
    )
    write("pages/admin/payments/AdminPayments.jsx", text)


# ---------------------------------------------------------------------
# 5. BookingManagement.jsx
# ---------------------------------------------------------------------

text = read("pages/admin/BookingManagement.jsx")

if "requestRefund" not in text.split("export default", 1)[0]:
    # financeApi already contains the correct API implementation.
    imports = re.findall(
        r'import[\s\S]*?from\s+["\'][^"\']+["\'];',
        text,
    )

    target = 'import { requestRefund } from "../../api/financeApi";'

    if target not in text:
        # Try to place it immediately after the existing imports.
        matches = list(re.finditer(
            r'from\s+["\'][^"\']+["\'];',
            text
        ))

        if matches:
            pos = matches[-1].end()
            text = text[:pos] + "\n" + target + text[pos:]
        else:
            text = target + "\n" + text

        write("pages/admin/BookingManagement.jsx", text)


# ---------------------------------------------------------------------
# 6. M-Pesa transactions
# ---------------------------------------------------------------------

text = read("pages/admin/finance/MpesaTransactions.jsx")

# The API response is normalized into `payments`.
# The JSX incorrectly refers to `transactions`.
if "const transactions =" not in text:
    text = text.replace(
        """const payments =

        data?.payments ||

        data?.data?.payments ||

        [];""",
        """const payments =

        data?.payments ||

        data?.data?.payments ||

        [];

    const transactions = payments;""",
        1,
    )

# Remove accidental duplicated heading.
text = text.replace(
    """M-Pesa Transactions
                M-Pesa Transactions""",
    """M-Pesa Transactions""",
)

write("pages/admin/finance/MpesaTransactions.jsx", text)


# ---------------------------------------------------------------------
# 7. CategoriesSection / DestinationsSection / AddVehicleModal
#
# Move function declarations above effects so the React compiler does
# not flag access-before-declaration.
# ---------------------------------------------------------------------

def move_function_before_effect(rel, function_name, pattern):
    text = read(rel)

    # Find the const function declaration.
    start = text.find(f"const {function_name} = async")
    if start == -1:
        print(f"SKIP   {rel}: {function_name} declaration not found")
        return

    # Find its terminating `};`
    end = text.find("};", start)
    if end == -1:
        print(f"SKIP   {rel}: end of {function_name} not found")
        return

    end += 2

    function_block = text[start:end]

    # Remove original function.
    remaining = text[:start] + text[end:]

    # Put function immediately before first useEffect.
    effect_pos = remaining.find(pattern)

    if effect_pos == -1:
        print(f"SKIP   {rel}: useEffect not found")
        return

    remaining = (
        remaining[:effect_pos]
        + function_block
        + "\n\n"
        + remaining[effect_pos:]
    )

    write(rel, remaining)


move_function_before_effect(
    "components/admin/AddVehicleModal.jsx",
    "loadDrivers",
    "useEffect(() =>",
)

move_function_before_effect(
    "components/home/CategoriesSection.jsx",
    "loadCategories",
    "useEffect(() =>",
)

move_function_before_effect(
    "components/home/DestinationsSection.jsx",
    "loadDestinations",
    "useEffect(() =>",
)


# ---------------------------------------------------------------------
# 8. Verify syntax/build.
# ---------------------------------------------------------------------

print("\n" + "=" * 70)
print("ESLINT")
print("=" * 70)

lint = subprocess.run(
    ["npx", "eslint", "src"],
    cwd=ROOT,
)

print("\n" + "=" * 70)
print("PRODUCTION BUILD")
print("=" * 70)

build = subprocess.run(
    ["npm", "run", "build"],
    cwd=ROOT,
)

print("\n" + "=" * 70)

if build.returncode == 0:
    print("BUILD: PASS")
else:
    print("BUILD: FAIL")

print("=" * 70)

if lint.returncode != 0:
    print(
        "\nESLint still reports issues. "
        "These should be handled from the new report rather than "
        "blindly disabling rules."
    )

sys.exit(0 if build.returncode == 0 else 1)
