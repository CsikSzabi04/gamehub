# Game Data Hub

**Game Data Hub** is a web application that allows users to discover and explore video games, view detailed game information, and purchase games from various online stores. The platform also includes user authentication, allowing users to log in, manage their favorite games, and get personalized recommendations.

## Live Demo
You can visit the application here: **[Game Data Hub](https://gamdatahub.netlify.app/)**

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

Let us know if you have any questions or suggestions! 🚀
