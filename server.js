// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import db from './config/db.js';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/js', express.static(path.join(__dirname, 'js')));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());






app.get('/', async (req, res) => {
    try {
        const [offers] = await db.query(`
            SELECT o.*, e.nom AS entreprise_nom, e.logo_url,
                   GROUP_CONCAT(t.nom) AS technologies
            FROM offre o
            JOIN entreprise e ON o.entreprise_id = e.id
            LEFT JOIN offre_technologie ot ON o.id = ot.offre_id
            LEFT JOIN technologie t ON ot.technologie_id = t.id
            GROUP BY o.id
            ORDER BY o.date_publication DESC
            LIMIT 6
        `);

        res.render('index', { 
            title: 'Accueil - StageFinder',
            offers: offers 
        });
    } catch (error) {
        console.error('Erreur SQL:', error);
        res.status(500).send('Erreur serveur lors de la récupération des offres.');
    }
});


app.get('/search', async (req, res) => {
    try {
        const { q, city, contrat, tech, sort } = req.query;

        let sql = `
            SELECT o.*, e.nom AS entreprise_nom, e.logo_url,
                   GROUP_CONCAT(t.nom) AS technologies
            FROM offre o
            JOIN entreprise e ON o.entreprise_id = e.id
            LEFT JOIN offre_technologie ot ON o.id = ot.offre_id
            LEFT JOIN technologie t ON ot.technologie_id = t.id
            WHERE 1=1
        `;
        const params = [];

        
        if (q && q.trim() !== '') {
            sql += ` AND (o.titre LIKE ? OR o.description_courte LIKE ?)`;
            params.push(`%${q}%`, `%${q}%`);
        }

        
        if (city && city !== 'all') {
            sql += ` AND o.ville = ?`;
            params.push(city);
        }

        
        if (contrat && contrat !== 'all') {
            sql += ` AND o.type_contrat = ?`;
            params.push(contrat);
        }

        sql += ` GROUP BY o.id`;

        
        if (tech && tech !== 'all') {
            sql += ` HAVING FIND_IN_SET(?, GROUP_CONCAT(t.nom))`;
            params.push(tech);
        }

        
        const sortOrder = (sort === 'asc') ? 'ASC' : 'DESC';
        sql += ` ORDER BY o.date_publication ${sortOrder}`;

        const [offers] = await db.query(sql, params);
        const [cities] = await db.query('SELECT DISTINCT ville FROM offre');
        const [technologies] = await db.query('SELECT * FROM technologie');

        res.render('search-offers', {
            title: 'Recherche - StageFinder',
            offers,
            cities,
            technologies,
            filters: { q, city, contrat, tech, sort }
        });
    } catch (error) {
        console.error('Erreur SQL Search:', error);
        res.status(500).send('Erreur lors de la recherche.');
    }
});


app.get('/offer/:id', async (req, res) => {
    try {
        const offerId = req.params.id;

        const [offers] = await db.query(`
            SELECT o.*, e.nom AS entreprise_nom, e.logo_url,
                   GROUP_CONCAT(t.nom) AS technologies
            FROM offre o
            JOIN entreprise e ON o.entreprise_id = e.id
            LEFT JOIN offre_technologie ot ON o.id = ot.offre_id
            LEFT JOIN technologie t ON ot.technologie_id = t.id
            WHERE o.id = ?
            GROUP BY o.id
        `, [offerId]);

        if (offers.length === 0) {
            return res.status(404).send('Offre non trouvée');
        }

        res.render('offer-details', {
            title: `${offers[0].titre} - StageFinder`,
            offer: offers[0]
        });
    } catch (error) {
        console.error('Erreur SQL Details:', error);
        res.status(500).send('Erreur serveur.');
    }
});


app.get('/track', (req, res) => {
    res.render('offers-submitting', { title: 'Suivi de candidatures - StageFinder' });
});






app.get('/admin', async (req, res) => {
    try {
        const [offers] = await db.query(`
            SELECT o.*, e.nom AS entreprise_nom,
                   GROUP_CONCAT(t.nom) AS technologies
            FROM offre o
            JOIN entreprise e ON o.entreprise_id = e.id
            LEFT JOIN offre_technologie ot ON o.id = ot.offre_id
            LEFT JOIN technologie t ON ot.technologie_id = t.id
            GROUP BY o.id
            ORDER BY o.date_publication DESC
        `);

        res.render('admin/index', {
            title: 'Back-Office - Admin',
            offers
        });
    } catch (error) {
        console.error('Erreur SQL Admin:', error);
        res.status(500).send('Erreur lors du chargement du back-office.');
    }
});


