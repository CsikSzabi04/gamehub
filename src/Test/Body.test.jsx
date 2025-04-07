// @vitest-environment jsdom
import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { createContext } from 'react';
import ReviewsOpen from '../Features/ReviewsOpen.jsx';
import userEvent from '@testing-library/user-event';
import Body from '../Body.jsx'
import Review from '../Features/Review.jsx';
import React from 'react';
import StartUp from '../Features/StartUp.jsx';

const UserContext = createContext();

const router = createBrowserRouter([
    { path: "/", element: <Body /> },
    { path: "/review", element: <Review /> },
    { path: "/reviews/:gameId", element: <ReviewsOpen /> }
]);

const user = { emai: "anonymous@domain.com", uid: "anonymous" }
render(
    <RouterProvider router={router}>
        <UserContext.Provider value={{ user }}>
            <Review />
        </UserContext.Provider> </RouterProvider>);

describe('Review Component', () => {


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
    test('StartUp Text --> ', () => {
        expect(screen.getByText("Loading"));
     });

     test('StartUp Image--> ', () => {
        render(<StartUp />)
        const image = screen.getAllByAltText('MainImgS');
        expect(image).toHaveAttribute('src', './main.png');
     });
});

