const { contactUsEmail } = require("../templates/contactFormRes");
const { customizationQueryEmail } = require("../templates/customizationQuaery");
const orderConfirmationTemplate = require("../templates/orderCreate");
const orderStatusTemplate = require("../templates/orderTemlate");
const userVerificationTemplate = require("../templates/userVerificationTemplate");
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
      order.customerInfo.email,
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
      order.customerInfo.email,
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
exports.userNotificationCtrl = async (req, res) => {
  try {
    const { groupname, name, email } = req.body;


    // Ensure required fields are present
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required order details.",
      });
    }

    // Generate email content using the template
    const emailContent = userVerificationTemplate(groupname, name, email);

    // Send email
    await mailSender(
      "sppatel@9rx.com",
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


exports.contactCtrl = async (req, res) => {
  const { name, email, contact, message } = req.body;
  try {

    if (!name || !contact) {
      return res.status(500).send({
        message: "Plase provide all fields",
        success: false
      })
    }

    const emailRes = await mailSender(
         "sppatel@9rx.com",
      "Your Data send successfully",
      contactUsEmail(name, email, contact, message)
    )
    res.status(200).send({
      message: "Email send successfully.Our team will contact you soon!",
      emailRes,
      success: true
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message: "Error in sending email",
    })
  }
}


exports.customization = async (req, res) => {
  const { name, email, phone, selectedProducts } = req.body;
  try {

    if (!name || !phone) {
      return res.status(500).send({
        message: "Plase provide all fields",
        success: false
      })
    }

    const emailRes = await mailSender(
         "vikasmaheshwari6267@gmail.com",
      "Your Data send successfully",
      customizationQueryEmail(name, email, phone, selectedProducts)
    )
    res.status(200).send({
      message: "Email send successfully.Our team will contact you soon!",
      emailRes,
      success: true
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message: "Error in sending email",
    })
  }
}
