# Game Data Hub

**Game Data Hub** is a web application that allows users to discover and explore video games, view detailed game information, and purchase games from various online stores. The platform also includes user authentication, allowing users to log in, manage their favorite games, and get personalized recommendations.

## Live Demo
You can visit the application here: **[Game Data Hub](https://gamhub.netlify.app/)**

---

## Features

- **Game Discovery**: Browse through a vast catalog of games categorized by genres such as Action, Sci-Fi, Multiplayer, and more.
- **User Authentication**: Users can log in using their credentials and manage their favorite games.
- **Game Details**: View detailed information about each game, including system requirements, description, and tags.
- **Favorite Games**: Mark games as favorites and easily view them later.
- **Store Integration**: Access various online stores where users can purchase games.
- **Search Functionality**: Search for games by name and explore game categories and genres.
- **Responsive Design**: The platform is fully responsive and optimized for use on both desktop and mobile devices.

---

## Technologies Used

- **Frontend:** React, TailwindCSS, React Router, Context API
- **Backend:** Node.js, Express.js (for API calls and game data management)
- **Database:** Firebase Firestore (for user authentication and favorites management)
- **External APIs:** Game data API for fetching game details and store information
- **Version Control:** Git & GitHub

---

## System Overview

### Core Architecture
- **Frontend:** React-based, handles UI rendering and API calls.
- **Backend:** Express.js API that fetches game data and user preferences.
- **Database:** Firebase Firestore for authentication and storing user favorites.
- **External APIs:** Integrates with external game databases and store APIs for real-time information.

### Workflow Diagram
*(You can add a diagram showing the interaction between frontend, backend, and APIs here.)*

---

## Application Structure

### 1. **Body Component (`Body.jsx`)**

The `Body` component is the main UI section where users browse games and view details.

#### Features:
- Displays categorized games (Multiplayer, Sci-Fi, Action, etc.).
- Allows users to click on games to view details.
- Handles authentication and user actions (login/logout, adding favorites).
- Lists external stores where users can buy games.

#### Key Functions:
- `categorizeGames()`: Categorizes the games into different genres.
- `showGameDetails()`: Displays detailed information about a selected game.
- `handleLogout()`: Logs the user out of the app.
- `openStoreUrl()`: Opens a specific game store in a new tab.

### 2. **Login Component (`Login.jsx`)**

The `Login` component handles user authentication.

#### Features:
- Login form with email and password fields.
- Error handling for incorrect credentials.
- Redirects users upon successful login.
- Link to the sign-up page for new users.

#### Key Functions:
- `login()`: Handles Firebase Authentication login process.

---

## Setup Instructions

### Prerequisites
Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Clone the Repository

1. Clone this repository to your local machine:

    ```bash
    git clone https://github.com/your-username/game-data-hub.git
    cd game-data-hub
    ```

2. Install the necessary dependencies:

    ```bash
    pnpm i
    ```

### Firebase Setup

To use Firebase Authentication and Firestore, you need to set up Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project and enable Firebase Authentication and Firestore.
3. Copy your Firebase configuration and create a `firebaseConfig.js` file in the `src` directory:

    ```javascript
    // src/firebaseConfig.js
    export const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

4. Ensure that Firebase Authentication and Firestore are correctly set up in your Firebase Console.

### Running the Application

1. Start the development server:

    ```bash
    pnpm run dev
    ```

2. Visit `http://localhost:5173` in your browser to view the application.

---

## Testing Strategy

- **Unit Testing:** Jest for testing React components.
- **Integration Testing:** API calls and database interactions.
- **User Acceptance Testing:** End-user testing for usability and experience.

---

## Challenges & Solutions

- **Challenge:** Synchronizing data between the frontend and backend.
  - **Solution:** Used React Context API and Firebase Firestore for real-time updates.
- **Challenge:** Integrating multiple store APIs with different data formats.
  - **Solution:** Created standardized functions to parse and display store information.

---

## Future Enhancements

- Add more filtering options for better game discovery.
- Improve UI/UX based on user feedback.
- Expand store integrations to include more game marketplaces.

---

## Contributing

We welcome contributions to the **Game Data Hub** project! Here’s how you can contribute:

1. **Fork** the repository.
2. **Create** a new branch for your feature or bug fix.
3. **Commit** your changes and push to your fork.
4. **Submit** a pull request against the main repository.

Ways to contribute:
- Report and fix bugs.
- Suggest new features.
- Improve documentation.
- Review pull requests.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Let us know if you have any questions or suggestions! 🚀

