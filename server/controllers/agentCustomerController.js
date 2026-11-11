/**
 * Purpose: agent Customer Controller HTTP controller. Main declarations: isValidId, getAgentProfile, normalizeCustomerInput, createCustomer, getCustomers.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ../models/Customer.js so this module can use its exported dependencies.
import Customer from "../models/Customer.js";
// Load ../models/Agent.js so this module can use its exported dependencies.
import Agent from "../models/Agent.js";

// Declare isValidId for use by the surrounding module or function.
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Declare allowedCustomerFields for use by the surrounding module or function.
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

// Declare getAgentProfile for use by the surrounding module or function.
const getAgentProfile = async (req) =>
  Agent.findOne({
    user: req.user._id,
  });

// Declare normalizeCustomerInput for use by the surrounding module or function.
const normalizeCustomerInput = (body = {}) => {
  // Declare data for use by the surrounding module or function.
  const data = {};

  // Repeat the enclosed work for each required iteration.
  for (const field of allowedCustomerFields) {
    // Check the condition (body[field] !== undefined) and run the matching branch.
    if (body[field] !== undefined) {
      // Perform the side effect or state update expressed on the following line.
      data[field] = body[field];
    }
  }

  // The audited UI may send a single `name` field. Keep the model's
  // required firstName/lastName fields authoritative.
  // Check the condition (body.name && (!data.firstName || !data.lastName)) and run the matching branch.
  if (body.name && (!data.firstName || !data.lastName)) {
    // Declare parts for use by the surrounding module or function.
    const parts = String(body.name).trim().split(/\s+/);
    // Perform the side effect or state update expressed on the following line.
    data.firstName = data.firstName || parts.shift() || "";
    // Perform the side effect or state update expressed on the following line.
    data.lastName = data.lastName || parts.join(" ") || "";
  }

  // Check the condition (data.email) and run the matching branch.
  if (data.email) {
    // Perform the side effect or state update expressed on the following line.
    data.email = String(data.email).trim().toLowerCase();
  }

  // Check the condition (data.phone) and run the matching branch.
  if (data.phone) {
    // Perform the side effect or state update expressed on the following line.
    data.phone = String(data.phone).trim();
  }

  // Return the value of data to the caller.
  return data;
};

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER
|--------------------------------------------------------------------------
*/

// Declare createCustomer for use by the surrounding module or function.
export const createCustomer = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await getAgentProfile(req);

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare customerData for use by the surrounding module or function.
    const customerData = normalizeCustomerInput(req.body);

    // Check the condition (!customerData.firstName || !customerData.lastName) and run the matching branch.
    if (!customerData.firstName || !customerData.lastName) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    // Check the condition (!customerData.phone) and run the matching branch.
    if (!customerData.phone) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    // Check the condition (customerData.email) and run the matching branch.
    if (customerData.email) {
      // Declare existing for use by the surrounding module or function.
      const existing = await Customer.findOne(
        mergeTenantFilter({
          agent: agent._id,
          email: customerData.email,
          isDeleted: false,
        })
      );

      // Check the condition (existing) and run the matching branch.
      if (existing) {
        // Return the result of res.status(409).json() to the caller.
        return res.status(409).json({
          success: false,
          message: "Customer already exists.",
        });
      }
    }

    // Declare customer for use by the surrounding module or function.
    const customer = await Customer.create({
      ...customerData,
      agent: agent._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET CUSTOMERS
|--------------------------------------------------------------------------
*/

// Declare getCustomers for use by the surrounding module or function.
export const getCustomers = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await getAgentProfile(req);

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare page for use by the surrounding module or function.
    const page = Math.max(Number(req.query.page) || 1, 1);
    // Declare limit for use by the surrounding module or function.
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    // Declare skip for use by the surrounding module or function.
    const skip = (page - 1) * limit;

    // Declare filter for use by the surrounding module or function.
    const filter = mergeTenantFilter({
      agent: agent._id,
      isDeleted: false,
    });

    // Check the condition (req.query.status) and run the matching branch.
    if (req.query.status) {
      // Perform the side effect or state update expressed on the following line.
      filter.status = req.query.status;
    }

    // Check the condition (req.query.search) and run the matching branch.
    if (req.query.search) {
      // Declare search for use by the surrounding module or function.
      const search = String(req.query.search).trim();

      // Check the condition (search) and run the matching branch.
      if (search) {
        // Perform the side effect or state update expressed on the following line.
        filter.$or = [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }
    }

    // Declare [customers, total] for use by the surrounding module or function.
    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Customer.countDocuments(filter),
    ]);

    // Return the result of res.status(200).json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE CUSTOMER
|--------------------------------------------------------------------------
*/

// Declare getCustomer for use by the surrounding module or function.
export const getCustomer = async (req, res, next) => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // Declare agent for use by the surrounding module or function.
    const agent = await getAgentProfile(req);

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare customer for use by the surrounding module or function.
    const customer = await Customer.findOne(
      mergeTenantFilter({
        _id: req.params.id,
        agent: agent._id,
        isDeleted: false,
      })
    ).lean();

    // Check the condition (!customer) and run the matching branch.
    if (!customer) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE CUSTOMER
|--------------------------------------------------------------------------
*/

// Declare updateCustomer for use by the surrounding module or function.
export const updateCustomer = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // Declare agent for use by the surrounding module or function.
    const agent = await getAgentProfile(req);

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare update for use by the surrounding module or function.
    const update = normalizeCustomerInput(req.body);
    // Perform the side effect or state update expressed on the following line.
    update.updatedBy = req.user._id;

    // Declare customer for use by the surrounding module or function.
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

    // Check the condition (!customer) and run the matching branch.
    if (!customer) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Customer updated successfully.",
      customer,
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DELETE CUSTOMER
|--------------------------------------------------------------------------
*/

// Declare deleteCustomer for use by the surrounding module or function.
export const deleteCustomer = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!isValidId(req.params.id)) and run the matching branch.
    if (!isValidId(req.params.id)) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID.",
      });
    }

    // Declare agent for use by the surrounding module or function.
    const agent = await getAgentProfile(req);

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare customer for use by the surrounding module or function.
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

    // Check the condition (!customer) and run the matching branch.
    if (!customer) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Return the result of res.status(200).json() to the caller.
    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| CUSTOMER STATISTICS
|--------------------------------------------------------------------------
*/

// Declare getCustomerStats for use by the surrounding module or function.
export const getCustomerStats = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare agent for use by the surrounding module or function.
    const agent = await getAgentProfile(req);

    // Check the condition (!agent) and run the matching branch.
    if (!agent) {
      // Return the result of res.status(404).json() to the caller.
      return res.status(404).json({
        success: false,
        message: "Agent profile not found.",
      });
    }

    // Declare [total, active, vip, deleted] for use by the surrounding module or function.
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

    // Return the result of res.status(200).json() to the caller.
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
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
