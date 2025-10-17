import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirigir a la página de inventario
  redirect('/inventario');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl p-12 max-w-2xl text-center">
        <i className="fas fa-desktop text-6xl text-blue-500 mb-6"></i>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          GLPI Software Inventory
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Sistema de inventario y control de software aprobado
        </p>
        
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Link
            href="/inventario"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <i className="fas fa-list"></i>
            Inventario General
          </Link>
          
          <Link
            href="/aprobado"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <i className="fas fa-shield-check"></i>
            Software Aprobado
          </Link>
        </div>
        
        <footer className="mt-12 text-gray-500 text-sm">
          &copy; 2025 Cremona Inoxidable SA
        </footer>
      </div>
    </div>
  );
}
