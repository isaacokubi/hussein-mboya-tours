from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os


# ==============================
# MongoDB CONNECTION
# ==============================

MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "YOUR_MONGODB_CONNECTION_STRING_HERE"
)

DATABASE_NAME = "husseindb"

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

payments = db.payments
bookings = db.bookings


print("\n===================================")
print(" PAYMENT / BOOKING SYNC STARTED")
print("===================================\n")


# ==============================
# FIND COMPLETED PAYMENTS
# ==============================

completed_payments = payments.find({
    "status": "completed"
})


updated = 0
missing_booking = 0
already_synced = 0


for payment in completed_payments:

    booking_id = payment.get("booking")

    if not booking_id:
        print(
            "⚠ Payment has no booking:",
            payment["_id"]
        )
        continue


    # Convert string ids safely
    if isinstance(booking_id, str):
        booking_id = ObjectId(booking_id)


    booking = bookings.find_one({
        "_id": booking_id
    })


    if not booking:

        print(
            "❌ Booking missing:",
            booking_id
        )

        missing_booking += 1
        continue



    if booking.get("paymentStatus") == "completed":

        already_synced += 1

        print(
            "✓ Already synced:",
            booking_id
        )

        continue



    receipt = (
        payment.get("transactionReference")
        or payment.get("merchantRequestID")
        or payment.get("checkoutRequestID")
        or ""
    )


    result = bookings.update_one(
        {
            "_id": booking_id
        },
        {
            "$set": {

                "paymentStatus": "completed",

                "status": "confirmed",

                "mpesaReceipt": receipt,

                "updatedAt": datetime.utcnow()

            }
        }
    )


    if result.modified_count:

        updated += 1

        print(
            "✅ Updated booking:",
            booking_id,
            "| Amount:",
            payment.get("amount")
        )



print("\n===================================")
print(" SYNC REPORT")
print("===================================")

print(
    "Updated bookings:",
    updated
)

print(
    "Already synced:",
    already_synced
)

print(
    "Missing bookings:",
    missing_booking
)


print("\nDone.")