app.get('/admin/offers/create', async (req, res) => {
    try {
        const [entreprises] = await db.query('SELECT * FROM entreprise');
        const [technologies] = await db.query('SELECT * FROM technologie');

        res.render('admin/create', {
            title: 'Ajouter une offre',
            entreprises,
            technologies
        });
    } catch (error) {
        console.error('Erreur SQL Create Form:', error);
        res.status(500).send('Erreur serveur.');
    }
});


app.post('/admin/offers/create', async (req, res) => {
    try {
        const { titre, entreprise_id, ville, type_contrat, description_courte, description_longue, technologies } = req.body;
        const date_publication = new Date().toISOString().split('T')[0];

        const [result] = await db.query(
            `INSERT INTO offre (titre, entreprise_id, ville, type_contrat, description_courte, description_longue, date_publication)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [titre, entreprise_id, ville, type_contrat, description_courte, description_longue, date_publication]
        );

        const newOffreId = result.insertId;

        
        if (technologies) {
            const techArray = Array.isArray(technologies) ? technologies : [technologies];
            for (const techId of techArray) {
                await db.query(
                    `INSERT INTO offre_technologie (offre_id, technologie_id) VALUES (?, ?)`,
                    [newOffreId, techId]
                );
            }
        }

        res.redirect('/admin');
    } catch (error) {
        console.error('Erreur SQL Create Offer:', error);
        res.status(500).send('Erreur lors de la création de l\'offre.');
    }
});


app.get('/admin/offers/edit/:id', async (req, res) => {
    try {
        const offerId = req.params.id;

        const [offers] = await db.query('SELECT * FROM offre WHERE id = ?', [offerId]);
        if (offers.length === 0) return res.status(404).send('Offre non trouvée');

        const [entreprises] = await db.query('SELECT * FROM entreprise');
        const [technologies] = await db.query('SELECT * FROM technologie');
        
        const [selectedTechs] = await db.query(
            'SELECT technologie_id FROM offre_technologie WHERE offre_id = ?',
            [offerId]
        );
        const selectedTechIds = selectedTechs.map(t => t.technologie_id);

        res.render('admin/edit', {
            title: 'Modifier l\'offre',
            offer: offers[0],
            entreprises,
            technologies,
            selectedTechIds
        });
    } catch (error) {
        console.error('Erreur SQL Edit Form:', error);
        res.status(500).send('Erreur serveur.');
    }
});


app.post('/admin/offers/edit/:id', async (req, res) => {
    try {
        const offerId = req.params.id;
        const { titre, entreprise_id, ville, type_contrat, description_courte, description_longue, technologies } = req.body;

        await db.query(
            `UPDATE offre SET titre = ?, entreprise_id = ?, ville = ?, type_contrat = ?, description_courte = ?, description_longue = ?
             WHERE id = ?`,
            [titre, entreprise_id, ville, type_contrat, description_courte, description_longue, offerId]
        );

        
        await db.query('DELETE FROM offre_technologie WHERE offre_id = ?', [offerId]);

        if (technologies) {
            const techArray = Array.isArray(technologies) ? technologies : [technologies];
            for (const techId of techArray) {
                await db.query(
                    `INSERT INTO offre_technologie (offre_id, technologie_id) VALUES (?, ?)`,
                    [offerId, techId]
                );
            }
        }

        res.redirect('/admin');
    } catch (error) {
        console.error('Erreur SQL Edit Offer:', error);
        res.status(500).send('Erreur lors de la modification.');
    }
});


app.post('/admin/offers/delete/:id', async (req, res) => {
    try {
        const offerId = req.params.id;
        await db.query('DELETE FROM offre WHERE id = ?', [offerId]);
        res.redirect('/admin');
    } catch (error) {
        console.error('Erreur SQL Delete Offer:', error);
        res.status(500).send('Erreur lors de la suppression.');
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré avec succès sur http://localhost:${PORT}`);
});