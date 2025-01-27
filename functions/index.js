/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.sendNotification = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const message = {
        notification: {
          title: req.body.title,
          body: req.body.description,
        },
        tokens: req.body.tokens,
      };
      await admin.messaging().sendMulticast(message);
      return res.status(200).send({
        message: "Notification sent successfully.",
      });
    } catch (error) {
      return res.status(500).send({
        message: "Error sending notification.",
      });
    }
  });
});

