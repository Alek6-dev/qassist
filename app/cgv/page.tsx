import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGV & CGU, MyQAssist",
  description: "Conditions générales de vente et d'utilisation de MyQAssist",
};

export default function CGV() {
  return (
    <div className="min-h-screen bg-[#050507] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="text-xs text-gray-500 hover:text-gray-400 transition-colors mb-10 inline-block"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="text-2xl font-semibold text-white mb-2">Conditions générales de vente et d&apos;utilisation</h1>
        <p className="text-sm text-gray-500 mb-10">CGV & CGU, MyQAssist</p>

        {/* 1 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">1. Objet</h2>
          <p className="text-sm leading-7">
            Les présentes conditions générales de vente et d&apos;utilisation (ci-après « CGV/CGU ») régissent l&apos;accès et l&apos;utilisation du service MyQAssist, accessible à l&apos;adresse <strong>myqassist.fr</strong>, édité par <strong>BISSUEL Alexis</strong>, Personne physique (ci-après « l&apos;Éditeur »).
          </p>
          <p className="text-sm leading-7 mt-4">
            MyQAssist est un service SaaS (Software as a Service) permettant aux professionnels de la qualité logicielle de transformer des spécifications fonctionnelles en exigences structurées, cas de tests et analyses de couverture, par le biais d&apos;un moteur d&apos;intelligence artificielle.
          </p>
          <p className="text-sm leading-7 mt-4">
            Toute utilisation du service implique l&apos;acceptation pleine et entière des présentes CGV/CGU. L&apos;utilisateur qui n&apos;accepte pas ces conditions doit s&apos;abstenir d&apos;utiliser le service.
          </p>
        </section>

        {/* 2 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">2. Accès au service</h2>
          <p className="text-sm leading-7">
            Le service MyQAssist est accessible via un navigateur web moderne, sans installation de logiciel supplémentaire. L&apos;accès à l&apos;application nécessite la création d&apos;un compte utilisateur et, selon le plan souscrit, une connexion Internet stable.
          </p>
          <p className="text-sm leading-7 mt-4">
            Le service comprend deux espaces distincts :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-1">
            <li><strong>Le site vitrine public</strong> (<strong>myqassist.fr</strong>) : accessible sans authentification, présentant le service et ses offres.</li>
            <li><strong>L&apos;application SaaS</strong> (/dashboard) : accessible après authentification, permettant l&apos;utilisation effective du service de génération IA.</li>
          </ul>
          <p className="text-sm leading-7 mt-4">
            L&apos;Éditeur se réserve le droit de modifier, suspendre ou interrompre l&apos;accès au service, en tout ou partie, à tout moment, notamment pour des raisons de maintenance, de sécurité ou d&apos;évolution technique, sans que cela engage sa responsabilité.
          </p>
        </section>

        {/* 3 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">3. Compte utilisateur</h2>
          <p className="text-sm leading-7">
            L&apos;utilisation de l&apos;application MyQAssist requiert la création d&apos;un compte en renseignant une adresse email valide et un mot de passe. L&apos;utilisateur s&apos;engage à fournir des informations exactes, complètes et à les maintenir à jour.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son compte. Toute utilisation non autorisée doit être immédiatement signalée à l&apos;Éditeur à l&apos;adresse <a href="mailto:alexisbissuel.dev@gmail.com" className="text-indigo-400 hover:underline">alexisbissuel.dev@gmail.com</a>.
          </p>
          <p className="text-sm leading-7 mt-4">
            Un compte par personne physique ou morale est autorisé. La création de comptes multiples à des fins de contournement des quotas est interdite.
          </p>
        </section>

        {/* 4 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">4. Offres et tarifs</h2>
          <p className="text-sm leading-7">
            MyQAssist propose les offres d&apos;abonnement suivantes :
          </p>
          <div className="mt-4 space-y-4">
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200">Plan Free, 0 €</p>
              <p className="text-xs text-gray-400 mt-1">2 projets maximum à vie · 30 exigences max/projet · Historique 1 mois</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200">Plan Starter, 19 € / mois HT</p>
              <p className="text-xs text-gray-400 mt-1">5 projets / mois · 60 exigences max/projet · Historique 6 mois</p>
            </div>
            <div className="border border-white/10 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-200">Plan Pro, 39 € / mois HT</p>
              <p className="text-xs text-gray-400 mt-1">Projets illimités · 120 exigences max/projet · Historique illimité · Support prioritaire</p>
            </div>
          </div>
          <p className="text-sm leading-7 mt-4">
            Les prix sont indiqués hors taxes. La TVA applicable est celle en vigueur au jour de la facturation selon la réglementation française et européenne.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;Éditeur se réserve le droit de modifier les tarifs. Tout changement de tarif sera communiqué aux abonnés actifs par email au moins 30 jours avant son entrée en vigueur. L&apos;abonné qui refuserait le nouveau tarif pourra résilier son abonnement sans frais avant la date d&apos;entrée en vigueur.
          </p>
        </section>

        {/* 5 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">5. Paiement</h2>
          <p className="text-sm leading-7">
            Le paiement des abonnements Starter et Pro est géré par <strong>Stripe Inc.</strong>, prestataire de paiement sécurisé. Les données bancaires de l&apos;utilisateur sont transmises directement à Stripe et ne transitent jamais par les serveurs de MyQAssist.
          </p>
          <p className="text-sm leading-7 mt-4">
            Les abonnements sont renouvelés automatiquement par période mensuelle à la date anniversaire de la souscription, sauf résiliation préalable. L&apos;utilisateur peut gérer son abonnement, modifier son moyen de paiement et se désabonner à tout moment depuis la page de facturation (/dashboard/billing) via le portail Stripe.
          </p>
          <p className="text-sm leading-7 mt-4">
            En cas d&apos;échec du paiement, l&apos;accès au service peut être suspendu ou rétrogradé au plan Free dans un délai de 7 jours suivant le premier échec, après tentatives de recouvrement par Stripe.
          </p>
        </section>

        {/* 6 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">6. Droit de rétractation</h2>
          <p className="text-sm leading-7">
            Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique pas aux contrats de fourniture de contenus numériques non fournis sur un support matériel dont l&apos;exécution a commencé avec l&apos;accord préalable exprès du consommateur.
          </p>
          <p className="text-sm leading-7 mt-4">
            MyQAssist étant un service B2B destiné aux professionnels, l&apos;utilisateur agit en qualité de professionnel et reconnaît ne pas bénéficier du droit de rétractation prévu par le Code de la consommation.
          </p>
          <p className="text-sm leading-7 mt-4">
            À titre commercial, et sans que cela constitue une obligation légale, l&apos;Éditeur pourra, à sa discrétion, accorder un remboursement partiel ou total dans les 48 heures suivant la souscription si aucune génération de projet n&apos;a été effectuée, sur demande adressée à <a href="mailto:alexisbissuel.dev@gmail.com" className="text-indigo-400 hover:underline">alexisbissuel.dev@gmail.com</a>.
          </p>
        </section>

        {/* 7 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">7. Utilisation du service et contenu soumis</h2>
          <p className="text-sm leading-7">
            L&apos;utilisateur s&apos;engage à utiliser le service MyQAssist dans le respect des lois et réglementations en vigueur et des présentes CGV/CGU. Il est notamment interdit de :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-1">
            <li>Soumettre des contenus illicites, diffamatoires, obscènes ou portant atteinte aux droits de tiers</li>
            <li>Tenter de contourner les mécanismes de sécurité ou les quotas du service</li>
            <li>Utiliser le service pour des activités de reverse engineering, scraping automatisé ou extraction massive de données</li>
            <li>Transférer l&apos;accès à son compte à un tiers sans autorisation expresse de l&apos;Éditeur</li>
            <li>Utiliser le service à des fins de création de produits ou services concurrents</li>
          </ul>
          <p className="text-sm leading-7 mt-4">
            L&apos;utilisateur est seul responsable des spécifications fonctionnelles qu&apos;il soumet au service. Il garantit disposer des droits nécessaires sur ces contenus et s&apos;engage à ne pas soumettre de données personnelles non anonymisées de tiers sans leur consentement.
          </p>
        </section>

        {/* 8 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">8. Contenus générés par intelligence artificielle</h2>
          <p className="text-sm leading-7">
            Les exigences, cas de tests et analyses de couverture générés par MyQAssist sont produits automatiquement par un modèle d&apos;intelligence artificielle (Anthropic Claude) à partir des spécifications soumises par l&apos;utilisateur.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;utilisateur reconnaît et accepte que :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-2">
            <li>Les contenus générés sont produits à titre d&apos;assistance et ne constituent pas des documents contractuels, réglementaires ou normatifs finalisés.</li>
            <li>L&apos;IA peut produire des résultats incomplets, inexacts ou inadaptés. Toute utilisation professionnelle requiert une vérification humaine préalable.</li>
            <li>L&apos;Éditeur ne garantit pas la qualité, l&apos;exhaustivité ou la pertinence des contenus générés.</li>
            <li>L&apos;utilisateur est seul responsable de l&apos;utilisation des contenus générés, notamment dans le cadre de livrables clients, de processus de certification ou de toute autre finalité professionnelle.</li>
          </ul>
        </section>

        {/* 9 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">9. Propriété intellectuelle</h2>
          <p className="text-sm leading-7">
            L&apos;ensemble du service MyQAssist, notamment le code source, l&apos;interface, la marque, les algorithmes et les prompts, est la propriété exclusive de l&apos;Éditeur ou de ses concédants de licence, et est protégé par le droit de la propriété intellectuelle.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;utilisateur conserve l&apos;intégralité des droits sur les spécifications fonctionnelles qu&apos;il soumet au service. L&apos;Éditeur n&apos;acquiert aucun droit sur ces contenus.
          </p>
          <p className="text-sm leading-7 mt-4">
            Les contenus générés par l&apos;IA à partir des spécifications de l&apos;utilisateur lui sont remis sans restriction d&apos;usage. L&apos;Éditeur n&apos;en revendique aucun droit de propriété.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;utilisateur concède à l&apos;Éditeur une licence non-exclusive, mondiale et gratuite d&apos;utilisation de ses contenus soumis aux seules fins d&apos;exécution du service (transmission au modèle IA, stockage temporaire, affichage dans l&apos;application).
          </p>
        </section>

        {/* 10 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">10. Disponibilité du service</h2>
          <p className="text-sm leading-7">
            L&apos;Éditeur s&apos;efforce d&apos;assurer la disponibilité du service 24h/24, 7j/7, sans toutefois s&apos;y engager contractuellement. Des interruptions peuvent survenir pour des raisons de maintenance planifiée ou non, de défaillance technique, ou pour des raisons indépendantes de la volonté de l&apos;Éditeur (notamment liées aux sous-traitants Vercel, Supabase, Anthropic ou Stripe).
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;Éditeur ne peut être tenu responsable des interruptions de service ni de leurs conséquences, quelles qu&apos;elles soient. En cas d&apos;interruption majeure prolongée au-delà de 72 heures consécutives, l&apos;Éditeur pourra, à sa discrétion, compenser les abonnés actifs.
          </p>
        </section>

        {/* 11 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">11. Limitation de responsabilité</h2>
          <p className="text-sm leading-7">
            Dans les limites autorisées par la loi applicable, la responsabilité de l&apos;Éditeur au titre des présentes CGV/CGU est expressément limitée aux dommages directs et prévisibles. L&apos;Éditeur ne saurait en aucun cas être tenu responsable :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-1">
            <li>Des dommages indirects, consécutifs, spéciaux ou punitifs</li>
            <li>Des pertes de données, de revenus, de profits ou d&apos;opportunités commerciales</li>
            <li>Des préjudices résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service</li>
            <li>Des erreurs ou omissions dans les contenus générés par l&apos;IA</li>
            <li>Des actes ou manquements de ses sous-traitants (Supabase, Vercel, Stripe, Anthropic)</li>
          </ul>
          <p className="text-sm leading-7 mt-4">
            En tout état de cause, la responsabilité totale de l&apos;Éditeur vis-à-vis d&apos;un utilisateur est limitée au montant des sommes effectivement perçues de cet utilisateur au cours des trois (3) derniers mois précédant le fait générateur du dommage.
          </p>
        </section>

        {/* 12 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">12. Suspension et résiliation du compte</h2>
          <p className="text-sm leading-7">
            L&apos;utilisateur peut résilier son abonnement à tout moment depuis la page de facturation (/dashboard/billing). La résiliation prend effet à l&apos;échéance de la période en cours, sans remboursement proratisé sauf disposition contraire légale.
          </p>
          <p className="text-sm leading-7 mt-4">
            L&apos;Éditeur se réserve le droit de suspendre ou résilier immédiatement et sans préavis tout compte en cas de :
          </p>
          <ul className="text-sm leading-7 mt-3 list-disc list-inside space-y-1">
            <li>Violation des présentes CGV/CGU</li>
            <li>Utilisation frauduleuse ou abusive du service</li>
            <li>Non-paiement des sommes dues</li>
            <li>Activité illicite ou contraire à l&apos;ordre public</li>
          </ul>
          <p className="text-sm leading-7 mt-4">
            En cas de résiliation, quelle qu&apos;en soit la cause, les données de l&apos;utilisateur sont conservées selon les durées indiquées dans la Politique de confidentialité, puis supprimées.
          </p>
        </section>

        {/* 13 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">13. Données utilisateur</h2>
          <p className="text-sm leading-7">
            Le traitement des données personnelles collectées dans le cadre de l&apos;utilisation du service est régi par la Politique de confidentialité disponible à l&apos;adresse <a href="/confidentialite" className="text-indigo-400 hover:underline">myqassist.fr/confidentialite</a>, qui fait partie intégrante des présentes CGV/CGU.
          </p>
        </section>

        {/* 14 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">14. Modification des CGV/CGU</h2>
          <p className="text-sm leading-7">
            L&apos;Éditeur se réserve le droit de modifier les présentes CGV/CGU à tout moment. Les utilisateurs enregistrés seront informés de toute modification substantielle par email au moins 15 jours avant son entrée en vigueur.
          </p>
          <p className="text-sm leading-7 mt-4">
            La poursuite de l&apos;utilisation du service après l&apos;entrée en vigueur des nouvelles CGV/CGU vaut acceptation de celles-ci. L&apos;utilisateur qui refuserait les nouvelles conditions devra cesser d&apos;utiliser le service et pourra résilier son compte sans frais.
          </p>
        </section>

        {/* 15 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">15. Droit applicable et juridiction compétente</h2>
          <p className="text-sm leading-7">
            Les présentes CGV/CGU sont régies par le droit français. En cas de litige relatif à leur interprétation, à leur exécution ou à leur validité, les parties s&apos;engagent à rechercher une solution amiable préalablement à toute action judiciaire.
          </p>
          <p className="text-sm leading-7 mt-4">
            À défaut d&apos;accord amiable dans un délai de 30 jours, tout litige sera soumis à la compétence exclusive des tribunaux français du ressort du domicile de l&apos;Éditeur.
          </p>
        </section>

        {/* 16 */}
        <section className="mb-10">
          <h2 className="text-base font-semibold text-white mb-4">16. Contact</h2>
          <p className="text-sm leading-7">
            Pour toute question relative aux présentes CGV/CGU, vous pouvez contacter l&apos;Éditeur à :<br />
            <a href="mailto:alexisbissuel.dev@gmail.com" className="text-indigo-400 hover:underline">alexisbissuel.dev@gmail.com</a>
          </p>
        </section>

        <p className="text-xs text-gray-600 mt-12">Dernière mise à jour : avril 2026</p>
      </div>
    </div>
  );
}
