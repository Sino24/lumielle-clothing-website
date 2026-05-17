
const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
  {
    headline: { type: String, default: "Crafted for those who wear their light" },
    lead: { type: String, default: "" },
    storyHeading: { type: String, default: "" },
    storyBody: { type: String, default: "" },
    storyBody2: { type: String, default: "" },
    studioImageUrl: { type: String, default: "" },
    founderImageUrl: { type: String, default: "" },
    founderQuote: { type: String, default: "" },
    founderNote: { type: String, default: "" },
    founderName: { type: String, default: "Lumielle Studio" },
    values: [{ number: String, title: String, body: String }],
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
  },
  { timestamps: true }
);

const About = mongoose.model("About", aboutSchema);

module.exports = About;
