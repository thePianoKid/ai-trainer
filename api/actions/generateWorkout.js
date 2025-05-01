import { ActionOptions } from "gadget-server";
import axios from "axios";

export const params = {
  userMetadata: {
    type: "object",
    required: ["sex", "weight", "height", "experienceLevelMap"],
    properties: {
      sex: {
        type: "string",
        enum: ["Male", "Female"],
      },
      weight: {
        type: "number",
      },
      height: {
        type: "number",
      },
      experienceLevelMap: {
        type: "object",
        required: ["weight_training", "cycling", "running"],
        properties: {
          weight_training: {
            type: "string",
            enum: ["No Interest", "Beginner", "Intermediate", "Advanced"],
          },
          cycling: {
            type: "string",
            enum: ["No Interest", "Beginner", "Intermediate", "Advanced"],
          },
          running: {
            type: "string",
            enum: ["No Interest", "Beginner", "Intermediate", "Advanced"],
          },
        },
      },
    },
  },
};

export const run = async ({ params, logger, api }) => {
  console.log("user meata data:");
  console.log(params.userMetadata);
  try {
    // Make request to workout API
    const response = await axios.post(
      "https://train-ai-api-1.onrender.com/workout",
      params.userMetadata,
      {
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    logger.info("AI API response");
    console.log(response.data);

    // Validate response structure
    if (!response.data || !Array.isArray(response.data)) {
      logger.error(
        "Invalid response structure from workout API",
        response.data
      );
      throw new Error("Invalid response from workout API");
    }

    // TODO: wait until the new records have successfully been created, then delete the old ones... 
    // const records = await api.activity.findMany();
    // await Promise.all(records.map(record => api.activity.deleteRecord(record.id)));

    // Create activities from API response
    const createdActivities = await Promise.all(
      response.data.map((activity) =>
        api.activity.create({
          activityName: activity.activityName,
          description: activity.description,
          sets: activity.sets,
          reps: activity.reps,
          day: activity.day,
          percentComplete: 0,
        })
      )
    );

    logger.info("Successfully created workout activities", {
      count: createdActivities.length,
    });

    return createdActivities;
  } catch (error) {
    logger.error("Error generating workout", error);
    throw new Error("Failed to generate workout plan");
  }
};

export const options = {
  returnType: true,
  triggers: { api: true },
};
