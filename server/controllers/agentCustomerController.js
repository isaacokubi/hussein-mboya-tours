import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import Booking from "../models/Booking.js";
import Agent from "../models/Agent.js";/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const isValidId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

const allowedCustomerFields = [

    "name",

    "email",

    "phone",

    "country",

    "address",

    "customerType",

    "passportNumber",

    "nationality",

    "dateOfBirth",

    "notes"

];/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const createCustomer = async (req, res, next) => {
    try {

        const agent = await Agent.findOne({
            user: req.user._id
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: "Agent profile not found."
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Duplicate Email Check
        |--------------------------------------------------------------------------
        */

        if (req.body.email) {

            const existing =
                await Customer.findOne({

                    agent: agent._id,

                    email: req.body.email.toLowerCase()

                });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Customer already exists."
                });
            }

        }

        /*
        |--------------------------------------------------------------------------
        | Whitelist Fields
        |--------------------------------------------------------------------------
        */

        const customerData = {
            agent: agent._id
        };

        allowedCustomerFields.forEach(field => {

            if (req.body[field] !== undefined) {

                customerData[field] = req.body[field];

            }

        });

        if (customerData.email) {

            customerData.email =
                customerData.email
                    .trim()
                    .toLowerCase();

        }

        const customer =
            await Customer.create(customerData);

        res.status(201).json({

            success: true,

            customer

        });

    } catch (error) {

        next(error);

    }
};