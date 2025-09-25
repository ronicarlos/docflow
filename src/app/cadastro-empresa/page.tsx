import { Metadata } from 'next';
import { CompanyRegistrationForm } from '@/components/forms/company-registration-form';

export const metadata: Metadata = {
  title: 'Cadastro de Empresa',
  description: 'Cadastre uma nova empresa no sistema',
};

export default function CadastroEmpresaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Cadastro de Nova Empresa
          </h1>
          <p className="text-gray-600 mb-8">
            Preencha os dados abaixo para cadastrar uma nova empresa no sistema.
          </p>
          <CompanyRegistrationForm />
        </div>
      </div>
    </div>
  );
}
