import { mergeTenantFilter } from "../tenancy/context.js";
import mongoose from "mongoose";

import Customer from "../models/Customer.js";
import Agent from "../models/Agent.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const allowedCustomerFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "country",
  "address",
  "customerType",
  "passportNumber",
  "nationality",
  "dateOfBirth",
  "notes",
  "gender",
  "city",
  "county",
  "postalCode",
  "company",
  "jobTitle",
];

const getAgentProfile = async (req) =>
  Agent.findOne({
    user: req.user._id,
  });

const normalizeCustomerInput = (body = {}) => {
  const data = {};

  for (const field of allowedCustomerFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  // The audited UI may send a single `name` field. Keep the model's
  // required firstName/lastName fields authoritative.
  if (body.name && (!data.firstName || !data.lastName)) {
    const parts = String(body.name).trim().split(/\s+/);
    data.firstName = data.firstName || parts.shift() || "";
    data.lastName = data.lastName || parts.join(" ") || "";
  }

  if (data.email) {
    data.email = String(data.email).trim().toLowerCase();
  }

  if (data.phone) {
    data.phone = String(data.phone).trim();
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const createCustomer = async (req, res, next) => {
  try {
    const agent = await getAgentProfile(req);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const customerData = normalizeCustomerInput(req.body);

    if (!customerData.firstName || !customerData.lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    if (!customerData.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    if (customerData.email) {
      const existing = await Customer.findOne({
        agent: agent._id,
        email: customerData.email,
        isDeleted: false,
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Customer already exists.",
        });
      }
    }

    const customer = await Customer.create({
      ...customerData,
      agent: agent._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

export const getCustomers = async (req, res, next) => {
  try {
    const agent = await getAgentProfile(req);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const filter = {
      agent: agent._id,
      isDeleted: false,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const search = String(req.query.search).trim();

      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/

export const getCustomer = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const agent = await getAgentProfile(req);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const customer = await Customer.findOne({
      _id: req.params.id,
      agent: agent._id,
      isDeleted: false,
    }).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

export const updateCustomer = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const agent = await getAgentProfile(req);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const update = normalizeCustomerInput(req.body);
    update.updatedBy = req.user._id;

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        agent: agent._id,
        isDeleted: false,
      },
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

export const deleteCustomer = async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    const agent = await getAgentProfile(req);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        agent: agent._id,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
        updatedBy: req.user._id,
      },
      {
        new: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CUSTOMER STATISTICS
|--------------------------------------------------------------------------
*/

export const getCustomerStats = async (req, res, next) => {
  try {
    const agent = await getAgentProfile(req);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    const [total, active, vip, deleted] = await Promise.all([
      Customer.countDocuments({ agent: agent._id, isDeleted: false }),
      Customer.countDocuments({
        agent: agent._id,
        isDeleted: false,
        status: "active",
      }),
      Customer.countDocuments({
        agent: agent._id,
        isDeleted: false,
        customerType: "vip",
      }),
      Customer.countDocuments({ agent: agent._id, isDeleted: true }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        active,
        vip,
        deleted,
      },
    });
  } catch (error) {
    next(error);
  }
};
