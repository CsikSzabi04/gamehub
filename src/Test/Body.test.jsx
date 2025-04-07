// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StartUp from '../Features/StartUp.jsx';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Review from '../Features/Review.jsx';
import React from 'react';

/* Startup.jsx */

describe('StartUp Component', () => {

  afterEach(() => {
    cleanup();
  });

  test('Displays loading text -->', () => {
    render(<StartUp onLoaded={() => {}} />);
    expect(screen.getByText('Loading')).toBeTruthy();
  });

  test('Displays correct image -->', () => {
    render(<StartUp onLoaded={() => {}} />);
    const image = screen.getByAltText('MainImgS');
    expect(image.getAttribute('src')).toBe('./main.png');
  });

  test('Progress bar updates correctly -->', () => {
    render(<StartUp onLoaded={() => {}} />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  test('Calls onLoaded when complete -->', () => {
    let loaded = false;
    render(<StartUp onLoaded={() => { loaded = true; }} />);
  });

});

/* Review.jsx */

const UserContext = React.createContext();
const mockUser = { email: "test@example.com", uid: "123" };

describe('Review Component', () => {
  afterEach(() => {
    cleanup();
  });

  test('Renders review form -->', () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <Review />
        </MemoryRouter>
      </UserContext.Provider>
    );
    
    expect(screen.getByText('Write a Review')).toBeTruthy();
    expect(screen.getByLabelText('Search Game')).toBeTruthy();
    expect(screen.getByText('Submit Review')).toBeTruthy();
  });

  test('Allows typing review text -->', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <Review />
        </MemoryRouter>
      </UserContext.Provider>
    );
    
    const reviewInput = screen.getByLabelText('Write a Review');
    await userEvent.type(reviewInput, 'Test review text');
    expect(reviewInput.value).toBe('Test review text');
  });

  test('Allows selecting rating -->', async () => {
    render(
      <UserContext.Provider value={{ user: mockUser }}>
        <MemoryRouter>
          <Review />
        </MemoryRouter>
      </UserContext.Provider>
    );
    
    const stars = screen.getAllByText('★');
    await userEvent.click(stars[3]); 
    expect(stars[3].className).toContain('text-yellow-400');
  });

  /*
    test('Search Games --> ', () => {
       expect(screen.getByLabelText("Search Game")).toBeInTheDocument();
    });

    test("New Review -->", async () => {
        screen.debug();
        const user = userEvent.setup();
        
        await user.click(screen.getByDisplayValue('Submit Review'));
        await user.clear(screen.getByLabelText('Write a Review'));
        await user.clear(screen.getByLabelText('Search Game'));
        await user.type(screen.getByPlaceholderText('Write a Review'), "It is a bad game unfortunatelly");
        await user.type(screen.getByPlaceholderText('Search Game'), "Borderlands 2");
        await user.click(screen.getByText('Submit Review'));
        expect(screen.getByText("Borderlands 2 It is a bad game unfortunatelly")).toBeInTheDocument();
        cleanup();
    });
    */
});
