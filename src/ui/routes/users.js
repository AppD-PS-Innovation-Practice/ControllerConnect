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

// User model
const User = require('../models/user');

/* list all users */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM Admin'
        );
        res.render('users', {
            title: 'Users',
            results: result.rows,
        });
    } catch (error) {
        console.error('Error executing user list', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

// new user form
router.get('/add', async (req, res) => {
    res.render('add_user', {
        title: 'Add User'
    });
});

// submit new user 
router.post('/add', async (req, res) => {

    try {
        const result = await pool.query(
            'INSERT INTO Admin (user_id, user_pass, user_email) VALUES ($1, $2, $3)',
            [req.body.user_id, req.body.user_pass, req.body.user_email]
        );

        res.render('results', {
            title: 'SUCCESS - User Added',
            results: 'SUCCESS - User Added',
            goback: '/users/'
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
            'SELECT * FROM Admin WHERE id=$1',
            [req.params.id]
        );

        res.render('edit_user', {
            title: 'Edit User',
            results: result.rows[0],
            query: req.params.id,
        });
    } catch (error) {
        console.error('Error executing user edit', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

// update submit new user
router.post('/edit/:id', async (req, res) => {

    try {
        const result = await pool.query(
            'UPDATE Admin SET user_id=$1, user_pass=$2, user_email=$3 WHERE id=$4',
            [req.body.user_id, req.body.user_pass, req.body.user_email, req.params.id]
        );

        res.render('results', {
            title: 'SUCCESS - User Updated',
            results: 'SUCCESS - User Updated',
            goback: '/users/'
        });

    } catch (error) {
        console.error('Error executing user update', error.stack);
        res.status(500).send('Internal Server Error');
    }

});

// Delete post
router.delete('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM Admin WHERE id=$1',
            [req.params.id]
        );

        res.render('results', {
            title: 'SUCCESS - User Deleted',
            results: 'SUCCESS - User Deleted',
            goback: '/users/'
        });

    } catch (error) {
        console.error('Error executing user delete', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

// get single user
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM Admin WHERE id=$1',
            [req.params.id]
        );

        console.error("user JSON.stringify(result): " + JSON.stringify(result));
        console.error(result.rows[0]);
        console.error("user JSON.stringify(result.rows[0]): " + JSON.stringify(result.rows[0]));

        res.render('user', {
            title: 'Get User',
            results: result.rows[0],
            query: req.params.id,
        });
    } catch (error) {
        console.error('Error executing user query', error.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;