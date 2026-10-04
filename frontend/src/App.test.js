import { fireEvent, render, screen } from '@testing-library/react';

jest.mock('./contexts/AuthContext', () => {
  const React = jest.requireActual('react');
  const AuthContext = React.createContext({});

  return {
    AuthContext,
    AuthProvider: ({ children }) => React.createElement(
      AuthContext.Provider,
      {
        value: {
          addToUserHistory: jest.fn(),
          getHistoryOfUser: jest.fn().mockResolvedValue([])
        }
      },
      children
    )
  };
});

import App from './App';

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  window.history.pushState({}, '', '/');
});

test('renders the responsive landing page', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /letsmeets home/i })).toHaveAttribute('href', '/');
  expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/auth');
  expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
});

test('opens the home page route and validates an empty meeting code', () => {
  localStorage.setItem('token', 'test-token');
  window.history.pushState({}, '', '/home');

  render(<App />);

  expect(screen.getByRole('heading', { name: /make room for a great conversation/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start a new meeting/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /letsmeets home/i })).toHaveAttribute('href', '/home');
  expect(screen.getByRole('button', { name: /meeting history/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Go back' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /join/i }));
  expect(screen.getByText(/please enter a meeting code/i)).toBeInTheDocument();
});

test('starts a fresh meeting directly from the dashboard', async () => {
  localStorage.setItem('token', 'test-token');
  window.history.pushState({}, '', '/home');

  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /start a new meeting/i }));

  expect(await screen.findByRole('heading', { name: /join your meeting/i })).toBeInTheDocument();
  expect(window.location.pathname).toMatch(/^\/[a-z0-9-]+$/i);
});

test('opens in dark mode and lets visitors switch to light mode', () => {
  render(<App />);

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
  expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  expect(localStorage.getItem('themeMode')).toBe('light');
  expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
});

test('starts in dark mode even if light mode was selected on an earlier visit', () => {
  localStorage.setItem('themeMode', 'light');

  render(<App />);

  expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  expect(localStorage.getItem('themeMode')).toBe('dark');
});

test('returns to the landing page using the auth back button', () => {
  window.history.pushState({}, '', '/auth');

  render(<App />);
  expect(screen.getByRole('link', { name: /letsmeets home/i })).toHaveAttribute('href', '/');
  fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

  expect(screen.getByRole('link', { name: /letsmeets home/i })).toBeInTheDocument();
});

test('brand navigation returns signed-out visitors to the public home page', async () => {
  window.history.pushState({}, '', '/auth');

  render(<App />);
  fireEvent.click(screen.getByRole('link', { name: /letsmeets home/i }));

  expect(await screen.findByRole('heading', { name: /connect with your loved ones/i })).toBeInTheDocument();
});

test('shows a back button on history and brand navigation returns home', async () => {
  localStorage.setItem('token', 'test-token');
  window.history.pushState({}, '', '/history');

  render(<App />);

  expect(screen.getByRole('link', { name: /letsmeets home/i })).toHaveAttribute('href', '/home');
  expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  expect(await screen.findByText(/no meetings yet/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('link', { name: /letsmeets home/i }));
  expect(await screen.findByRole('heading', { name: /make room for a great conversation/i })).toBeInTheDocument();
});

test('redirects unauthenticated visitors away from meeting history', async () => {
  window.history.pushState({}, '', '/history');

  render(<App />);

  expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /meeting history/i })).not.toBeInTheDocument();
});

test('provides sign-up fields and password visibility control', () => {
  window.history.pushState({}, '', '/auth');

  const { container } = render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

  expect(screen.getByRole('textbox', { name: /full name/i })).toBeInTheDocument();
  const password = container.querySelector('#password');
  expect(password).toHaveAttribute('type', 'password');

  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
  expect(password).toHaveAttribute('type', 'text');
});
