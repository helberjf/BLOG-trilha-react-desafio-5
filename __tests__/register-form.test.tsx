import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegisterForm } from "@/app/(auth)/cadastro/RegisterForm";

const replaceMock = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock
  })
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    replaceMock.mockClear();
  });

  it("masks CPF and WhatsApp values while typing", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/cpf/i), "52998224725");
    await user.type(screen.getByLabelText(/whatsapp/i), "11999998888");

    expect(screen.getByLabelText(/cpf/i)).toHaveValue("529.982.247-25");
    expect(screen.getByLabelText(/whatsapp/i)).toHaveValue("(11) 99999-8888");
  });

  it("masks CNPJ when the account type is business", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: /sou empresa/i }));
    await user.type(screen.getByLabelText(/^cnpj$/i), "11222333000181");
    await user.type(screen.getByLabelText(/cpf do responsavel/i), "52998224725");
    await user.type(screen.getByLabelText(/cep do cnpj/i), "36010000");

    expect(screen.getByLabelText(/^cnpj$/i)).toHaveValue("11.222.333/0001-81");
    expect(screen.getByLabelText(/cpf do responsavel/i)).toHaveValue("529.982.247-25");
    expect(screen.getByLabelText(/cep do cnpj/i)).toHaveValue("36010-000");
  });

  it("renders different registration forms for couriers and companies", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(screen.queryByLabelText(/tipo de conta/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /cadastro de entregador/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^cnpj$/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar conta de entregador/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sou empresa/i }));

    expect(screen.getByRole("heading", { name: /cadastro de empresa/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/razao social/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^cnpj$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cpf do responsavel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cep do cnpj/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar conta empresarial/i })).toBeInTheDocument();
  });

  it("makes the selected account form explicit and updates the registration URL", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    expect(screen.getByText(/formulario selecionado: entregador/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sou empresa/i }));

    expect(screen.getByText(/formulario selecionado: empresa/i)).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/cadastro?tipo=empresa", { scroll: false });

    await user.click(screen.getByRole("button", { name: /sou entregador/i }));

    expect(screen.getByText(/formulario selecionado: entregador/i)).toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/cadastro?tipo=entregador", { scroll: false });
  });

  it("suggests common email providers", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/email/i), "maria");

    expect(screen.getByLabelText(/email/i)).toHaveAttribute("list", "email-suggestions");
    expect(document.querySelector('datalist#email-suggestions option[value="maria@gmail.com"]')).toBeInTheDocument();
    expect(document.querySelector('datalist#email-suggestions option[value="maria@hotmail.com"]')).toBeInTheDocument();
  });
});
