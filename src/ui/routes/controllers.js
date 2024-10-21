const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'db',
    database: 'controller_connect',
    password: 'example',
    port: 5432,
});

// Controller model
const Controller = require('../models/controller');

/* list all controllers */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Controllers');
        res.render('controllers', {
            title: 'Controllers',
            results: result.rows,
        });
    } catch (error) {
        console.error('Error executing query', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

// new controller form
router.get('/add', function (req, res) {
    res.render('add_controller', {
        title: 'Add Controller'
    });
});

// submit new controller
router.post('/add', async (req, res) => {

    try {
        const result = await pool.query(
            'INSERT INTO Controllers (controller_name, client_id, client_secret) VALUES ($1, $2, $3)',
            [req.body.controller_name, req.body.client_id, req.body.client_secret]
        );

        res.render('results', {
            title: 'SUCCESS - Controller Added',
            results: 'SUCCESS - Controller Added',
            goback: '/controllers/'
        });

    } catch (error) {
        console.error('Error executing user add', error.stack);
        res.status(500).send('Internal Server Error');
    }

});

// load edit form
router.get('/edit/:id', async (req, res) => {

    try {
        const result = await pool.query(
            'SELECT * FROM Controllers WHERE id=$1',
            [req.params.id]
        );

        res.render('edit_controller', {
            title: 'Edit Controller',
            results: result.rows[0],
            query: req.params.id,
        });
    } catch (error) {
        console.error('Error executing controller edit', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

// update submit new controller
router.post('/edit/:id', async (req, res) => {

    try {
        const result = await pool.query(
            'UPDATE Controllers SET controller_name=$1, client_id=$2, client_secret=$3 WHERE id=$4',
            [req.body.controller_name, req.body.client_id, req.body.client_secret, req.params.id]
        );

        res.render('results', {
            title: 'SUCCESS - Controller Updated',
            results: 'SUCCESS - Controller Updated',
            goback: '/controllers/'
        });

    } catch (error) {
        console.error('Error executing controller update', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

// Delete post
router.delete('/:id', async (req, res) => {

    try {
        const result = await pool.query(
            'DELETE FROM Controllers WHERE id=$1',
            [req.params.id]
        );

        res.render('results', {
            title: 'SUCCESS - Controller Deleted',
            results: 'SUCCESS - Controller Deleted',
            goback: '/controllers/'
        });

    } catch (error) {
        console.error('Error executing controller delete', error.stack);
        res.status(500).send('Internal Server Error');
    }

});

// get single controller
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM Controllers WHERE id=$1',
            [req.params.id]
        );
        
        console.error("controller JSON.stringify(result): " + JSON.stringify(result));
        console.error(result.rows[0]);
        console.error("controller JSON.stringify(result.rows[0]): " + JSON.stringify(result.rows[0]));

        res.render('controller', {
            title: 'Get Controller',
            results: result.rows[0],
            query: req.params.id,
        });
    } catch (error) {
        console.error('Error executing controller query', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;