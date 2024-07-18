
# Node Express Backend Boilerplate

This boilerplate provides a foundation for building a Node.js backend server using Express. It includes user authentication features such as user signup and signin. Additionally, it is designed to seamlessly deploy on Vercel for easy scalability and hosting.

## Features

- User signup: Register new users with unique usernames and passwords.
- User signin: Allow registered users to authenticate and access protected resources.
- User referral: User can refer someone and check if user signup by referral.
- User Authentication: Secure routes and endpoints using JWT (JSON Web Tokens) for authentication.
- Vercel deployment: Optimized for deployment on the Vercel platform for seamless hosting and scalability.

## Technologies Used

- **Node.js**: A JavaScript runtime environment for building scalable and efficient server-side applications.
- **Express.js**: A minimalist web framework for Node.js, providing a robust set of features for web and mobile applications.
- **JWT (JSON Web Tokens)**: A compact, URL-safe means of representing claims to be transferred between two parties. It's used for securing routes and endpoints.
- **Vercel**: A cloud platform for static sites and Serverless Functions, providing seamless deployment and scalability.

## Getting Started

1. **Clone the repository**:

   ```
   git clone https://github.com/dapp-sculptor/node-express-boilerplate.git
   ```

2. **Install dependencies**:

   ```
   cd your-project
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory of your project and add the following variables:

   ```
   # JWT token secret key
   JWT_SECRET = 

   # DB CONFIGURATION
   DB_NAME = 
   DB_USERNAME = 
   DB_PASSWORD = 
   DB_HOST = 
   DB_PORT = 

   # PORT
   PORT = 
   ```

4. **Start the server**:

   ```
   npm start
   ```

   This will start the server at `http://localhost:9000` by default.

## Usage

- **Signup Endpoint**:
  - Endpoint: `POST /api/signup`
  - Request body:
    ```json
    {
      "username": "example",
      "email": "example",
      "password": "example",
      "encodedReferrer": "example"
    }
    ```
- **Signin Endpoint**:
  - Endpoint: `POST /api/signin`
  - Request body:
    ```json
    {
      "username": "example",
      "password": "password"
    }
    ```

## Deployment on Vercel

To deploy your backend on Vercel:

1. Sign up or log in to your Vercel account.
2. Import your project repository.
3. Follow the Vercel deployment instructions.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for any improvements or feature requests.
