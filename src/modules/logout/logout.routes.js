const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'logout successfully, remove token on client'
    });
});

module.exports = router;