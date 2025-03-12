# Game Data Hub

**Game Data Hub** is a web application that allows users to discover and explore video games, view detailed game information, and purchase games from various online stores. The platform also includes user authentication, allowing users to log in, manage their favorite games, and get personalized recommendations.
<br/><br/>You can visit it here with this link --> https://gamhub.netlify.app/

## Features

- **Game Discovery**: Browse through a vast catalog of games categorized by genres such as Action, Sci-Fi, Multiplayer, and more.
- **User Authentication**: Users can log in using their credentials and manage their favorite games.
- **Game Details**: View detailed information about each game, including system requirements, description, and tags.
- **Favorite Games**: Mark games as favorites and easily view them later.
- **Store Integration**: Access various online stores where users can purchase games.
- **Search Functionality**: Search for games by name and explore game categories and genres.
- **Responsive Design**: The platform is fully responsive and optimized for use on both desktop and mobile devices.

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **Firebase Authentication**: Service for handling user authentication (sign up, log in, sign out).
- **TailwindCSS**: Utility-first CSS framework for custom design.
- **React Router**: For client-side routing between pages.
- **React Context API**: For managing user state across the application.
- **Custom API**: Fetches game data, store information, and user-specific data from a backend server.

## Application Structure

### 1. **Body Component (`Body.jsx`)**

The `Body` component is the core part of the UI, displaying a variety of game categories and sections. It includes:
- **Main Section**: Displays a curated list of featured games, and categorized games like Free, Multiplayer, Sci-Fi, etc.
- **Game Details Modal**: Opens when a user clicks on a game to view detailed information about the game.
- **Stores Footer**: Lists external stores where users can purchase games.
- **Favorites Modal**: Displays and manages a user’s favorite games.
- **Responsive Navigation**: Includes a mobile-friendly navigation menu with options for stores, favorites, and user login/logout.

#### Key Functions:
- `categorizeGames()`: Categorizes the games into different genres like Multiplayer, Sci-Fi, Action, etc.
- `showGameDetails()`: Displays detailed information about a selected game, including system requirements.
- `handleLogout()`: Logs the user out of the app.
- `openStoreUrl()`: Opens the URL of a specific game store in a new tab.

### 2. **Login Component (`Login.jsx`)**

The `Login` component is where users authenticate themselves by entering their email and password. It includes:
- **Login Form**: Fields for email and password input.
- **Error Handling**: Displays an error message when incorrect login credentials are entered.
- **Redirecting Users**: After successful login, users are redirected to the home page.

#### Key Functions:
- `login()`: Handles the login process using Firebase Authentication.
- **Link to Sign-Up**: Provides a link to the sign-up page for users who don't have an account.

## Setup Instructions

### Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (or [yarn](https://yarnpkg.com/))

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

2. Visit `http://localhost:3000` in your browser to view the application.

## Contributing

We welcome contributions to the **Game Data Hub** project! Here are some ways you can contribute:
- **Bug Fixes**: Help resolve any reported issues.
- **Feature Requests**: Suggest new features or improvements.
- **Code Review**: Review pull requests from other contributors.

To contribute:
1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes and push to your fork.
4. Open a pull request against the main repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Feel free to update any placeholder text or customize this as needed for your project!

Let me know if you'd like to make any changes!
