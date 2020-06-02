const router = require('express').Router();

const Users = require('../users/users-model.js');

const bcrypt = require('bcryptjs');

router.get('/secret', (req, res, next) => {
    if(req.headers.authorization){
        bcrypt.hash(req.headers.authorization, 10, (err, hash) => {
            if(err){
                res.status(500).json({ oops: 'Something is not working..'});
            } else {
                res.status(200).json({ hash })
            }
        })
    } else {
        res.status(400).json({ error: 'missing header'});
    }
});

router.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(req.body.password, 8);
    user.password = hash;

    Users.add(user)
    .then(saved => {
        res.status(201).json(saved);
    })
    .catch(error => {
        res.status(500).json(error);
    });
});

router.post('/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
    .first()
    .then(user => {
        if (user && bcrypt.compareSync(password, user.password)){
            req.session.loggedIn = true;
            req.session.userId = user.id;

            res.status(200).json({ message: `You're Logged in! Welcome ${user.username}!`});
        } else {
            res.status(401).json({ message: 'You Shall NOT Pass!'});
        }
    })
    .catch(error => {
        res.status(500).json(error);
    });
});

router.get('/logout', (req, res) => {
    if (req.session){
        req.session.destroy(err => {
            if (err) {
                res.status(500).json({
                    message: "Cannot log out."
                });
            } else {
                res.status(200).json({ message: "Bye. Thanks for visiting!"})
            }
        });
    } else {
        res.status(204);
    }
});

module.exports = router;