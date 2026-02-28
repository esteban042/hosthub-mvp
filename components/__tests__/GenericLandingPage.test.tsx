
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenericLandingPage from '../GenericLandingPage'; // Adjust the import path as needed
import { Host } from '../../types';

// Mock the child components to isolate the GenericLandingPage component
jest.mock('../../types.js', () => ({
    ...jest.requireActual('../../types.js'),
    SUBSCRIPTION_PRICES: { Basic: 0, Pro: 79, Premium: 249 },
  }));


describe('GenericLandingPage', () => {
  const mockHosts: Host[] = [
    {
      id: '1',
      name: 'Test Host 1',
      businessName: 'Test Business 1',
      slug: 'test-host-1',
      email: 'host1@test.com',
      commissionRate: 10,
      subscriptionType: 'Pro',
      stripeCustomerId: 'cus_123',
      stripeSubscriptionId: 'sub_123',
      subscriptionActive: true,
      payoutsEnabled: true,
    },
  ];

  const mockOnSignIn = jest.fn();

  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  test('renders the landing page without crashing', () => {
    render(<GenericLandingPage hosts={mockHosts} onSignIn={mockOnSignIn} />);
    expect(screen.getByText(/Own your visibility. Own your guests./i)).toBeInTheDocument();
  });

  describe('ROI Calculator', () => {
    test('calculates savings correctly when revenue is updated', () => {
      render(<GenericLandingPage hosts={mockHosts} onSignIn={mockOnSignIn} />);

      const revenueInput = screen.getByLabelText(/Your Annual Revenue/i);
      const savingsDisplay = screen.getByText(/With Sanctum, you'd save:/i).nextSibling as HTMLElement;

      // Initial state check
      fireEvent.change(revenueInput, { target: { value: '50000' } });
      // Formula: (50000 * 0.15) - (50000 * 0.04 + 50000 * 0.029) = 7500 - (2000 + 1450) = 4050
      expect(savingsDisplay.textContent).toBe('~$4,050');

      // Update revenue and check again
      fireEvent.change(revenueInput, { target: { value: '100000' } });
      // Formula: (100000 * 0.15) - (100000 * 0.04 + 100000 * 0.029) = 15000 - (4000 + 2900) = 8100
      expect(savingsDisplay.textContent).toBe('~$8,100');
    });
  });
});
