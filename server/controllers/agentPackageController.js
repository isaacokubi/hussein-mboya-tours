import TourPackage from "../models/TourPackage.js";

/*
|--------------------------------------------------------------------------
| GET AGENT TOUR PACKAGES
|--------------------------------------------------------------------------
|
| Agents select packages created by Admin/Tour Manager.
|
| Agent cannot modify prices.
|
*/

export const getAgentPackages = async (req, res) => {
  try {
    const {
      search,

      category,

      destination,

      featured,

      page = 1,

      limit = 12,
    } = req.query;

    const filter = {
      status: "active",
    };

    /*
|--------------------------------------------------------------------------
| FILTERS
|--------------------------------------------------------------------------
*/

    if (category) {
      filter.category = category;
    }

    if (destination) {
      filter.destination = destination;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,

            $options: "i",
          },
        },

        {
          destination: {
            $regex: search,

            $options: "i",
          },
        },
      ];
    }

    /*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

    const skip = (Number(page) - 1) * Number(limit);

    const packages = await TourPackage.find(filter)

      .select(
        "title slug destination category duration coverImage gallery agentPrice basePrice currency availableSeats maxGuests featured",
      )

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await TourPackage.countDocuments(filter);

    res.json({
      success: true,

      pagination: {
        total,

        page: Number(page),

        pages: Math.ceil(total / limit),
      },

      packages,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE PACKAGE DETAILS
|--------------------------------------------------------------------------
*/

export const getPackageDetails = async (req, res) => {
  try {
    const packageData = await TourPackage.findOne({
      _id: req.params.id,

      status: "active",
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,

        message: "Tour package not found",
      });
    }

    /*
|--------------------------------------------------------------------------
| INCREASE PACKAGE VIEWS
|--------------------------------------------------------------------------
*/

    packageData.views += 1;

    await packageData.save();

    res.json({
      success: true,

      package: packageData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
