// @vitest-environment jsdom
import { describe, test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Review from "../Features/Review.jsx";
import React from "react";
import App from "../App.jsx";
import Body from "../Body.jsx";

afterEach(() => cleanup());
render(<Body />);

describe("Review Component", () => {
  render(<Review />);
  test("Search Games --> ", () => {
    expect(screen.getByLabelText("Search Game")).toBeInTheDocument();
  });
});
