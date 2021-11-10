const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  res.send('Assalomu alaykum')
})

module.exports = router;