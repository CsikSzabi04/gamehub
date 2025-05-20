# Game Data Hub (*Under Development*)

The **Game Data Hub** is a web application that enables users to discover and explore video games, view detailed game information, and purchase games from various online stores. The platform includes user authentication, allowing users to log in, manage their favorite games, and receive personalized recommendations.

-----

## Demo
Access the application here: **[Game Data Hub](https://gamehub.hu/)**  
View the presentation here: **[GameDataHub Presentation](https://www.canva.com/design/DAGirN-tK6o/X0fcjagcc-oVixcVQAXJvA/edit?utm_content=DAGirN-tK6o&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)**

![Application Screenshot](https://github.com/user-attachments/assets/1bd3da57-3ad9-499e-a424-28aca90275da)

-----

## Features
- **Search**: Browse through an extensive list of games categorized by genres such as Action, Sci-Fi, Multiplayer and more
- **User Authentication**: Users can log in with their credentials and manage their favorite games
- **Game Details**: View comprehensive information about each game including system requirements and descriptions
- **Favorites System**: Bookmark your favorite games for easy access later
- **Store Integration**: Access various online stores where games can be purchased
- **Search Functionality**: Search for games by name and explore categories and genres
- **Responsive Design**: Fully responsive platform optimized for both desktop and mobile devices

-----

## Technologies
- **Frontend**: React, TailwindCSS, React Router, Context API
- **Backend**: Node.js, Express.js (for API calls and game data management)
- **Database**: Firebase Firestore (for user authentication and favorites management)
- **External APIs**: Game data APIs for retrieving game details and store information
- **Version Control**: Git & GitHub

-----

## System Overview

### Core Architecture
- **Frontend**: React-based interface handling UI rendering and API calls
- **Backend**: Express.js API that retrieves game data and user preferences
- **Database**: Firebase Firestore for authentication and storing favorite games
- **External APIs**: Integration with external game databases and store APIs for real-time information

-----

## Application Structure

### 1. Body Component (`Body.jsx`)
The main user interface where users can browse games and view their details.

#### Functions:
- Displays categorized games (Multiplayer, Sci-Fi, Action etc.)
- Shows detailed information when clicking on games
- Handles authentication and user operations (login/logout, adding favorites)
- Lists external stores where games can be purchased

#### Key Functions:
- `categorizeGames()`: Categorizes games by genre
- `showGameDetails()`: Displays detailed information about selected games
- `handleLogout()`: Logs out the user
- `openStoreUrl()`: Opens a game store in new browser tab

-----

### 2. Login Component (`Login.jsx`)
Handles user authentication.

#### Functions:
- Login form with email and password fields
- Error handling for incorrect data
- Redirects after successful login
- Registration page link for new users

#### Key Function:
- `login()`: Manages Firebase authentication process

-----

### 3. Header Component (`Header.jsx`)
Responsive navigation header with:
- Dynamic search functionality
- Mobile-friendly hamburger menu
- User authentication links
- Favorites system modal
- Game store list modal
- Smooth animations using Framer Motion

#### Functions:
- Automatically retrieves game data and stores from backend
- Displays user favorites
- Responsive design (mobile/desktop)
- Interactive UI elements with hover/tap effects

#### Technologies:
- React hooks (useState, useEffect, useContext)
- React Router for navigation
- React Icons for vector icons
- Framer Motion for animations
- Fetch API for data retrieval

#### Props:
- `searchTrue`: Controls search visibility
- `setGames`: Updates game state
- `setSearchTrue`: Toggles search
- `games`: Current game list

-----

### 4. Footer Component (`Footer.jsx`)

#### Key Features:
- Responsive layout (mobile and desktop views)
- Separate sections for content, quick links and social media
- Transparent gradient texts
- Hover effects on links and icons

#### Content Sections:
1. **Brand Section**:
   - Game icon with title
   - Brief project description

2. **Quick Links**:
   - Homepage
   - Discover
   - Contact
   - Community reviews

3. **Social Media Icons**:
   - GitHub
   - LinkedIn
   - Instagram
   - Gmail

4. **Copyright Information**:
   - Copyright notice
   - Privacy policy
   - Developer names (with links)

#### Technology:
- React component
- React Icons library
- Tailwind CSS styling
- Responsive design with breakpoints

-----

### 5. Rotate Components (`Rotate.jsx`)

#### Key Features:
- **Auto-rotation**: Configurable time intervals (intervalTimeA)
- **Manual navigation**: Arrow-controlled
- **GSAP animations**: Smooth transitions
- **Responsive design**: Mobile and desktop views

#### Props:
- `games`: List of games to display
- `showGameDetails`: Function to show game details
- `name`: Section name
- `intervalTimeA`: Auto-rotation interval (ms)
- `k`: Animation speed parameter

#### Related Components:
1. **GamingNews**:
   - Latest game news
   - Category filtering

2. **DiscountedGames**:
   - Discounted games listing
   - Percentage discounts highlighted

3. **FeaturedGames**:
   - Featured games showcase
   - Weekly/monthly highlights

4. **SearchedGames**:
   - Search results display
   - Filtering options

#### Technology:
- React hooks (useState, useEffect, useRef)
- GSAP animation library
- React Icons
- Custom CSS (body.css)

![Component Screenshot](https://github.com/user-attachments/assets/3cb92064-a1c4-4762-abc1-15c297563f9a)

-----

## Installation Guide

### Prerequisites
Ensure you have installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)


### Clone the Repository

1. Clone the repo:

    ```bash
    git clone https://github.com/your-username/game-data-hub.git
    cd game-data-hub
    ```

2. Install dependencies::

    ```bash
    pnpm i
    ```

### Firebase Setup

**To use Firebase Authentication and Firestore:**
1. Go to Firebase Console
2. Create new project and enable Firebase Authentication and Firestore services
3. Copy Firebase config and create firebaseConfig.js in src folder:


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
---

## Testing Strategy
- **Unit Testing:** React component testing using Vitest

- **Integration Testing:** API calls and database operations testing

- **User Acceptance Testing:** Real-world scenario testing for usability


![image](https://github.com/user-attachments/assets/2e777005-045a-4806-ac8c-7edc79061849)

---

## Challenges and Solutions

- **Challenge:** Data synchronization between frontend and backend

  - **Solution:** Using React Context API and Firebase Firestore for real-time updates

- **Challenge:** Integrating multiple store APIs with different data structures

  - **Solution:** Created unified functions for processing and displaying store information

## Future Developments

- Additional filtering options for better game discovery

- UI/UX improvements based on user feedback

- Integration of more game stores to expand offerings

- User review system implementation

- Social features for sharing games

## External Contributions

We welcome contributions to the Game Data Hub project! Here's how you can join:

1. **Clone** the repository

1. **Create** a new branch for your feature or bugfix

1. **Commit** and push your changes

1. **Submit** a pull request to the main repo

Ways to contribute:

- Report and fix bugs

- Suggest and implement new features

- Improve documentation

- Review pull requests