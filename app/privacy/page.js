import Link from "next/link";
import { ArrowLeft, Shield, Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Politica de Confidențialitate | Nutopia",
  description: "Politica de confidențialitate a Nutopia - Cum protejăm și utilizăm datele tale personale.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Înapoi
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Politica de Confidențialitate
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                Ultima actualizare: 22 Decembrie 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 space-y-8">
          
          {/* Main Content */}
          <div className="space-y-6 text-stone-600 dark:text-stone-400 leading-relaxed">
            <p className="text-lg">
              Magazinul <strong className="text-stone-800 dark:text-stone-200">Nutopia</strong> respectă 
              confidențialitatea datelor tale personale și se angajează să le protejeze conform legislației în vigoare.
            </p>

            <p>
              Colectăm doar informațiile necesare pentru procesarea comenzilor: nume, număr de telefon, 
              adresă de livrare și, după caz, adresa de e-mail. Datele sunt utilizate exclusiv pentru 
              comunicarea cu clienții și livrarea comenzilor.
            </p>

            <p>
              Nutopia nu vinde și nu divulgă datele personale către terți, cu excepția firmelor de curierat 
              sau a situațiilor prevăzute de lege.
            </p>

            <p>
              Ai dreptul să soliciți accesul, modificarea sau ștergerea datelor tale personale, 
              contactându-ne prin canalele oficiale Nutopia.
            </p>

            <p>
              Prin utilizarea serviciilor noastre, îți exprimi acordul cu această Politică de Confidențialitate.
            </p>
          </div>

          {/* Contact Section */}
          <div className="pt-8 border-t border-stone-200 dark:border-stone-700">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4">
              Contact
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-4">
              Pentru întrebări sau solicitări legate de protecția datelor cu caracter personal, ne poți contacta la:
            </p>
            <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Magazin</p>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">Nutopia</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Email</p>
                  <a href="mailto:nutopia.md@gmail.com" className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                    nutopia.md@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Telefon</p>
                  <a href="tel:+37379677652" className="font-semibold text-stone-800 dark:text-stone-200 hover:text-amber-600">
                    +373 79 677 652
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-stone-500 dark:text-stone-500">Locație</p>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">Str. Columna 42</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="pt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25"
            >
              <ArrowLeft className="w-5 h-5" />
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
