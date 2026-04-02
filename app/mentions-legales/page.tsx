import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales, MyQAssist",
  description: "Mentions légales du site MyQAssist",
};

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#050507] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors mb-10 inline-block"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-2xl font-semibold text-white mb-10">Mentions légales</h1>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">1. Éditeur du site</h2>
          <p className="text-sm leading-7">
            Le site <strong>myqassist.fr</strong> est édité par :<br />
            <strong>BISSUEL Alexis</strong><br />
            Personne physique<br />
            Domicilié en Auvergne-Rhône-Alpes, France<br />
            Contact : <a href="mailto:alexisbissuel.dev@gmail.com" className="text-indigo-400 hover:underline">alexisbissuel.dev@gmail.com</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">2. Directeur de la publication</h2>
          <p className="text-sm leading-7">
            Le directeur de la publication est <strong>BISSUEL Alexis</strong>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">3. Hébergement</h2>
          <p className="text-sm leading-7">
            L&apos;application MyQAssist est hébergée par :<br />
            <strong>Vercel Inc.</strong><br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://vercel.com</a>
          </p>
          <p className="text-sm leading-7 mt-4">
            La base de données est hébergée par :<br />
            <strong>Supabase Inc.</strong><br />
            970 Toa Payoh North, #07-04, Singapour 318992<br />
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://supabase.com</a>
          </p>
          <p className="text-sm leading-7 mt-4">
            Le nom de domaine est enregistré auprès de :<br />
            <strong>OVHcloud</strong><br />
            2 rue Kellermann, 59100 Roubaix, France<br />
            <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://www.ovhcloud.com</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">4. Propriété intellectuelle</h2>
          <p className="text-sm leading-7">
            L&apos;ensemble des éléments constituant le site <strong>myqassist.fr</strong>, notamment sa structure, ses textes, son code source, ses graphismes, son logo et ses fonctionnalités, est la propriété exclusive de <strong>BISSUEL Alexis</strong> et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p className="text-sm leading-7 mt-4">
            Toute reproduction, représentation, modification, publication, adaptation ou exploitation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de l&apos;éditeur, sous peine de poursuites judiciaires.
          </p>
          <p className="text-sm leading-7 mt-4">
            Les contenus générés par intelligence artificielle à la demande de l&apos;utilisateur (exigences, cas de tests, analyses de couverture) sont produits automatiquement à partir des informations fournies par l&apos;utilisateur. L&apos;éditeur ne revendique aucun droit de propriété sur ces contenus générés, qui restent sous la responsabilité de l&apos;utilisateur qui les a commandés.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">5. Limitation de responsabilité</h2>
          <p className="text-sm leading-7">
            L&apos;éditeur s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site. Toutefois, il ne peut garantir l&apos;exhaustivité, l&apos;exactitude ou la pertinence des informations mises à disposition, ni l&apos;absence d&apos;interruption ou d&apos;erreur dans le fonctionnement du service.
          </p>
          <p className="text-sm leading-7 mt-4">
            Les contenus générés par l&apos;intelligence artificielle sont fournis à titre d&apos;aide et d&apos;assistance. Ils ne constituent pas des documents contractuels, réglementaires ou normatifs. L&apos;utilisateur est seul responsable de l&apos;utilisation qu&apos;il en fait, notamment de leur vérification avant toute utilisation dans un contexte professionnel ou de certification.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l&apos;utilisation du site ou de l&apos;impossibilité d&apos;y accéder.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">6. Liens hypertextes</h2>
          <p className="text-sm leading-7">
            Le site peut contenir des liens vers des sites tiers. Ces liens sont fournis à titre informatif. L&apos;éditeur n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu ou à leur politique de confidentialité.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">7. Droit applicable</h2>
          <p className="text-sm leading-7">
            Les présentes mentions légales sont régies par le droit français. Tout litige relatif à l&apos;utilisation du site relève de la compétence exclusive des tribunaux français.
          </p>
        </section>

        <p className="text-xs text-gray-600 mt-12">Dernière mise à jour : avril 2026</p>
      </div>
    </div>
  );
}
