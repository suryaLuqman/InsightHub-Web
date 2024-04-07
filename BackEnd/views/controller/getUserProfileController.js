const axios = require("axios");
require("dotenv").config();

exports.getUserProfile = async (token) => {
   const baseUrl = process.env.API;
   console.log("token getUserProfile:", token);
   console.log("baseUrl getUserProfile:", baseUrl);
   const getProfileUrl = `${baseUrl}/api/v1/auth/profile`;
   try {
    const response = await axios.get(getProfileUrl,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
