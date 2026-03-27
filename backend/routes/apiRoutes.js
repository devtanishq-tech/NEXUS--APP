const express = require("express");
const router = express.Router();
const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/dataController");
const { ensureAuthenticated } = require("../middleware/auth");

// All API routes require authentication
router.use(ensureAuthenticated);
router.route("/data").get(getAllItems).post(createItem);
router.route("/data/:id").put(updateItem).delete(deleteItem);

module.exports = router;
