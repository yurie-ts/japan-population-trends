import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App component', () => {
  it('renders the header title correctly', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: '都道府県別 人口推移グラフ' }),
    ).toBeInTheDocument();
  });
});
