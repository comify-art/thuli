import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ComingSoon } from '../ComingSoon';

describe('ComingSoon Component', () => {
  it('renders standalone mode with back to home link by default when showHomeButton is true', () => {
    render(
      <MemoryRouter>
        <ComingSoon
          title="Syndicates"
          description="Syndicates launch in Q4."
          showHomeButton={true}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Syndicates')).toBeInTheDocument();
    expect(screen.getByText('Syndicates launch in Q4.')).toBeInTheDocument();
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('renders portal mode with page header and status badge', () => {
    render(
      <MemoryRouter>
        <ComingSoon
          title="Portfolio Tracker"
          variant="portal"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Portfolio Tracker')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Tracker is on the roadmap')).toBeInTheDocument();
    expect(screen.getByText('Return to Previous Page')).toBeInTheDocument();
    expect(screen.getByText('In Development')).toBeInTheDocument();
  });
});
