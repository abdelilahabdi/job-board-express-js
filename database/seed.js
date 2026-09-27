// database/seed.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const seed = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'jobboard_db',
      multipleStatements: true
    });

    console.log('✅ Connecté à la base de données MySQL...');

    // إفراغ الجداول لتجنب التكرار
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('TRUNCATE TABLE offre_technologie;');
    await connection.query('TRUNCATE TABLE offre;');
    await connection.query('TRUNCATE TABLE technologie;');
    await connection.query('TRUNCATE TABLE entreprise;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    // 1. إدخال 5 شركات
    await connection.query(`
      INSERT INTO entreprise (nom, logo_url) VALUES 
      ('Nexora Digital', '/assets/images/company-placeholder.png'),
      ('TechVision Maroc', '/assets/images/company-placeholder.png'),
      ('Atlas Digital', '/assets/images/company-placeholder.png'),
      ('InnoTech', '/assets/images/company-placeholder.png'),
      ('WebCraft Agency', '/assets/images/company-placeholder.png');
    `);
    console.log('✅ 5 Entreprises insérées.');

    // 2. إدخال 8 تقنيات
    await connection.query(`
      INSERT INTO technologie (nom) VALUES 
      ('JavaScript'), ('React'), ('TypeScript'), ('Node.js'),
      ('Express'), ('MongoDB'), ('Tailwind CSS'), ('MySQL');
    `);
    console.log('✅ 8 Technologies insérées.');

    // 3. إدخال 12 عرض عمل
    await connection.query(`
      INSERT INTO offre (titre, description_courte, description_longue, ville, type_contrat, date_publication, entreprise_id) VALUES 
      ('Frontend React Developer', 'Développement de composants UI modernes en React.', 'Recherche stagiaire Frontend React.', 'Casablanca', 'Stage', '2026-09-01', 1),
      ('Développeur Full Stack Node/React', 'Création d’applications web SaaS.', 'Mission d’alternance en Full Stack JS.', 'Rabat', 'Alternance', '2026-09-02', 1),
      ('Stagiaire Backend Node.js', 'Conception et maintenance d’APIs REST.', 'Stage pour développer des microservices.', 'Marrakech', 'Stage', '2026-09-03', 2),
      ('Développeur Web Frontend Tailwind', 'Intégration d’interfaces responsive.', 'Intégration maquettes Figma.', 'Tanger', 'Stage', '2026-09-05', 2),
      ('Alternant Développeur TypeScript', 'Développement d’applications robustes.', 'Alternance axée sur TypeScript et Node.js.', 'Casablanca', 'Alternance', '2026-09-06', 3),
      ('Développeur MySQL & Backend', 'Optimisation et gestion des bases de données.', 'Mission de stage en gestion de données relationnelles.', 'Agadir', 'Stage', '2026-09-08', 3),
      ('Stagiaire Développeur JavaScript Vanilla', 'Création de scripts.', 'Projet d’intégration web en JS natif.', 'Oujda', 'Stage', '2026-09-10', 4),
      ('Full Stack JS Alternance', 'Maintenance de plateformes e-commerce.', 'Alternance 12 mois au sein d’une équipe agile.', 'Fès', 'Alternance', '2026-09-12', 4),
      ('Développeur Web Junior', 'Support et développement de fonctionnalités.', 'Stage d’initiation aux méthodologies agiles.', 'Casablanca', 'Stage', '2026-09-14', 5),
      ('Alternant Integration', 'Création de composants réutilisables.', 'Alternance orientée design system et UI.', 'Rabat', 'Alternance', '2026-09-15', 5),
      ('Stagiaire Développeur Express.js', 'Développement de microservices.', 'Stage d’immersion backend.', 'Marrakech', 'Stage', '2026-09-16', 1),
      ('Développeur Full Stack React/MySQL', 'Conception de solutions complètes.', 'Alternance pour étudiants en Master.', 'Tanger', 'Alternance', '2026-09-18', 2);
    `);
    console.log('✅ 12 Offres insérées.');

    // 4. ربط العروض بالتقنيات
    await connection.query(`
      INSERT INTO offre_technologie (offre_id, technologie_id) VALUES 
      (1, 1), (1, 2), (1, 7),
      (2, 1), (2, 2), (2, 4), (2, 5), (2, 8),
      (3, 4), (3, 5), (3, 6),
      (4, 1), (4, 7),
      (5, 1), (5, 3), (5, 4),
      (6, 4), (6, 8),
      (7, 1),
      (8, 1), (8, 2), (8, 4), (8, 5),
      (9, 1), (9, 7),
      (10, 1), (10, 2), (10, 7),
      (11, 4), (11, 5), (11, 8),
      (12, 2), (12, 4), (12, 5), (12, 8);
    `);
    console.log('✅ Associations Offre-Technologie insérées.');

    console.log('🎉 Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
};

seed();