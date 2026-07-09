import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

/**
 * Example component test using React Testing Library
 * Tests component rendering and user interactions
 */

// Mock component for testing
const MockButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}>{children}</button>
);

const MockLoader = () => <div data-testid="loader">Loading...</div>;

describe("Component Tests (jest)", () => {
  describe("MockButton", () => {
    it("renders button with children text", () => {
      render(<MockButton onClick={jest.fn()}>Click me</MockButton>);
      
      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it("calls onClick handler when clicked", () => {
      const handleClick = jest.fn();
      render(<MockButton onClick={handleClick}>Click me</MockButton>);
      
      const button = screen.getByRole("button");
      button.click();
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders with different text", () => {
      render(<MockButton onClick={jest.fn()}>Submit</MockButton>);
      
      const button = screen.getByRole("button", { name: /submit/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe("MockLoader", () => {
    it("renders loader component", () => {
      render(<MockLoader />);
      
      const loader = screen.getByTestId("loader");
      expect(loader).toBeInTheDocument();
      expect(loader).toHaveTextContent("Loading...");
    });
  });

  describe("Component composition", () => {
    it("renders multiple components together", () => {
      const handleClick = jest.fn();
      render(
        <div>
          <MockLoader />
          <MockButton onClick={handleClick}>Continue</MockButton>
        </div>
      );

      expect(screen.getByTestId("loader")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
    });
  });
});
