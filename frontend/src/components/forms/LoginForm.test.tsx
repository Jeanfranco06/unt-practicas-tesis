import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { trpc } from '@/lib/trpc/react';
import { useRouter } from 'next/navigation';

// Mock de dependencias
jest.mock('@/lib/trpc/react', () => ({
  trpc: {
    auth: {
      login: {
        useMutation: jest.fn(),
      },
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginForm', () => {
  const mockPush = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (trpc.auth.login.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it('debería mostrar errores de validación si los campos están vacíos', async () => {
    render(<LoginForm />);
    const submitButton = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/correo inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/mínimo 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('debería llamar al mutation con los datos del formulario cuando es válido', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@unt.edu.pe' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@unt.edu.pe',
        contrasena: '123456',
      });
    });
  });

  it('debería redirigir al dashboard tras login exitoso', async () => {
    const onSuccessCallback = (data: any) => {};
    (trpc.auth.login.useMutation as jest.Mock).mockImplementation(() => ({
      mutate: (data: any, options: any) => {
        options.onSuccess({ accessToken: 'token', refreshToken: 'rt' });
      },
      isLoading: false,
    }));
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@unt.edu.pe' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'token');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});