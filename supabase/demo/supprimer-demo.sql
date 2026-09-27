-- ═══════════════════════════════════════════════════════════════════════
--  LE CARNET VIVANT — SUPPRIMER LES DONNÉES DE DÉMONSTRATION
-- ═══════════════════════════════════════════════════════════════════════
--  À coller dans Supabase → SQL Editor → New query → Run, après le jury.
--  Efface uniquement ce que demo-jury.sql a créé : les comptes
--  « @demo.lecarnetvivant.fr », leurs carnets, l'établissement de démo et
--  la mutuelle fictive (code DEMO-2026). Les vrais comptes ne sont jamais touchés.
-- ═══════════════════════════════════════════════════════════════════════

delete from public.organizations
 where created_by in (select id from auth.users where email like '%@demo.lecarnetvivant.fr');
delete from public.carnets
 where owner_id in (select id from auth.users where email like '%@demo.lecarnetvivant.fr');
delete from auth.users where email like '%@demo.lecarnetvivant.fr';
delete from public.mutuelle_codes where mutuelle_name = 'Mutuelle Exemple (démo)';

select 'Données de démonstration supprimées.' as "Résultat";
