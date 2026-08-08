import os
import re
import shutil
from datetime import datetime


CONTROLLER = "controllers/adminDashboardController.js"
PAYMENT_MODEL = "models/Payment.js"


def backup_file(path):
    if os.path.exists(path):
        backup = f"{path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        shutil.copy(path, backup)
        print(f"Backup created: {backup}")


def fix_dashboard_controller():

    if not os.path.exists(CONTROLLER):
        print("Missing:", CONTROLLER)
        return

    with open(CONTROLLER, "r") as f:
        content = f.read()


    if 'require("../models/Payment")' not in content:

        content = (
            'const Payment = require("../models/Payment");\n'
            + content
        )

        print("Added Payment import")


    new_payment_block = r'''
const paymentStats = await Payment.aggregate([
    {
        $group:{
            _id:"$status",
            count:{
                $sum:1
            },
            amount:{
                $sum:"$amount"
            }
        }
    }
]);


const completedPayments =
    paymentStats.find(
        p => p._id === "completed"
    ) || {
        count:0,
        amount:0
    };


const pendingPayments =
    paymentStats.find(
        p => p._id === "pending"
    ) || {
        count:0,
        amount:0
    };


const failedPayments =
    paymentStats.find(
        p => p._id === "failed"
    ) || {
        count:0,
        amount:0
    };


const paymentRevenue = {
    total: completedPayments.amount,
    completed: completedPayments.count,
    pending: pendingPayments.count,
    failed: failedPayments.count
};
'''


    pattern = re.compile(
        r'const paymentRevenue\s*=\s*await Payment\.aggregate\(\[[\s\S]*?\]\);',
        re.MULTILINE
    )


    if pattern.search(content):

        content = pattern.sub(
            new_payment_block.strip(),
            content
        )

        print("Payment aggregation replaced")

    else:

        print(
            "Old aggregation not found. Adding block manually."
        )

        content += "\n" + new_payment_block


    with open(CONTROLLER, "w") as f:
        f.write(content)



def fix_payment_model():

    if not os.path.exists(PAYMENT_MODEL):
        print("Missing:", PAYMENT_MODEL)
        return


    with open(PAYMENT_MODEL, "r") as f:
        content = f.read()


    if 'collection' not in content:

        insert = '''
        
paymentSchema.set(
    "collection",
    "payments"
);

'''

        content = content.replace(
            "module.exports",
            insert + "\nmodule.exports"
        )

        print("Added payments collection mapping")

    else:

        print("Collection mapping already exists")


    with open(PAYMENT_MODEL, "w") as f:
        f.write(content)



def main():

    print("Starting payment dashboard fix...\n")


    backup_file(CONTROLLER)
    backup_file(PAYMENT_MODEL)


    fix_dashboard_controller()
    fix_payment_model()


    print("\nDONE")
    print("Restart backend:")
    print("npm run dev")


if __name__ == "__main__":
    main()
