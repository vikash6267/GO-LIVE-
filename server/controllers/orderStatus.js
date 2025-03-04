const orderConfirmationTemplate = require("../templates/orderCreate");
const orderStatusTemplate = require("../templates/orderTemlate");
const mailSender = require("../utils/mailSender");


exports.orderSatusCtrl = async (req, res) => {
  try {
    const order = req.body;

   
    // Ensure required fields are present
    if (!order || !order.customerInfo || !order.customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: "Missing required order details.",
      });
    }

    // Generate email content using the template
    const emailContent = orderStatusTemplate(order);

    // Send email
    await mailSender(
      "vikasmaheshwari6267@gmail.com",
      "Order Status Update",
      emailContent
    );

    return res.status(200).json({
      success: true,
      message: "Order status email sent successfully!",
    });
  } catch (error) {
    console.error("Error in Order Status Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in Order Status",
      error: error.message,
    });
  }
};


exports.orderPlacedCtrl = async (req, res) => {
  try {
    const order = req.body;

   
    // Ensure required fields are present
    if (!order || !order.customerInfo || !order.customerInfo.email) {
      return res.status(400).json({
        success: false,
        message: "Missing required order details.",
      });
    }

    // Generate email content using the template
    const emailContent = orderConfirmationTemplate(order);

    // Send email
    await mailSender(
      "vikasmaheshwari6267@gmail.com",
      "Order Placed ",
      emailContent
    );

    return res.status(200).json({
      success: true,
      message: "Order status email sent successfully!",
    });
  } catch (error) {
    console.error("Error in Order Status Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong in Order Status",
      error: error.message,
    });
  }
};



