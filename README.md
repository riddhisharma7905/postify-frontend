# Postify Frontend

This is the frontend of the Postify SaaS platform, a modern social media management tool.

## 🌟 Features

- **Dashboard**: A clean and modern user dashboard with analytics.
- **Post Creation**: Intuitive interface for creating new social media posts.
- **Analytics Visualization**: Interactive charts for engagement and post performance.
- **Responsive Design**: Built with Lucide icons and Tailwind CSS for a premium feel.
- **User Profiles**: Manage profiles and follow other authors.
- **Social Features**: Commenting and liking posts with nested reply support.

## 🛠 Tech Stack

- **React**: Modern JavaScript library for building user interfaces.
- **React Router**: For handling client-side routing.
- **Tailwind CSS**: Utility-first CSS framework for rapid styling.
- **Axios**: Promised-based HTTP client for API communication.
- **Lucide React**: Clean and consistent icon library.
- **Recharts**: powerful, composable charting library.

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd frontend1
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root of the `frontend1` directory and add the following:
   ```env
   REACT_APP_API_URL=http://localhost:5001
   REACT_APP_BACKEND_URL=http://localhost:5001
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```
   The application will start running on `http://localhost:3000`.

## 📜 Available Scripts

- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm test`: Launches the test runner.

## 📄 License

This project is licensed under the ISC License.
