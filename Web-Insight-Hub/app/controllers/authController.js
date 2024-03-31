const axios = require('axios');
require('dotenv').config();

const baseUrl = process.env.API; // Mengambil base URL dari variabel lingkungan

exports.login = async (req, res) => {
   try {
      const endpoint = '/api/v1/auth/login'; // End point login
      const apiUrl = baseUrl + endpoint; // Menggabungkan base URL dengan end point
      
      // Logging the start of the function
      console.log('Login function started');

      // Logging the data received from the client
      const data = req.body;
      console.log('Received data from client:', data);

      const { email, password } = data;

      // Prepare data for the request to your API
      const postData = {
         email,
         password
      };
      console.log('postData:', postData);

      // Send data to your API
      const response = await axios.post(apiUrl, postData);

      // Check the response from your API
      const responseData = response.data;
      const statusCode = response.status;

      if (statusCode === 200) {
         console.log('Login successful. Response:', responseData);

         // Set session data
         req.session.token = responseData.data.token;
         req.session.user_first_name = responseData.data.profile.profile.first_name;
         req.session.user_id = responseData.data.profile.profile.id;

         // Redirect to dashboard or send response to client
         res.status(statusCode).json(responseData);
         console.log('Login successful. Redirecting to dashboard');
      } else {
         console.error('Login failed. Status Code:', statusCode, 'Response:', responseData);
         res.status(statusCode).json(responseData);
      }
   } catch (error) {
      console.error('Error during login:', error.message);
      res.status(500).json({ error: 'Internal server error' });
   }
};



exports.register = async (req, res) => {
   try {
      // Logging the start of the function
      console.log('Register function started');

      // Logging the data received from the client
      const data = req.body;
      console.log('Received data from client:', data);

      if (!data) {
         console.error("Failed to receive data from client.");
         return res.status(400).json({ message: 'Failed to receive data from client.' });
      }

      const { email, nama, password, phone, status } = data;

      // Prepare data for the request to your API
      const postData = {
         email,
         nama,
         password,
         no_hp: phone,
         status
      };
      console.log('postData:', postData);

      // Send data to your API
      const apiUrl = `${baseUrl}/api/v1/auth/register/user`; // Pastikan baseUrl telah didefinisikan sebelumnya
      const response = await axios.post(apiUrl, postData);

      // Check the response from your API
      const responseData = response.data;
      const statusCode = response.status;

      // Handle successful registration
      if (statusCode === 200) {
         console.log('Registration successful. Response:', responseData);
         return res.status(200).json(responseData);
      } else {
         if (responseData && responseData.message === "Email already in use") {
            // Handle case where email is already in use
            console.error('Registration failed. Email already in use.');
            return res.status(409).json({ message: 'Email sudah terdaftar, silahkan gunakan email lain.' });
         } else {
            // Handle other cases of registration failure
            console.error('Registration failed. Status Code:', statusCode, 'Response:', responseData);
            return res.status(500).json({
               message: responseData && responseData.message ? responseData.message : 'Unknown error',
               error: responseData && responseData.error ? responseData.error : 'Unknown error'
            });
         }
      }
   } catch (error) {
      console.error('Error during registration:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
   }
};

// logout
exports.logout = async (req, res) => {
   try {
      req.session.destroy();
      return res.status(200).json({ message: 'Logout successful' });
   } catch (error) {
      console.error('Error during logout:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
   }
}