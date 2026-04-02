import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité, MyQAssist",
  description: "Politique de confidentialité et traitement des données personnelles de MyQAssist",
};

export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-[#050507] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors mb-10 inline-block"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-2xl font-semibold text-white mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-10">Conforme au Règlement (UE) 2016/679 (RGPD)</p>

        {/* 1 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">1. Responsable du traitement</h2>
          <p className="text-sm leading-7">
            Le responsable du traitement des données personnelles collectées sur <strong>myqassist.fr</strong> est :<br />
            <strong>BISSUEL Alexis</strong>, Personne physique, domicilié en Auvergne-Rhône-Alpes, France.<br />
            Contact : <a href="mailto:alexisbissuel.dev@gmail.com" className="text-indigo-400 hover:underline">alexisbissuel.dev@gmail.com</a>
          </p>
        </section>

        {/* 2 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">2. Données collectées</h2>

          <h3 className="text-sm font-semibold text-gray-200 mb-2 mt-4">2.1 Visiteurs du site vitrine</h3>
          <p className="text-sm leading-7">
            La navigation sur le site public <strong>myqassist.fr</strong> ne requiert aucune inscription. Aucune donnée personnelle identifiante n&apos;est collectée à cette occasion. Des données techniques non identifiantes peuvent être collectées par l&apos;infrastructure d&apos;hébergement (adresse IP, user-agent, logs d&apos;accès) à des fins de sécurité et de bon fonctionnement du service.
          </p>

          <h3 className="text-sm font-semibold text-gray-200 mb-2 mt-6">2.2 Utilisateurs de l&apos;application SaaS</h3>
          <p className="text-sm leading-7">
            Dans le cadre de l&apos;utilisation de l&apos;application MyQAssist, les données suivantes sont collectées et traitées :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-1">
            <li><strong>Données d&apos;identification</strong> : adresse email, mot de passe haché (stocké par Supabase Auth)</li>
            <li><strong>Données d&apos;utilisation</strong> : projets créés, spécifications fonctionnelles soumises, exigences et cas de tests générés</li>
            <li><strong>Données d&apos;abonnement</strong> : plan souscrit, historique de facturation, identifiant client Stripe</li>
            <li><strong>Données techniques</strong> : logs d&apos;authentification, date de création du compte, horodatage des actions</li>
          </ul>
          <p className="text-sm leading-7 mt-4">
            <strong>Avertissement :</strong> les spécifications fonctionnelles soumises à l&apos;application peuvent contenir des informations confidentielles ou sensibles relatives à vos projets internes. L&apos;utilisateur est seul responsable du contenu qu&apos;il soumet. Il est recommandé d&apos;anonymiser les données sensibles avant soumission.
          </p>
        </section>

        {/* 3 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">3. Finalités et bases légales du traitement</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 pr-4 text-gray-400 font-medium">Finalité</th>
                  <th className="text-left py-2 pr-4 text-gray-400 font-medium">Base légale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 pr-4 leading-6">Création et gestion du compte utilisateur</td>
                  <td className="py-3 leading-6">Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 leading-6">Fourniture du service de génération IA</td>
                  <td className="py-3 leading-6">Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 leading-6">Gestion de la facturation et des abonnements</td>
                  <td className="py-3 leading-6">Obligation légale / exécution du contrat (art. 6.1.b et 6.1.c RGPD)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 leading-6">Sécurité et prévention de la fraude</td>
                  <td className="py-3 leading-6">Intérêt légitime (art. 6.1.f RGPD)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 leading-6">Communication transactionnelle (emails de service)</td>
                  <td className="py-3 leading-6">Exécution du contrat (art. 6.1.b RGPD)</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 leading-6">Amélioration du service et analyse des usages</td>
                  <td className="py-3 leading-6">Intérêt légitime (art. 6.1.f RGPD)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 4 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">4. Durée de conservation</h2>
          <ul className="text-sm leading-7 list-disc list-inside space-y-2">
            <li><strong>Données de compte</strong> : conservées pendant toute la durée de la relation contractuelle, puis supprimées dans un délai de 30 jours suivant la clôture du compte, sauf obligation légale contraire.</li>
            <li><strong>Données de facturation</strong> : conservées 10 ans conformément aux obligations comptables et fiscales françaises.</li>
            <li><strong>Projets et contenus générés</strong> : conservés selon le plan souscrit (1 mois pour le plan Free, 6 mois pour le plan Starter, durée illimitée pour le plan Pro), puis supprimés automatiquement.</li>
            <li><strong>Logs techniques</strong> : conservés 12 mois maximum à des fins de sécurité.</li>
          </ul>
        </section>

        {/* 5 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">5. Destinataires et sous-traitants</h2>
          <p className="text-sm leading-7 mb-4">
            Les données collectées sont traitées par le responsable du traitement et ses sous-traitants techniques. Aucune donnée n&apos;est vendue à des tiers à des fins commerciales.
          </p>
          <div className="space-y-5">
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200 mb-1">Supabase Inc.</p>
              <p className="text-xs text-gray-500 mb-2">Authentification, stockage des données utilisateur et des projets</p>
              <p className="text-xs leading-6">Les données sont stockées sur des serveurs Supabase. Supabase est certifié SOC 2 Type II. Les données peuvent être traitées hors de l&apos;UE (infrastructure AWS us-east-1 par défaut). Un Data Processing Agreement (DPA) est disponible auprès de Supabase. Pour plus d&apos;informations : <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://supabase.com/privacy</a>.</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200 mb-1">Stripe Inc.</p>
              <p className="text-xs text-gray-500 mb-2">Traitement des paiements et gestion des abonnements</p>
              <p className="text-xs leading-6">Les données de paiement (numéro de carte, etc.) sont traitées exclusivement par Stripe et ne transitent jamais par les serveurs MyQAssist. Stripe est certifié PCI DSS niveau 1. Pour plus d&apos;informations : <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://stripe.com/fr/privacy</a>.</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200 mb-1">Vercel Inc.</p>
              <p className="text-xs text-gray-500 mb-2">Hébergement de l&apos;application frontend et exécution des fonctions serveur</p>
              <p className="text-xs leading-6">Vercel traite des données techniques (logs, adresses IP) dans le cadre de l&apos;hébergement. Pour plus d&apos;informations : <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://vercel.com/legal/privacy-policy</a>.</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200 mb-1">Anthropic PBC</p>
              <p className="text-xs text-gray-500 mb-2">Modèle d&apos;intelligence artificielle utilisé pour la génération de contenu</p>
              <p className="text-xs leading-6">Les spécifications fonctionnelles soumises par l&apos;utilisateur sont transmises à l&apos;API Anthropic Claude pour traitement. Les données transmises ne sont pas utilisées par Anthropic pour entraîner ses modèles dans le cadre des accords API. Pour plus d&apos;informations : <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://www.anthropic.com/privacy</a>.</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200 mb-1">OVHcloud</p>
              <p className="text-xs text-gray-500 mb-2">Registrar du nom de domaine myqassist.fr</p>
              <p className="text-xs leading-6">OVHcloud gère l&apos;enregistrement du nom de domaine. Pour plus d&apos;informations : <a href="https://www.ovhcloud.com/fr/personal-data-protection/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://www.ovhcloud.com/fr/personal-data-protection/</a>.</p>
            </div>
          </div>
        </section>

        {/* 6 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">6. Transferts hors UE</h2>
          <p className="text-sm leading-7">
            Certains sous-traitants (Supabase, Vercel, Anthropic, Stripe) sont établis aux États-Unis. Les transferts de données vers ces entités sont encadrés par les clauses contractuelles types (CCT) de la Commission européenne ou par le Data Privacy Framework UE-États-Unis, conformément aux articles 46 et 45 du RGPD.
          </p>
        </section>

        {/* 7 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">7. Vos droits</h2>
          <p className="text-sm leading-7 mb-4">
            Conformément au RGPD (articles 15 à 22), vous disposez des droits suivants sur vos données personnelles :
          </p>
          <ul className="text-sm leading-7 list-disc list-inside space-y-2">
            <li><strong>Droit d&apos;accès</strong> : obtenir la confirmation que vos données sont traitées et en recevoir une copie.</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes ou incomplètes.</li>
            <li><strong>Droit à l&apos;effacement</strong> : demander la suppression de vos données, sous réserve des obligations légales de conservation.</li>
            <li><strong>Droit à la limitation</strong> : demander la suspension temporaire du traitement de vos données.</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.</li>
            <li><strong>Droit d&apos;opposition</strong> : vous opposer à un traitement fondé sur l&apos;intérêt légitime.</li>
            <li><strong>Droit de retirer votre consentement</strong> : lorsque le traitement est fondé sur le consentement, le retirer à tout moment sans que cela n&apos;affecte la licéité des traitements antérieurs.</li>
          </ul>
          <p className="text-sm leading-7 mt-4">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:alexisbissuel.dev@gmail.com" className="text-indigo-400 hover:underline">alexisbissuel.dev@gmail.com</a>. Nous répondrons dans un délai maximum de 30 jours.
          </p>
          <p className="text-sm leading-7 mt-4">
            En cas de litige non résolu, vous avez le droit d&apos;introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">www.cnil.fr</a>.
          </p>
        </section>

        {/* 8 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">8. Sécurité des données</h2>
          <p className="text-sm leading-7">
            Des mesures techniques et organisationnelles appropriées sont mises en œuvre pour protéger vos données contre tout accès non autorisé, perte, destruction ou divulgation :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-1">
            <li>Communications chiffrées via TLS/HTTPS sur l&apos;ensemble du service</li>
            <li>Authentification sécurisée avec hachage des mots de passe (Supabase Auth)</li>
            <li>Contrôle d&apos;accès aux données par Row Level Security (RLS) au niveau base de données</li>
            <li>Clés API et secrets d&apos;infrastructure jamais exposés côté client</li>
            <li>Accès aux données de production restreint au strict nécessaire</li>
          </ul>
        </section>

        {/* 9 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">9. Cookies</h2>
          <p className="text-sm leading-7">
            MyQAssist utilise uniquement des cookies strictement nécessaires au fonctionnement du service, notamment pour la gestion de la session d&apos;authentification. Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
          </p>
          <p className="text-sm leading-7 mt-4">
            Ces cookies étant nécessaires à l&apos;exécution du service, ils ne requièrent pas de consentement préalable conformément à l&apos;article 82 de la loi Informatique et Libertés.
          </p>
        </section>

        {/* 10 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">10. Modification de la politique</h2>
          <p className="text-sm leading-7">
            La présente politique de confidentialité peut être modifiée à tout moment pour refléter les évolutions légales, réglementaires ou techniques. La date de dernière mise à jour est indiquée en bas de page. En cas de modification substantielle, les utilisateurs enregistrés seront informés par email.
          </p>
        </section>

        <p className="text-xs text-gray-600 mt-12">Dernière mise à jour : avril 2026</p>
      </div>
    </div>
  );
}
