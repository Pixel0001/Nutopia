import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail } from "lucide-react";

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
                Ultima actualizare: 21 Decembrie 2025
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              La Nutopia, respectăm confidențialitatea datelor tale personale. Această politică descrie cum colectăm, 
              utilizăm, stocăm și protejăm informațiile tale personale atunci când folosești serviciile noastre.
            </p>
          </section>

          {/* Section 1 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  1. Informații pe care le colectăm
                </h2>
              </div>
            </div>
            <div className="space-y-4 text-stone-600 dark:text-stone-400">
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  1.1. Informații pe care le furnizezi direct:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nume și prenume</li>
                  <li>Adresă de email</li>
                  <li>Număr de telefon</li>
                  <li>Adresă de livrare</li>
                  <li>Informații despre plată (procesate securizat prin PayPal)</li>
                  <li>Fotografii de profil (dacă te autentifici prin Google)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  1.2. Informații colectate automat:
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Adresa IP</li>
                  <li>Tipul de browser și dispozitiv</li>
                  <li>Pagini vizitate pe site-ul nostru</li>
                  <li>Data și ora vizitelor</li>
                  <li>Cookies și tehnologii similare</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  2. Cum utilizăm informațiile tale
                </h2>
              </div>
            </div>
            <div className="space-y-2 text-stone-600 dark:text-stone-400">
              <p>Utilizăm informațiile colectate pentru:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Procesarea și livrarea comenzilor tale</li>
                <li>Comunicarea cu tine despre comenzi și actualizări</li>
                <li>Îmbunătățirea experienței de cumpărături</li>
                <li>Personalizarea conținutului și recomandărilor</li>
                <li>Trimiterea de newsletter-e și oferte speciale (cu consimțământul tău)</li>
                <li>Prevenirea fraudelor și asigurarea securității</li>
                <li>Respectarea obligațiilor legale</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  3. Protejarea datelor tale
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja datele tale personale:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Criptarea datelor sensibile (SSL/TLS)</li>
                <li>Autentificare securizată prin JWT tokens</li>
                <li>Stocarea parolelor cu hash-uri bcrypt</li>
                <li>Acces restricționat la datele personale</li>
                <li>Monitorizare regulată a sistemelor de securitate</li>
                <li>Backup-uri regulate ale bazelor de date</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  4. Partajarea informațiilor
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                Nu vindem sau închiriem niciodată datele tale personale. Putem partaja informațiile doar în următoarele cazuri:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Furnizori de servicii:</strong> Companii care ne ajută să livrăm produsele (curierat, logistică)</li>
                <li><strong>Procesatori de plăți:</strong> PayPal pentru procesarea securizată a plăților</li>
                <li><strong>Furnizori de servicii tehnice:</strong> Hosting, email, analiză</li>
                <li><strong>Obligații legale:</strong> Atunci când legea ne cere să divulgăm informații</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  5. Drepturile tale
                </h2>
              </div>
            </div>
            <div className="space-y-2 text-stone-600 dark:text-stone-400">
              <p>Ai următoarele drepturi în ceea ce privește datele tale personale:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Acces:</strong> Poți solicita o copie a datelor pe care le deținem despre tine</li>
                <li><strong>Rectificare:</strong> Poți corecta datele inexacte sau incomplete</li>
                <li><strong>Ștergere:</strong> Poți solicita ștergerea datelor tale (cu anumite excepții)</li>
                <li><strong>Portabilitate:</strong> Poți primi datele tale într-un format structurat</li>
                <li><strong>Opoziție:</strong> Poți refuza procesarea pentru marketing direct</li>
                <li><strong>Retragerea consimțământului:</strong> Îți poți retrage oricând consimțământul</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  6. Cookies
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                Folosim cookies pentru a îmbunătăți experiența ta pe site-ul nostru:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Cookies esențiale:</strong> Necesare pentru funcționarea site-ului (autentificare, coș de cumpărături)</li>
                <li><strong>Cookies de performanță:</strong> Ne ajută să înțelegem cum utilizezi site-ul</li>
                <li><strong>Cookies de funcționalitate:</strong> Memorează preferințele tale</li>
              </ul>
              <p className="mt-3">
                Poți gestiona preferințele pentru cookies din setările browser-ului tău.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  7. Păstrarea datelor
                </h2>
              </div>
            </div>
            <div className="space-y-2 text-stone-600 dark:text-stone-400">
              <p>
                Păstrăm datele tale personale doar atât timp cât este necesar pentru:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Furnizarea serviciilor noastre</li>
                <li>Respectarea obligațiilor legale și fiscale (minimum 5 ani pentru documente contabile)</li>
                <li>Rezolvarea disputelor</li>
                <li>Aplicarea acordurilor noastre</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  8. Contact
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                Pentru orice întrebări despre această politică de confidențialitate sau pentru a-ți exercita drepturile, 
                ne poți contacta:
              </p>
              <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-4 space-y-2">
                <p><strong>Email:</strong> privacy@nutopia.md</p>
                <p><strong>Telefon:</strong> +373 69 123 456</p>
                <p><strong>Adresă:</strong> Chișinău, Moldova</p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  9. Modificări ale politicii
                </h2>
              </div>
            </div>
            <div className="text-stone-600 dark:text-stone-400">
              <p>
                Putem actualiza periodic această politică de confidențialitate. Modificările importante vor fi comunicate 
                prin email sau prin notificare pe site. Te încurajăm să verifici periodic această pagină pentru a fi 
                informat despre cum protejăm datele tale.
              </p>
            </div>
          </section>

          {/* Back Button */}
          <div className="pt-8 border-t border-stone-200 dark:border-stone-700">
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
