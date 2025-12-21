import Link from "next/link";
import { ArrowLeft, FileText, ShoppingCart, Package, CreditCard, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Termeni și Condiții | Nutopia",
  description: "Termenii și condițiile de utilizare a serviciilor Nutopia.",
};

export default function TermsPage() {
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
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                Termeni și Condiții
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
              Bine ai venit la Nutopia! Acești termeni și condiții descriu regulile și reglementările pentru utilizarea 
              site-ului și serviciilor Nutopia. Prin accesarea acestui site web, acceptăm că ai citit, ai înțeles și 
              ești de acord cu acești termeni.
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
                  1. Definiții
                </h2>
              </div>
            </div>
            <div className="space-y-2 text-stone-600 dark:text-stone-400">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>"Site"</strong> se referă la platforma web Nutopia și toate paginile asociate</li>
                <li><strong>"Noi"/"Nutopia"</strong> se referă la compania care operează acest site</li>
                <li><strong>"Tu"/"Client"</strong> se referă la persoana care accesează site-ul</li>
                <li><strong>"Produs"</strong> se referă la orice articol disponibil pentru achiziție pe site</li>
                <li><strong>"Comandă"</strong> reprezintă o cerere de achiziție a produselor</li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  2. Utilizarea site-ului
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>Prin utilizarea site-ului nostru, garantezi că:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ai cel puțin 18 ani sau ai consimțământul părinților/tutorilor</li>
                <li>Nu vei utiliza site-ul pentru scopuri ilegale sau neautorizate</li>
                <li>Vei respecta toate legile locale, naționale și internaționale aplicabile</li>
                <li>Nu vei transmite viruși sau cod malițios</li>
                <li>Nu vei încerca să accesezi zone neautorizate ale site-ului</li>
                <li>Nu vei copia, reproduce sau distribui conținutul fără permisiune</li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  3. Produse și prețuri
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  3.1. Descrierea produselor
                </h3>
                <p>
                  Ne străduim să prezentăm produsele cât mai exact posibil. Cu toate acestea, nu garantăm că 
                  descrierile, fotografiile sau alt conținut sunt complet exacte, complete sau fără erori. 
                  Culorile afișate pot varia în funcție de monitorul tău.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  3.2. Prețuri
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Toate prețurile sunt exprimate în Lei Moldovenești (MDL)</li>
                  <li>Prețurile includ TVA acolo unde este aplicabil</li>
                  <li>Ne rezervăm dreptul de a modifica prețurile fără notificare prealabilă</li>
                  <li>Costurile de livrare sunt calculate la finalizarea comenzii</li>
                  <li>În cazul unei erori de preț evident, ne rezervăm dreptul de a anula comanda</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  3.3. Disponibilitate
                </h3>
                <p>
                  Produsele sunt supuse disponibilității în stoc. Ne rezervăm dreptul de a limita cantitățile 
                  achiziționate per persoană sau per comandă.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  4. Comenzi și plăți
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  4.1. Plasarea comenzilor
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pentru a plasa o comandă, trebuie să creezi un cont sau să te autentifici</li>
                  <li>Toate comenzile sunt supuse acceptării noastre</li>
                  <li>Ne rezervăm dreptul de a refuza orice comandă</li>
                  <li>Vei primi o confirmare a comenzii prin email</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  4.2. Metode de plată
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceptăm plăți prin PayPal</li>
                  <li>Ramburs la livrare (acolo unde este disponibil)</li>
                  <li>Toate plățile sunt procesate securizat</li>
                  <li>Nu stocăm informații despre carduri de credit pe serverele noastre</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  4.3. Procesarea plăților
                </h3>
                <p>
                  Plățile sunt procesate imediat. În cazul unor probleme de procesare, te vom contacta 
                  pentru clarificări înainte de a trimite comanda.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  5. Livrare
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  5.1. Zone de livrare
                </h3>
                <p>
                  Livrăm în toată Moldova. Costurile și timpii de livrare variază în funcție de locație 
                  și sunt afișate la finalizarea comenzii.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  5.2. Timpul de livrare
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Chișinău:</strong> 1-2 zile lucrătoare</li>
                  <li><strong>Alte orașe:</strong> 2-3 zile lucrătoare</li>
                  <li><strong>Zone rurale:</strong> 3-5 zile lucrătoare</li>
                </ul>
                <p className="mt-2">
                  Acestea sunt estimări și pot varia în funcție de circumstanțe neprevăzute.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  5.3. Responsabilitate
                </h3>
                <p>
                  Nu suntem responsabili pentru întârzieri cauzate de circumstanțe în afara controlului nostru 
                  (condiții meteo extreme, greve, etc.).
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  6. Returnări și rambursări
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  6.1. Drept de returnare
                </h3>
                <p>
                  Conform legislației din Moldova, ai dreptul de a returna produsele în termen de 14 zile 
                  de la primire, fără a oferi o justificare.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  6.2. Condiții pentru returnare
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Produsul trebuie să fie în ambalajul original</li>
                  <li>Produsul nu trebuie să fie folosit sau deteriorat</li>
                  <li>Toate etichetele și sigiliile trebuie să fie intacte</li>
                  <li>Trebuie să incluzi factura sau dovada achiziției</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  6.3. Produse exceptate
                </h3>
                <p>
                  Din motive de igienă și siguranță alimentară, nu acceptăm returnări pentru:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
                  <li>Produse alimentare deschise sau perisabile</li>
                  <li>Produse deteriorate din vina clientului</li>
                  <li>Produse personalizate sau comandate special</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                  6.4. Procesul de rambursare
                </h3>
                <p>
                  După primirea și inspectarea produsului returnat, te vom notifica despre aprobarea sau 
                  refuzul rambursării. Dacă este aprobată, rambursarea va fi procesată în 5-10 zile lucrătoare.
                </p>
              </div>
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
                  7. Proprietate intelectuală
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                Tot conținutul site-ului (texte, imagini, logo-uri, designul site-ului) este proprietatea 
                Nutopia sau a licențiatorilor noștri și este protejat de legile privind drepturile de autor.
              </p>
              <p>
                Nu ai voie să reproduci, distribui, modifici sau creezi lucrări derivate din conținutul nostru 
                fără permisiunea noastră scrisă explicită.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  8. Limitarea răspunderii
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                În măsura maximă permisă de lege, Nutopia nu va fi răspunzătoare pentru:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pierderi indirecte, incidentale sau consecutive</li>
                <li>Pierderea profiturilor sau a economiilor anticipate</li>
                <li>Pierderea datelor sau a informațiilor</li>
                <li>Întreruperi ale activității</li>
              </ul>
              <p className="mt-3">
                Răspunderea noastră totală nu va depăși valoarea comenzii tale.
              </p>
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
                  9. Legea aplicabilă
                </h2>
              </div>
            </div>
            <div className="text-stone-600 dark:text-stone-400">
              <p>
                Acești termeni și condiții sunt guvernați de și interpretați în conformitate cu legile 
                Republicii Moldova. Orice dispută va fi soluționată de instanțele competente din Chișinău, Moldova.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  10. Modificări ale termenilor
                </h2>
              </div>
            </div>
            <div className="text-stone-600 dark:text-stone-400">
              <p>
                Ne rezervăm dreptul de a modifica acești termeni și condiții în orice moment. 
                Modificările vor intra în vigoare imediat după publicarea pe site. Continuarea utilizării 
                site-ului după modificări constituie acceptarea noilor termeni.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-3">
                  11. Contact
                </h2>
              </div>
            </div>
            <div className="space-y-3 text-stone-600 dark:text-stone-400">
              <p>
                Pentru întrebări despre acești termeni și condiții, ne poți contacta:
              </p>
              <div className="bg-stone-50 dark:bg-stone-900 rounded-xl p-4 space-y-2">
                <p><strong>Email:</strong> contact@nutopia.md</p>
                <p><strong>Telefon:</strong> +373 69 123 456</p>
                <p><strong>Adresă:</strong> Chișinău, Moldova</p>
                <p><strong>Program:</strong> Luni - Vineri: 9:00 - 18:00</p>
              </div>
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
