const InstituteRequest = require("../models/instituteRequests");
const User = require("../models/user");
exports.getRequests = async (req, res) => {
  const { id } = req.params;
  if (req.user._id.toString() === id) {
    try {
      const superAdmin = await User.findById(id);
      if (!superAdmin) return res.json({ message: "Super admin not found" });
      const allRequests = await InstituteRequest.find();
      if (superAdmin && allRequests) {
        res.json({ superAdmin, message: "Requests fetched", allRequests });
        // console.log("Requests sent: ", allRequests);
      } else {
        res.status(404).json({ message: "No Requests yet" });
      }
    } catch (e) {
      console.log("error: ", e);
    }
  }
};
