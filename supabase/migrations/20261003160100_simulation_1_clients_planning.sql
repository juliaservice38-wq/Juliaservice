-- ============================================================
-- Julia service : SIMULATION 2025-2026 (1/2) — clients, contrats, planning, visites
-- Données entièrement FICTIVES. Tous les clients commencent par « SIM ».
-- Prérequis : la migration « extension déclarations » est appliquée (table declarations présente).
-- À coller dans Supabase > SQL Editor > Run (une seule fois), puis lancer le script 2/2.
-- Pour tout effacer : script « supprimer-simulation ».
-- Date de la simulation : samedi 3 octobre 2026.
-- ============================================================

-- 1. ENTREPRISES TIERCES (donneurs d'ordre de la sous-traitance)
insert into public.clients (type_client, civilite, nom, prenom, adresse, code_postal, ville, telephone, email, contact_famille_nom, contact_famille_lien, contact_famille_tel, personne_confiance, code_acces, etage, cles_info, autonomie, animaux, medecin_traitant, indications_particulieres, actif) values
('entreprise',null,'SIM Alpes Services à Domicile',null,'48 avenue Gabriel Péri','38400','Saint-Martin-d''Hères','06 39 98 90 01','facturation@alpes-services-sim.example','Mme Karine Dubois (comptabilité)','autre','06 39 98 90 01','Mme Karine Dubois (comptabilité)','Sans objet','Bureaux au rez-de-chaussée','Sans objet','non_evalue','Aucun','Sans objet','Entreprise SAP agréée. Donneur d''ordre principal. Paie à 30 jours en général, exige un récapitulatif d''heures signé par bénéficiaire.',true),
('entreprise',null,'SIM Maison Aide Isère',null,'9 rue des Frères Lumière','38000','Grenoble','06 39 98 90 02','compta@maison-aide-isere-sim.example','M. Thomas Rey (gérant)','autre','06 39 98 90 02','M. Thomas Rey (gérant)','Sans objet','Bureaux au rez-de-chaussée','Sans objet','non_evalue','Aucun','Sans objet','Sous-traitance pour les bénéficiaires hors secteur. Paie à 45 jours, parfois en deux fois.',true),
('entreprise',null,'SIM Vercors Présence',null,'3 place de la Mairie','38760','Varces-Allières-et-Risset','06 39 98 90 03','contact@vercors-presence-sim.example','Mme Nathalie Gros','autre','06 39 98 90 03','Mme Nathalie Gros','Sans objet','Bureaux au rez-de-chaussée','Sans objet','non_evalue','Aucun','Sans objet','Petite structure en difficulté de trésorerie : retards de paiement fréquents (90 jours et plus). Deux factures impayées à relancer.',true);

-- 2. LES 40 CLIENTS (17 actifs + 23 anciens). Tous les champs sont remplis, avec des cas qui posent problème.
insert into public.clients (type_client, civilite, nom, prenom, date_naissance, adresse, code_postal, ville, telephone, email, contact_famille_nom, contact_famille_lien, contact_famille_tel, personne_confiance, code_acces, etage, cles_info, autonomie, animaux, medecin_traitant, indications_particulieres, actif) values
('particulier','madame','SIM Durand','Jeanne','1941-03-12','12 rue des Lilas','38360','Sassenage','06 39 98 01 01','jeanne.durand41@mail-sim.example','Claire Durand-Perret','enfant','06 39 98 01 01','Claire Durand-Perret (fille)','B2451*','2e, ascenseur souvent en panne','Double des clés chez la voisine du 1er (Mme Aubert)','gir4','Un chat (Mimine) qui sort à l''ouverture de la porte','Dr Hélène Marchetti, Sassenage','Café avant de commencer. Volets à ouvrir avant 9h. La fille appelle souvent pour changer les horaires la veille. Allergie à certains produits ménagers (utiliser les siens).',true),
('particulier','monsieur','SIM Lefèvre','Marcel','1938-07-02','5 avenue des Tilleuls','38600','Fontaine','06 39 98 01 02','marcel.lefevre@mail-sim.example','Paul Lefèvre','enfant','06 39 98 01 12','Paul Lefèvre (fils, habite Lyon)','A1290','Rez-de-chaussée','Boîte à clés (code 4471) à gauche de la porte','gir3','Aucun','Dr Bruno Faure, Fontaine','Repas à réchauffer, vérifier le frigo et les dates. Un peu dur d''oreille : sonner longtemps. Conteste régulièrement le nombre d''heures facturées.',true),
('particulier','madame','SIM Petit','Yvette','1939-12-01','27 route de Claix','38640','Claix','06 39 98 01 03','marie.petit@mail-sim.example','Marie Petit-Gonzalez','enfant','06 39 98 01 13','Marie Petit-Gonzalez (fille)','E3318','1er étage sans ascenseur','Clés chez la fille (à récupérer le lundi)','gir2','Aucun','Dr Karim Benali, Claix','Accompagnement courses et rendez-vous. Déambulateur. Plan APA : heures limitées, le département paie avec 2 à 3 mois de retard.',true),
('particulier','monsieur','SIM Girard','Michel','1971-06-06','4 chemin des Vignes','38320','Eybens','06 39 98 01 04','m.girard-eybens@mail-sim.example','Nadia Girard','conjoint','06 39 98 01 14','Nadia Girard (épouse)','Portail 1957, puis interphone Girard','Rez-de-chaussée','Boîte à clés (code 8812)','gir3','Un labrador très affectueux (saute)','Dr Sophie Lambert, Eybens','Aide à la toilette et au repas du midi (PCH). Fauteuil roulant électrique, ne pas déplacer les meubles. La notification PCH se termine fin août 2026 : le renouvellement n''est pas encore reçu.',true),
('particulier','monsieur','SIM Roux','Henri','1948-04-25','9 rue du Moulin','38450','Vif','06 39 98 01 05','henri.roux.vif@mail-sim.example','Jean Roux','frere_soeur','06 39 98 01 15','Jean Roux (frère)','Aucun code : sonner à l''interphone','Rez-de-jardin','Julia a un double des clés','gir5','Un chien (Rex), mord parfois les inconnus','Dr Alain Perrot, Vif','Ménage du samedi matin. Paie par chèque, souvent en retard. Un chèque a été rejeté en 2026 (régularisé par virement).',true),
('particulier','madame','SIM Garnier','Odette','1946-11-20','8 chemin du Pré','38170','Seyssinet-Pariset','06 39 98 01 06','odette.garnier@mail-sim.example','Aucune famille proche','voisin','06 39 98 01 16','M. Roger Bonnet (voisin)','Pas de digicode','1er étage','Clés remises à Julia','gir5','Aucun','Dr Isabelle Nguyen, Seyssinet','Très autonome, aime marcher l''après-midi. Pas de famille : en cas d''absence, prévenir le voisin. Oublie parfois le rendez-vous.',true),
('particulier','madame','SIM Fournier','Lucie','1944-08-14','16 avenue de la Gare','38800','Pont-de-Claix','06 39 98 01 07','lucie.fournier@mail-sim.example','Sophie Fournier','enfant','06 39 98 01 17','Sophie Fournier (fille)','F9904','2e, appartement 24','Clés chez la voisine','gir4','Aucun','Dr Julien Moreau, Pont-de-Claix','Prise en charge mutuelle : 20 heures maximum par mois, justificatifs mensuels à envoyer avant le 5. Visite un jeudi sur deux.',true),
('particulier','monsieur','SIM Rousseau','Paul','1935-01-30','21 rue Jean Jaurès','38130','Échirolles','06 39 98 02 01','anne.rousseau@mail-sim.example','Anne Rousseau','enfant','06 39 98 02 11','Anne Rousseau (fille)','C7733','3e étage, ascenseur','Clés chez la gardienne (loge n°1)','gir2','Aucun','Dr Pascal Giraud, Échirolles','Déjeuner à préparer, déambulateur. Homonyme proche de SIM Roussel (Odile) : attention aux confusions de dossier.',true),
('particulier','madame','SIM Blanc','Simone','1943-05-17','3 impasse des Cerisiers','38120','Saint-Égrève','06 39 98 02 02','simone.blanc@mail-sim.example','Luc Blanc','enfant','06 39 98 02 12','Luc Blanc (fils)','Aucun code : sonner à l''interphone','Rez-de-chaussée','Clés dans la boîte aux lettres (code 2020)','gir3','Un petit chien (Pilou)','Dr Anne Colin, Saint-Égrève','Attention au chien à l''arrivée. Code d''accès du portail inconnu : sonner. Préfère les mêmes horaires chaque semaine.',true),
('particulier','monsieur','SIM Marchand','Georges','1937-02-22','17 allée des Peupliers','38130','Échirolles','06 39 98 02 03','isabelle.marchand@mail-sim.example','Isabelle Marchand','enfant','06 39 98 02 13','Isabelle Marchand (fille)','D4420','4e étage','Boîte à clés (code 1307)','gir3','Aucun','Dr Pascal Giraud, Échirolles','Toilette du matin à 8h précises (rendez-vous infirmier ensuite). Retard impossible.',true),
('particulier','madame','SIM Perrin','Lucienne','1940-09-03','6 chemin des Prés','38420','Domène','06 39 98 02 04','lucienne.perrin@mail-sim.example','Véronique Perrin','enfant','06 39 98 02 14','Véronique Perrin (fille)','1234','1er étage','Clés chez la fille','gir4','Deux chats','Dr Marc Durieux, Domène','Domène est hors secteur habituel : 20 minutes de trajet non facturées. Aime parler, dépasse souvent l''horaire.',true),
('particulier','madame','SIM Vidal','Berthe','1936-12-11','2 rue de la Mairie','38760','Varces-Allières-et-Risset','06 39 98 02 05','daniel.vidal@mail-sim.example','Daniel Vidal','enfant','06 39 98 02 15','Daniel Vidal (fils)','Pas de code','RDC','Clés sous le pot de fleurs (convenu avec la famille)','gir2','Aucun','Dr Éric Blanchard, Varces','Stimuler à boire. Le fils est injoignable en journée. Facturée via Vercors Présence, paiements très en retard.',true),
('particulier','monsieur','SIM Henry','Roger','1941-04-04','14 rue de la République','38400','Saint-Martin-d''Hères','06 39 98 02 06','roger.henry@mail-sim.example','Martine Henry','conjoint','06 39 98 02 16','Martine Henry (épouse)','A9056','2e étage','Clés remises à Julia','gir4','Aucun','Dr Léa Fabre, Saint-Martin-d''Hères','Aide à la toilette. L''épouse est présente mais fatiguée : ne pas la solliciter pour le portage.',true),
('particulier','madame','SIM Chevalier','Paulette','1944-06-28','31 rue Paul Bert','38600','Fontaine','06 39 98 02 07','herve.chevalier@mail-sim.example','Hervé Chevalier','enfant','06 39 98 02 17','Hervé Chevalier (fils)','B8812','3e étage, sans ascenseur','Boîte à clés (code 0509)','gir3','Aucun','Dr Bruno Faure, Fontaine','Visite très tôt (7h30) avant le départ du fils pour le travail. Sans ascenseur au 3e : portage des courses compliqué.',true),
('particulier','monsieur','SIM Lambert','Émile','1939-10-19','8 route du Vercors','38760','Varces-Allières-et-Risset','06 39 98 02 08','emile.lambert@mail-sim.example','Brigitte Lambert','enfant','06 39 98 02 18','Brigitte Lambert (fille)','Aucun code : sonner à l''interphone','Rez-de-chaussée','Clés sur la porte (à retirer en partant)','gir5','Un chien','Dr Éric Blanchard, Varces','Facturé via Vercors Présence. A déjà demandé à Julia de travailler en direct sans passer par l''entreprise (clause de non-sollicitation à vérifier).',true),
('particulier','madame','SIM Mercier','Josette','1947-01-15','40 avenue Ambroise Croizat','38400','Saint-Martin-d''Hères','06 39 98 02 09','josette.mercier@mail-sim.example','Claude Mercier','frere_soeur','06 39 98 02 19','Claude Mercier (frère)','C3027','5e étage, ascenseur','Clés chez le frère','gir4','Aucun','Dr Léa Fabre, Saint-Martin-d''Hères','Ménage et repassage le samedi. Peut annuler au dernier moment (souvent absente).',true),
('particulier','monsieur','SIM Faure','Armand','1942-03-09','12 rue des Écoles','38610','Gières','06 39 98 02 10','elodie.faure@mail-sim.example','Élodie Faure','enfant','06 39 98 02 20','Élodie Faure (fille)','Aucun code : sonner à l''interphone','RDC','Clés chez la fille','gir4','Aucun','Dr Marc Durieux, Domène','Visite un mardi sur deux pour le suivi des médicaments (pilulier). Contrat à renouveler fin 2026.',true),
('particulier','madame','SIM Martin','Jeanne','1936-03-30','7 rue des Acacias','38600','Fontaine','06 39 98 03 01','jeanne.martin@mail-sim.example','Jean Martin','enfant','06 39 98 03 11','Jean Martin (fils)','M1100','1er','Clés chez le fils','gir3','Un canari','Dr Bruno Faure, Fontaine','Homonyme de SIM Martin Jean (fils) : même adresse mail familiale. Dossier clôturé.',false),
('particulier','monsieur','SIM Bernard','Gaston','1933-11-08','22 rue Victor Hugo','38100','Grenoble','06 39 98 03 02','denise.bernard@mail-sim.example','Denise Laurent','frere_soeur','06 39 98 03 12','Denise Laurent (sœur)','1999B','3e','Clés remises à Julia','gir2','Aucun','Dr Hélène Marchetti, Grenoble','Même numéro de téléphone que SIM Laurent Denise (sœur chez qui il passait la journée).',false),
('particulier','madame','SIM Thomas','Colette','1952-02-14','5 allée des Marronniers','38240','Meylan','06 39 98 03 03','colette.thomas@mail-sim.example','Alain Thomas','conjoint','06 39 98 03 13','Alain Thomas (époux)','Pas de code','RDC','Clés dans le garage (code 5555)','gir6','Un lapin','Dr Julien Roche, Meylan','Ménage de printemps, 5 visites ponctuelles. Adresse e-mail différente du domicile.',false),
('particulier','monsieur','SIM Robert','Alain','1938-05-05','15 impasse du Lavoir','38130','Échirolles','06 39 98 03 04','sylvie.robert@mail-sim.example','Sylvie Robert','enfant','06 39 98 03 14','Sylvie Robert (fille)','R6702','2e','Clés remises à Julia','gir3','Aucun','Dr Pascal Giraud, Échirolles','Entreprise a repris le bénéficiaire avec ses propres salariées (Julia retirée du planning).',false),
('particulier','madame','SIM Richard','Madeleine','1932-09-23','2 rue des Roses','38400','Saint-Martin-d''Hères','06 39 98 03 05','madeleine.richard@mail-sim.example','Hélène Richard','enfant','06 39 98 03 15','Hélène Richard (fille, Lyon)','Aucun code : sonner à l''interphone','4e','Clés rendues à la fille','gir3','Aucun','Dr Léa Fabre, Saint-Martin-d''Hères','Adresse actuelle : chez sa fille à Lyon (69003). Ancienne adresse conservée sur la fiche.',false),
('particulier','monsieur','SIM Petitjean','Roger','1963-01-17','18 rue Pasteur','38800','Pont-de-Claix','06 39 98 03 06','roger.petitjean@mail-sim.example','Odile Petitjean','conjoint','06 39 98 03 16','Odile Petitjean (épouse)','P2020','RDC adapté','Boîte à clés (code 7007)','gir2','Aucun','Dr Julien Moreau, Pont-de-Claix','PCH. Fin de droits MDPH en décembre 2025, dossier de renouvellement incomplet.',false),
('particulier','madame','SIM Durand','Éliane','1950-07-07','10 rue du Stade','38120','Saint-Égrève','06 39 98 03 07','eliane.durand@mail-sim.example','Philippe Durand','enfant','06 39 98 03 17','Philippe Durand (fils)','S5050','1er','Clés chez Philippe','gir5','Un chien','Dr Anne Colin, Saint-Égrève','HOMONYME de SIM Durand Jeanne (Sassenage). Litige : conteste 6 heures facturées, a payé partiellement. Relances restées sans réponse.',false),
('particulier','monsieur','SIM Leroy','Fernand','1937-03-03','25 rue du Général Leclerc','38320','Eybens','06 39 98 03 08','gilles.leroy@mail-sim.example','Gilles Leroy','enfant','06 39 98 03 18','Gilles Leroy (fils)','L8080','2','Clés chez Gilles','gir4','Aucun','Dr Sophie Lambert, Eybens','Mutuelle : plafond de 20 h/mois atteint dès la 2e semaine, le reste n''est pas pris en charge.',false),
('particulier','madame','SIM Moreau','Gisèle','1945-10-10','9 chemin des Noyers','38170','Seyssinet-Pariset','06 39 98 03 09','gisele.moreau@mail-sim.example','Dominique Moreau','enfant','06 39 98 03 19','Dominique Moreau (fils)','Aucun code : sonner à l''interphone','RDC','Clés chez le fils','gir4','Aucun','Dr Isabelle Nguyen, Seyssinet','Remplacement ponctuel pour une salariée de l''entreprise en congés (juin 2025).',false),
('particulier','monsieur','SIM Simon','Raymond','1934-08-16','13 rue des Frênes','38360','Sassenage','06 39 98 03 10','catherine.simon@mail-sim.example','Catherine Simon','enfant','06 39 98 03 20','Catherine Simon (fille)','S1308','2','Clés chez la fille','gir2','Aucun','Dr Hélène Marchetti, Sassenage','Hospitalisation longue en janvier 2026 puis décès. Dernière facture réglée par la fille.',false),
('particulier','madame','SIM Laurent','Denise','1936-04-12','22 rue Victor Hugo','38100','Grenoble','06 39 98 03 02','denise.laurent@mail-sim.example','Gaston Bernard','frere_soeur','06 39 98 03 12','Gaston Bernard (frère)','1999B','3e','Clés remises à Julia','gir3','Aucun','Dr Hélène Marchetti, Grenoble','Même téléphone et même adresse que SIM Bernard Gaston (frère). Renouvellement APA refusé en janvier 2026.',false),
('particulier','monsieur','SIM Lefebvre','Armand','1941-12-24','4 rue de la Gare','38450','Vif','06 39 98 03 12','armand.lefebvre@mail-sim.example','Jacques Lefebvre','frere_soeur','06 39 98 03 22','Jacques Lefebvre (frère)','L4545','1','Clés chez le frère','gir4','Aucun','Dr Alain Perrot, Vif','Homonyme proche de SIM Lefèvre Marcel (Fontaine). Parti en maison de retraite.',false),
('particulier','madame','SIM Michel','Paulette','1949-05-01','6 route de Saint-Georges','38760','Varces-Allières-et-Risset','06 39 98 03 13','alexandre.michel@mail-sim.example','Alexandre Michel','enfant','06 39 98 03 23','Alexandre Michel (fils)','Aucun code : sonner à l''interphone','RDC','Clés chez le fils','gir4','Aucun','Dr Éric Blanchard, Varces','Vercors Présence a repris la bénéficiaire avec une salariée à temps plein.',false),
('particulier','monsieur','SIM Garcia','Antonio','1944-02-02','19 avenue de la Libération','38130','Échirolles','06 39 98 03 14','antonio.garcia@mail-sim.example','Maria Garcia','conjoint','06 39 98 03 24','Maria Garcia (épouse)','G9001','3','Clés rendues','gir4','Aucun','Dr Pascal Giraud, Échirolles','Désaccord sur les horaires (voulait 6h30). Arrêt à son initiative.',false),
('particulier','madame','SIM David','Léone','1958-06-06','28 rue de Belledonne','38240','Meylan','06 39 98 03 15','leone.david@mail-sim.example','Hugo David','enfant','06 39 98 03 25','Hugo David (fils)','D2828','1','Clés remises à Julia','gir5','Aucun','Dr Julien Roche, Meylan','Aide après opération de la hanche : 10 jours consécutifs en juillet 2025 (week-ends compris).',false),
('particulier','monsieur','SIM Bertrand','Louis','1939-09-09','33 rue de la Paix','38400','Saint-Martin-d''Hères','06 39 98 03 16','anne.bertrand@mail-sim.example','Anne Bertrand','enfant','06 39 98 03 26','Anne Bertrand (fille)','Aucun code : sonner à l''interphone','2','Clés chez la fille','gir2','Aucun','Dr Léa Fabre, Saint-Martin-d''Hères','Décédé en avril 2026. Dernière facture à solder avec l''entreprise.',false),
('particulier','madame','SIM Roussel','Odile','1980-01-21','11 rue du Dauphiné','38100','Echirolles','06 39 98 03 17','odile.roussel@mail-sim.example','Marc Roussel','conjoint','06 39 98 03 27','Marc Roussel (époux)','R1010','RDC','Boîte à clés (code 3141)','gir3','Aucun','Dr Sophie Lambert, Eybens','Code postal (38100 = Grenoble) ne correspond pas à la ville saisie (Echirolles sans accent). PCH jusqu''en juin 2026. Homonyme proche de SIM Rousseau.',false),
('particulier','madame','SIM Vincent','Huguette','1942-11-30','2 chemin du Bois','38640','Claix','06 39 98 03 18','pascal.vincent@mail-sim.example','Pascal Vincent','enfant','06 39 98 03 28','Pascal Vincent (fils)','V7070','1','Clés chez le fils','gir4','Aucun','Dr Karim Benali, Claix','Déménagée à Voiron (38500) en mai 2026. Nouvelle adresse non mise à jour sur la fiche.',false),
('particulier','monsieur','SIM Fabre','Jacques','1951-08-08','14 rue du Pré Brun','38100','Grenoble','06 39 98 03 19','jacques.fabre@mail-sim.example','Laure Fabre','enfant','06 39 98 03 29','Laure Fabre (fille)','F0101','RDC','Clés chez la fille','gir6','Aucun','Dr Hélène Marchetti, Grenoble','Ménage de printemps, 3 visites ponctuelles en février 2026.',false),
('particulier','madame','SIM Morel','Solange','1938-01-05','26 rue du Mont Blanc','38600','Fontaine','06 39 98 03 20','solange.morel@mail-sim.example','Étienne Morel','enfant','06 39 98 03 30','Étienne Morel (fils)','M5599','2','Clés remises à Julia','gir1','Un chat aveugle','Dr Bruno Faure, Fontaine','Passée en GIR 1 : exige deux intervenants pour les transferts, impossible pour une seule personne. Julia a arrêté.',false),
('particulier','madame','SIM Girard','Yvonne','1946-02-28','4 chemin des Vignes','38320','Eybens','06 39 98 03 21','michel.girard@mail-sim.example','Michel Girard','frere_soeur','06 39 98 01 04','Michel Girard (frère, voisin)','8812','RDC','Clés chez Michel','gir4','Aucun','Dr Sophie Lambert, Eybens','Habite la même adresse que SIM Girard Michel (frère). Maison Aide Isère conteste 3 factures : impayé litigieux.',false),
('particulier','monsieur','SIM Clément','Bernard','1949-10-02','7 rue de la Source','38450','Vif','06 39 98 03 22','bernard.clement@mail-sim.example','Anne Clément','enfant','06 39 98 03 32','Anne Clément (fille)','C1357','1','Clés chez la fille','gir5','Aucun','Dr Alain Perrot, Vif','A pris une autre aide à domicile moins chère.',false),
('particulier','madame','SIM Gauthier','Marthe','1943-07-19','21 rue des Écoles','38800','Pont-de-Claix','06 39 98 03 23','marthe.gauthier@mail-sim.example','Cécile Gauthier','enfant','06 39 98 03 33','Cécile Gauthier (fille)','G2468','RDC','Clés chez la fille','gir4','Aucun','Dr Julien Moreau, Pont-de-Claix','Prise en charge de la mutuelle terminée en août 2026.',false);

-- 3. CONTRATS (CESU direct, APA, PCH, mutuelle, particulier, sous-traitance facturée à une entreprise tierce)
insert into public.contrats (client_id, type_contrat, financeur, tarif_horaire, tarif_mode, taux_tva, heures_par_semaine, date_debut, date_fin, actif, notes, payeur_id)
select c.id, x.t, x.f, x.tarif, x.mode, x.tva, x.h, x.d1::date, x.d2::date, x.actif, x.notes, p.id
from (values
 ('SIM Durand','Jeanne','cesu','particulier',21.5,'net',null::numeric,4,'2025-01-13',null,true,'Emploi CESU préfinancé + chèques. Tarif net.',null),
 ('SIM Lefèvre','Marcel','cesu','caisse_retraite',22.0,'brut',null::numeric,3,'2025-01-20','2025-12-31',false,'Aide caisse de retraite. Tarif brut.',null),
 ('SIM Lefèvre','Marcel','cesu','caisse_retraite',22.5,'brut',null::numeric,3,'2026-01-01',null,true,'Revalorisation du tarif au 1er janvier 2026.',null),
 ('SIM Petit','Yvette','particulier','particulier',23.0,'ttc',0,5,'2025-03-03','2025-08-31',false,'Paiement direct avant l''APA.',null),
 ('SIM Petit','Yvette','apa','conseil_departemental',24.0,'ttc',0,5,'2025-09-01',null,true,'APA : tarif TTC, paiement différé du département. Plan d''aide à renouveler en septembre 2026.',null),
 ('SIM Girard','Michel','pch','mdph',20.5,'brut',null::numeric,3,'2025-09-01','2026-08-31',true,'PCH aide humaine. Notification MDPH jusqu''au 31/08/2026.',null),
 ('SIM Roux','Henri','particulier','particulier',22.0,'ht',0,2,'2026-01-12',null,true,'Paiement direct, particulier.',null),
 ('SIM Garnier','Odette','cesu','particulier',20.0,'net',null::numeric,2,'2026-05-04',null,true,'CESU, tarif net.',null),
 ('SIM Fournier','Lucie','mutuelle','mutuelle',21.0,'ht',0,1,'2026-07-16',null,true,'Mutuelle fictive : plafond 20 h/mois.',null),
 ('SIM Rousseau','Paul','prestataire','autre',16.2,'ht',0,3,'2025-09-08',null,true,'Sous-traitance Alpes Services à Domicile.','SIM Alpes Services à Domicile'),
 ('SIM Blanc','Simone','prestataire','autre',15.6,'ht',0,3,'2025-02-10',null,true,'Sous-traitance Maison Aide Isère.','SIM Maison Aide Isère'),
 ('SIM Marchand','Georges','prestataire','autre',16.2,'ht',0,2,'2026-06-01',null,true,'Sous-traitance Alpes Services à Domicile.','SIM Alpes Services à Domicile'),
 ('SIM Perrin','Lucienne','prestataire','autre',15.6,'ht',0,1.5,'2026-07-06',null,true,'Sous-traitance Maison Aide Isère.','SIM Maison Aide Isère'),
 ('SIM Vidal','Berthe','prestataire','autre',16.5,'ht',0,2,'2026-08-24',null,true,'Sous-traitance Vercors Présence.','SIM Vercors Présence'),
 ('SIM Henry','Roger','prestataire','autre',16.8,'ht',0,2,'2026-08-31',null,true,'Sous-traitance Alpes Services à Domicile.','SIM Alpes Services à Domicile'),
 ('SIM Chevalier','Paulette','prestataire','autre',15.6,'ht',0,2,'2026-09-07',null,true,'Sous-traitance Maison Aide Isère.','SIM Maison Aide Isère'),
 ('SIM Lambert','Émile','prestataire','autre',16.5,'ht',0,2,'2026-09-07',null,true,'Sous-traitance Vercors Présence.','SIM Vercors Présence'),
 ('SIM Mercier','Josette','prestataire','autre',16.2,'ht',0,2,'2026-09-14',null,true,'Sous-traitance Alpes Services à Domicile.','SIM Alpes Services à Domicile'),
 ('SIM Faure','Armand','prestataire','autre',15.6,'ht',0,0.5,'2026-09-29',null,true,'Sous-traitance Maison Aide Isère.','SIM Maison Aide Isère'),
 ('SIM Martin','Jeanne','cesu','particulier',21.0,'net',0,3.0,'2025-01-07','2025-06-27',false,'Fin de contrat : Décès.',null),
 ('SIM Bernard','Gaston','apa','conseil_departemental',23.5,'ttc',0,3.0,'2025-01-14','2025-09-12',false,'Fin de contrat : Entrée en EHPAD.',null),
 ('SIM Thomas','Colette','particulier','particulier',22.0,'ht',0,2,'2025-02-20','2025-04-17',false,'Fin de contrat : Mission ponctuelle terminée.',null),
 ('SIM Robert','Alain','prestataire','autre',16.0,'ht',0,2,'2025-02-03','2025-11-28',false,'Fin de contrat : Repris directement par l''entreprise.','SIM Alpes Services à Domicile'),
 ('SIM Richard','Madeleine','cesu','particulier',20.5,'brut',0,3.0,'2025-01-09','2025-05-22',false,'Fin de contrat : Déménagement chez sa fille.',null),
 ('SIM Petitjean','Roger','pch','mdph',20.0,'brut',0,2,'2025-03-10','2025-12-19',false,'Fin de contrat : Fin des droits PCH.',null),
 ('SIM Durand','Éliane','particulier','particulier',22.0,'ht',0,3,'2025-04-07','2025-08-29',false,'Fin de contrat : Litige sur une facture.',null),
 ('SIM Leroy','Fernand','mutuelle','mutuelle',21.0,'ht',0,3.0,'2025-05-12','2025-07-25',false,'Fin de contrat : Plafond de la mutuelle atteint.',null),
 ('SIM Moreau','Gisèle','prestataire','autre',16.0,'ht',0,2,'2025-06-10','2025-06-26',false,'Fin de contrat : Remplacement terminé.','SIM Maison Aide Isère'),
 ('SIM Simon','Raymond','cesu','particulier',21.5,'net',0,3.0,'2025-06-03','2026-02-06',false,'Fin de contrat : Hospitalisation puis décès.',null),
 ('SIM Laurent','Denise','apa','conseil_departemental',23.5,'ttc',0,3.0,'2025-02-18','2026-01-30',false,'Fin de contrat : APA non renouvelée.',null),
 ('SIM Lefebvre','Armand','particulier','particulier',22.0,'ht',0,2,'2025-08-25','2025-12-19',false,'Fin de contrat : Entrée en maison de retraite.',null),
 ('SIM Michel','Paulette','prestataire','autre',16.5,'ht',0,2,'2025-07-15','2025-10-24',false,'Fin de contrat : Repris en interne par l''entreprise.','SIM Vercors Présence'),
 ('SIM Garcia','Antonio','cesu','particulier',21.0,'net',0,2,'2025-09-08','2026-03-27',false,'Fin de contrat : Désaccord sur les horaires.',null),
 ('SIM David','Léone','particulier','particulier',22.0,'ht',0,1.0,'2025-07-21','2025-07-30',false,'Fin de contrat : Convalescence terminée.',null),
 ('SIM Bertrand','Louis','prestataire','autre',16.2,'ht',0,2,'2025-09-22','2026-04-03',false,'Fin de contrat : Décès.','SIM Alpes Services à Domicile'),
 ('SIM Roussel','Odile','pch','mdph',20.0,'brut',0,2,'2026-01-12','2026-06-26',false,'Fin de contrat : Fin des droits PCH.',null),
 ('SIM Vincent','Huguette','cesu','particulier',21.0,'net',0,3,'2026-01-14','2026-05-15',false,'Fin de contrat : Déménagement.',null),
 ('SIM Fabre','Jacques','particulier','particulier',22.0,'ht',0,2,'2026-02-10','2026-02-24',false,'Fin de contrat : Mission ponctuelle terminée.',null),
 ('SIM Morel','Solange','apa','conseil_departemental',23.5,'ttc',0,3.0,'2025-11-10','2026-07-17',false,'Fin de contrat : Dépendance trop lourde.',null),
 ('SIM Girard','Yvonne','prestataire','autre',15.6,'ht',0,3,'2026-03-04','2026-07-31',false,'Fin de contrat : Impayé litigieux.','SIM Maison Aide Isère'),
 ('SIM Clément','Bernard','particulier','particulier',22.0,'ht',0,3,'2026-04-14','2026-08-28',false,'Fin de contrat : Concurrent moins cher.',null),
 ('SIM Gauthier','Marthe','mutuelle','mutuelle',21.0,'ht',0,2,'2026-05-12','2026-08-07',false,'Fin de contrat : Fin de prise en charge mutuelle.',null)
) as x(nom,prenom,t,f,tarif,mode,tva,h,d1,d2,actif,notes,payeur)
join public.clients c on c.nom = x.nom and c.prenom = x.prenom and c.type_client = 'particulier'
left join public.clients p on p.nom = x.payeur and p.type_client = 'entreprise';

-- 4. PLANNING : séries récurrentes (jours 1=lundi … 7=dimanche) et visites ponctuelles
insert into public.planning_series (client_id, contrat_id, type_planning, date_debut, date_fin, heure_debut, heure_fin, jours_semaine, frequence_semaines, notes)
select c.id, k.id, x.typ, x.d1::date, x.d2::date, x.h1::time, x.h2::time, x.jours, x.freq, x.notes
from (values
 ('SIM Durand','Jeanne','recurrent','2025-01-13',null,'09:00','11:00',array[1,4]::smallint[],1,null),
 ('SIM Lefèvre','Marcel','recurrent','2025-01-21',null,'14:00','15:30',array[2,5]::smallint[],1,null),
 ('SIM Petit','Yvette','recurrent','2025-03-03',null,'14:00','16:30',array[1,3]::smallint[],1,null),
 ('SIM Girard','Michel','recurrent','2025-09-05',null,'10:00','13:00',array[5]::smallint[],1,null),
 ('SIM Roux','Henri','recurrent','2026-01-17',null,'09:00','11:00',array[6]::smallint[],1,null),
 ('SIM Garnier','Odette','recurrent','2026-05-06',null,'09:00','11:00',array[3]::smallint[],1,null),
 ('SIM Fournier','Lucie','recurrent','2026-07-16',null,'14:00','16:00',array[4]::smallint[],2,'Un jeudi sur deux'),
 ('SIM Rousseau','Paul','recurrent','2025-09-08',null,'11:45','13:15',array[1,3]::smallint[],1,null),
 ('SIM Blanc','Simone','recurrent','2025-02-10',null,'16:45','18:45',array[1]::smallint[],1,null),
 ('SIM Blanc','Simone','recurrent','2025-02-13',null,'16:45','17:45',array[4]::smallint[],1,null),
 ('SIM Marchand','Georges','recurrent','2026-06-02',null,'08:00','10:00',array[2]::smallint[],1,null),
 ('SIM Perrin','Lucienne','recurrent','2026-07-07',null,'10:30','12:00',array[2]::smallint[],1,null),
 ('SIM Vidal','Berthe','recurrent','2026-08-26',null,'16:45','18:45',array[3]::smallint[],1,null),
 ('SIM Henry','Roger','recurrent','2026-09-03',null,'11:45','13:45',array[4]::smallint[],1,null),
 ('SIM Chevalier','Paulette','recurrent','2026-09-11',null,'07:30','09:30',array[5]::smallint[],1,null),
 ('SIM Lambert','Émile','recurrent','2026-09-11',null,'16:00','18:00',array[5]::smallint[],1,null),
 ('SIM Mercier','Josette','recurrent','2026-09-19',null,'11:30','13:30',array[6]::smallint[],1,null),
 ('SIM Faure','Armand','recurrent','2026-09-29',null,'16:00','17:00',array[2]::smallint[],2,'Un mardi sur deux'),
 ('SIM Martin','Jeanne','recurrent','2025-01-07','2025-06-27','08:45','10:15',array[2]::smallint[],1,null),
 ('SIM Martin','Jeanne','recurrent','2025-01-10','2025-06-27','10:15','11:45',array[5]::smallint[],1,null),
 ('SIM Bernard','Gaston','recurrent','2025-01-20','2025-09-12','07:00','08:30',array[1]::smallint[],1,null),
 ('SIM Bernard','Gaston','recurrent','2025-01-15','2025-09-12','18:45','20:15',array[3]::smallint[],1,null),
 ('SIM Thomas','Colette','ponctuel','2025-02-20',null,'19:45','21:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Thomas','Colette','ponctuel','2025-03-06',null,'14:00','16:00',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Thomas','Colette','ponctuel','2025-03-20',null,'11:30','13:30',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Thomas','Colette','ponctuel','2025-04-03',null,'06:30','08:30',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Thomas','Colette','ponctuel','2025-04-17',null,'12:45','14:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Robert','Alain','recurrent','2025-02-04','2025-11-28','18:45','20:45',array[2]::smallint[],1,null),
 ('SIM Richard','Madeleine','recurrent','2025-01-14','2025-05-22','11:00','12:30',array[2]::smallint[],1,null),
 ('SIM Richard','Madeleine','recurrent','2025-01-10','2025-05-22','17:30','19:00',array[5]::smallint[],1,null),
 ('SIM Petitjean','Roger','recurrent','2025-03-11','2025-12-19','16:15','18:15',array[2]::smallint[],1,null),
 ('SIM Durand','Éliane','recurrent','2025-04-07','2025-08-29','11:30','13:30',array[1]::smallint[],1,null),
 ('SIM Leroy','Fernand','recurrent','2025-05-14','2025-07-25','07:30','09:00',array[3]::smallint[],1,null),
 ('SIM Leroy','Fernand','recurrent','2025-05-14','2025-07-25','09:30','11:00',array[3]::smallint[],1,null),
 ('SIM Moreau','Gisèle','ponctuel','2025-06-10',null,'11:15','13:15',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Moreau','Gisèle','ponctuel','2025-06-12',null,'19:00','21:00',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Moreau','Gisèle','ponctuel','2025-06-17',null,'10:45','12:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Moreau','Gisèle','ponctuel','2025-06-19',null,'18:45','20:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Moreau','Gisèle','ponctuel','2025-06-24',null,'10:45','12:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Moreau','Gisèle','ponctuel','2025-06-26',null,'14:00','16:00',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Simon','Raymond','recurrent','2025-06-05','2026-02-06','11:30','13:00',array[4]::smallint[],1,null),
 ('SIM Simon','Raymond','recurrent','2025-06-06','2026-02-06','17:45','19:15',array[5]::smallint[],1,null),
 ('SIM Laurent','Denise','recurrent','2025-02-21','2026-01-30','07:30','09:00',array[5]::smallint[],1,null),
 ('SIM Laurent','Denise','recurrent','2025-02-22','2026-01-30','13:15','14:45',array[6]::smallint[],1,null),
 ('SIM Lefebvre','Armand','recurrent','2025-08-26','2025-12-19','11:15','13:15',array[2]::smallint[],1,null),
 ('SIM Michel','Paulette','recurrent','2025-07-15','2025-10-24','07:30','09:30',array[2]::smallint[],1,null),
 ('SIM Garcia','Antonio','recurrent','2025-09-11','2026-03-27','13:45','15:45',array[4]::smallint[],1,null),
 ('SIM David','Léone','ponctuel','2025-07-21',null,'19:30','20:30',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-22',null,'12:00','13:00',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-23',null,'11:45','12:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-24',null,'19:15','20:15',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-25',null,'09:30','10:30',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-26',null,'16:15','17:15',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-27',null,'19:00','20:00',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-28',null,'19:15','20:15',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-29',null,'11:00','12:00',null::smallint[],1,'Visite ponctuelle'),
 ('SIM David','Léone','ponctuel','2025-07-30',null,'08:45','09:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Bertrand','Louis','recurrent','2025-09-25','2026-04-03','18:30','20:30',array[4]::smallint[],1,null),
 ('SIM Roussel','Odile','recurrent','2026-01-14','2026-06-26','17:00','19:00',array[3]::smallint[],1,null),
 ('SIM Vincent','Huguette','recurrent','2026-01-17','2026-05-15','19:00','21:00',array[6]::smallint[],1,null),
 ('SIM Fabre','Jacques','ponctuel','2026-02-10',null,'18:30','20:30',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Fabre','Jacques','ponctuel','2026-02-17',null,'16:45','18:45',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Fabre','Jacques','ponctuel','2026-02-24',null,'08:15','10:15',null::smallint[],1,'Visite ponctuelle'),
 ('SIM Morel','Solange','recurrent','2025-11-15','2026-07-17','16:45','18:15',array[6]::smallint[],1,null),
 ('SIM Morel','Solange','recurrent','2025-11-12','2026-07-17','07:00','08:30',array[3]::smallint[],1,null),
 ('SIM Girard','Yvonne','recurrent','2026-03-10','2026-07-31','18:45','20:45',array[2]::smallint[],1,null),
 ('SIM Clément','Bernard','recurrent','2026-04-14','2026-08-28','16:00','18:00',array[2]::smallint[],1,null),
 ('SIM Gauthier','Marthe','recurrent','2026-05-16','2026-08-07','13:15','15:15',array[6]::smallint[],1,null)
) as x(nom,prenom,typ,d1,d2,h1,h2,jours,freq,notes)
join public.clients c on c.nom = x.nom and c.prenom = x.prenom and c.type_client = 'particulier'
left join lateral (select id from public.contrats k where k.client_id = c.id order by k.date_debut desc limit 1) k on true;

-- 5. GÉNÉRATION DES VISITES (jusqu'à fin octobre 2026)
select public.generer_visites(s.id, date '2026-10-31')
from public.planning_series s join public.clients c on c.id = s.client_id
where c.nom like 'SIM %';

-- 6. CONGÉS DE JULIA (3 sem. en août 2025, Noël 2025, 1 sem. avril 2026, 3 sem. août 2026) : pas de visites
delete from public.visites v using public.clients c where c.id = v.client_id and c.nom like 'SIM %' and v.date_visite between date '2025-08-04' and date '2025-08-22';
delete from public.visites v using public.clients c where c.id = v.client_id and c.nom like 'SIM %' and v.date_visite between date '2025-12-22' and date '2025-12-28';
delete from public.visites v using public.clients c where c.id = v.client_id and c.nom like 'SIM %' and v.date_visite between date '2026-04-20' and date '2026-04-24';
delete from public.visites v using public.clients c where c.id = v.client_id and c.nom like 'SIM %' and v.date_visite between date '2026-08-03' and date '2026-08-21';

-- Chaque visite prend le contrat valable à sa date (tarifs qui changent)
update public.visites v set contrat_id = k.id
from public.contrats k, public.clients c
where c.id = v.client_id and c.nom like 'SIM %' and k.client_id = v.client_id
  and v.date_visite between k.date_debut and coalesce(k.date_fin, date '2100-01-01');

-- 7. VISITES PASSÉES (avant le 3 octobre 2026) : réalisées, avec un petit écart d'heures de temps en temps
update public.visites v set statut = 'realisee',
  heures_reelles = round((extract(epoch from (v.heure_fin - v.heure_debut)) / 3600.0
     + case abs(hashtext(c.nom || v.date_visite::text)) % 25 when 0 then 0.5 when 1 then 0.25 when 2 then -0.25 else 0 end)::numeric, 2)
from public.clients c
where c.id = v.client_id and c.nom like 'SIM %' and v.date_visite < date '2026-10-03';

-- Notes de visite
update public.visites v set note = (array['Courses en plus à la demande de la famille.','A voulu sortir marcher, visite un peu plus courte.','Rendez-vous médecin : départ plus tôt.','Frigo à vider, produits périmés jetés.','Linge à étendre, panier très plein.','Chien agité, visite écourtée.','Très bavard(e), a dépassé l''horaire.','Ascenseur en panne, montée à pied avec les courses.'])[1 + abs(hashtext(v.id::text)) % 8]
from public.clients c
where c.id = v.client_id and c.nom like 'SIM %' and v.statut = 'realisee' and abs(hashtext(c.nom || v.date_visite::text || 'n')) % 30 = 0;

-- 8. VISITES PERDUES (environ 6 %) : annulations, reports, absences. Motif, facturée ou non, rattrapée ou non.
update public.visites v set
  statut = case h.m when 3 then 'absence_beneficiaire' when 4 then 'reportee' when 7 then 'absence_intervenant' when 8 then 'absence_beneficiaire' else 'annulee' end,
  motif_perte = case h.m when 3 then 'absence_beneficiaire' when 4 then 'report' when 5 then 'hospitalisation' when 6 then 'conges_beneficiaire'
                         when 7 then 'maladie_intervenant' when 8 then 'absence_beneficiaire' else 'annulation_client' end,
  facturee = case when h.m in (3,8) then true when h.m = 9 then true else false end,
  rattrapee = case when h.m = 4 then true when h.m in (0,1,2) and h.r % 3 = 0 then true else false end,
  heures_reelles = null, note = null
from (select v2.id, (abs(hashtext(c2.nom || v2.date_visite::text || 'p')) / 100) % 10 as m, abs(hashtext(v2.id::text)) as r
      from public.visites v2 join public.clients c2 on c2.id = v2.client_id
      where c2.nom like 'SIM %' and v2.date_visite < date '2026-10-03' and abs(hashtext(c2.nom || v2.date_visite::text || 'p')) % 100 < 6) h
where h.id = v.id;

-- Semaine de maladie de Julia : 9 au 13 mars 2026, toutes les visites perdues et non facturées
update public.visites v set statut = 'absence_intervenant', motif_perte = 'maladie_intervenant', facturee = false, rattrapee = false,
  heures_reelles = null, note = 'Julia malade (grippe), prévenu(e) par téléphone.'
from public.clients c
where c.id = v.client_id and c.nom like 'SIM %' and v.date_visite between date '2026-03-09' and date '2026-03-13';

-- 9. ANNOTATIONS PERSONNELLES (historique, litiges, précautions)
insert into public.annotations_client (client_id, texte, cree_le)
select c.id, x.t, x.d::timestamptz from (values
 ('SIM Durand','Jeanne','La fille souhaite décaler les horaires du jeudi : refusé, créneau déjà pris.','2025-03-14 10:00:00+02'),
 ('SIM Durand','Jeanne','Mme Durand a chuté dans la salle de bains, médecin prévenu. À surveiller.','2026-06-02 10:00:00+02'),
 ('SIM Lefèvre','Marcel','Conteste les heures du 28/03 : il dit que Julia est partie 20 min plus tôt.','2025-04-04 10:00:00+02'),
 ('SIM Lefèvre','Marcel','Nouveau tarif accepté par le fils par téléphone.','2026-01-05 10:00:00+02'),
 ('SIM Petit','Yvette','Passage à l''APA : dossier validé. Premier paiement attendu sous 60 jours.','2025-09-01 10:00:00+02'),
 ('SIM Petit','Yvette','Département : retard de paiement de 3 mois, relance envoyée.','2026-03-10 10:00:00+02'),
 ('SIM Petit','Yvette','Renouvellement APA à demander avant fin septembre.','2026-09-01 10:00:00+02'),
 ('SIM Girard','Michel','Notification PCH terminée : visites maintenues en attendant la réponse de la MDPH.','2026-08-31 10:00:00+02'),
 ('SIM Girard','Michel','Contrat échu mais visites continuées : régulariser.','2026-09-15 10:00:00+02'),
 ('SIM Roux','Henri','Chèque rejeté (provision insuffisante). Régularisé par virement le 04/03.','2026-02-20 10:00:00+02'),
 ('SIM Garnier','Odette','Aucun contact famille : prévenir M. Bonnet en cas d''absence.','2026-01-12 10:00:00+02'),
 ('SIM Fournier','Lucie','Plafond mutuelle : 20 h/mois. Envoyer justificatifs avant le 5 de chaque mois.','2026-01-15 10:00:00+02'),
 ('SIM Rousseau','Paul','Début de prestation pour Alpes Services à Domicile. Récapitulatif d''heures à faire signer.','2025-04-07 10:00:00+02'),
 ('SIM Vidal','Berthe','Vercors Présence : la facture d''août n''est pas encore réglée. En 2025 ils payaient à 100 jours.','2026-09-30 10:00:00+02'),
 ('SIM Lambert','Émile','Le bénéficiaire propose de payer Julia en direct : clause de non-sollicitation, à vérifier avec l''entreprise.','2026-09-20 10:00:00+02'),
 ('SIM Martin','Jeanne','Décès de Mme Martin. Condoléances transmises à la famille.','2025-06-27 10:00:00+02'),
 ('SIM Durand','Éliane','Litige : refuse de payer 6 h. Dossier clos sans accord. Solde impayé.','2025-08-29 10:00:00+02'),
 ('SIM Simon','Raymond','Décès de M. Simon. Dernière facture réglée par la fille.','2026-02-06 10:00:00+02'),
 ('SIM Bertrand','Louis','Décès de M. Bertrand. Facture finale à envoyer à l''entreprise.','2026-04-03 10:00:00+02'),
 ('SIM Morel','Solange','GIR 1 : arrêt de la prestation, intervention à deux personnes nécessaire.','2026-07-17 10:00:00+02'),
 ('SIM Girard','Yvonne','Maison Aide Isère conteste 3 factures : en attente de rapprochement.','2026-07-31 10:00:00+02')
) as x(nom,prenom,t,d)
join public.clients c on c.nom = x.nom and c.prenom = x.prenom and c.type_client = 'particulier';

-- Contrôle : lignes créées
select (select count(*) from public.clients where nom like 'SIM %' and type_client = 'particulier') as clients, (select count(*) from public.clients where nom like 'SIM %' and type_client = 'particulier' and actif) as clients_actifs, (select count(*) from public.visites v join public.clients c on c.id = v.client_id where c.nom like 'SIM %') as visites;
