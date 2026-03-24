import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

import { useAuth } from '../../context/AuthContext';

const mockedUseAuth = vi.mocked(useAuth);

const renderWithRoutes = (allowedRoles?: Array<'admin' | 'supervisor' | 'worker' | 'rescue'>) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute integration checks', () => {
  it('redirects anonymous users to login', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    });

    renderWithRoutes(['admin']);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects authenticated users without role access to unauthorized', () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: 'u1',
        email: 'worker@example.com',
        role: 'worker',
        created_at: new Date().toISOString(),
        full_name: 'Worker'
      },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    });

    renderWithRoutes(['admin']);

    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument();
  });

  it('renders protected content for allowed role', () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: 'u2',
        email: 'admin@example.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        full_name: 'Admin'
      },
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn()
    });

    renderWithRoutes(['admin']);

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
