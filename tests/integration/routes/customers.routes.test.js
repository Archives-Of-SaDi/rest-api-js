const request = require('supertest');
const { Types: { ObjectId } } = require('mongoose');
const { Customer } = require('../../../models/customer.model');
const { User } = require('../../../models/user.models');
let server;

describe('/api/customers', () => {
  beforeEach(() => {
    server = require('../../../index');
  })

  afterEach(async () => {
    server.close();
    await Customer.remove({});
  })

  describe('GET /', () => {
    it('should return all customers', async () => {
      await Customer.collection.insertMany([
        {
          name: 'Sayidulloh',
          phone: '+998999090310',
          isVip: false,
          bonusPoints: 0
        },
        {
          name: 'Sayidulloh',
          phone: '+998999090310',
          isVip: false,
          bonusPoints: 0
        },
        {
          name: 'Sayidulloh',
          phone: '+998999090310',
          isVip: false,
          bonusPoints: 0
        }
      ])

      const res = await request(server).get('/api/customers');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some(c => c.name === 'Sayidulloh')).toBeTruthy();
    })
  })

  describe('GET /:id', () => {
    it('should return 404 if invalid objectid is given', async () => {
      const res = await request(server).get('/api/customers/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const customerId = ObjectId();
      const res = await request(server).get('/api/customers/' + customerId);
      expect(res.status).toBe(404);
    })

    it('should return a customer if valid id is given', async () => {
      const customer = new Customer({
        name: 'Sayidulloh',
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      });
      await customer.save();

      const res = await request(server).get('/api/customers/' + customer._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Sayidulloh');
    })
  })

  describe('POST /', () => {
    let token;
    let body;

    const execute = async () => {
      return await request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send(body)
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      body = {
        name: 'Sayidulloh',
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      }
    })

    it('should return 401 if is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 400 if customer name is less than 5 characters', async () => {
      body = {
        name: 'SaDi',
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer name is more than 50 characters', async () => {
      body = {
        name: new Array(52).join('c'),
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is less than 5 characters', async () => {
      body = {
        name: 'Sayidulloh',
        phone: '+99',
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is more than 50 characters', async () => {
      body = {
        name: 'Sayidulloh',
        phone: new Array(52).join('c'),
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should save the category if it is valid', async () => {
      await execute();
      const category = await Customer.find({ name: 'Sayidulloh' });
      expect(category).not.toBeNull();
    })

    it('should return the category if it is saved', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Sayidulloh');
    })
  })

  describe('PUT /:id', () => {
    let token;
    let body;

    const execute = async () => {
      const customerId = ObjectId();
      return await request(server)
        .put('/api/customers/' + customerId)
        .set('x-auth-token', token)
        .send(body)
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      body = {
        name: 'Sayidulloh',
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      }
    })

    it('should return 401 if is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 404 if invalid objectid is given', async () => {
      const res = await request(server).get('/api/customers/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const customerId = ObjectId();
      const res = await request(server).get('/api/customers/' + customerId);
      expect(res.status).toBe(404);
    })

    it('should return 400 if customer name is less than 5 characters', async () => {
      body = {
        name: 'SaDi',
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer name is more than 50 characters', async () => {
      body = {
        name: new Array(52).join('c'),
        phone: '+998999090310',
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is less than 5 characters', async () => {
      body = {
        name: 'Sayidulloh',
        phone: '+99',
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is more than 50 characters', async () => {
      body = {
        name: 'Sayidulloh',
        phone: new Array(52).join('c'),
        isVip: false,
        bonusPoints: 0
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should save the customer if it is valid', async () => {
      await execute();
      const category = await Customer.find({ name: 'Dasturlash' });
      expect(category).not.toBeNull();
    })
  })

  describe('DELETE /:id', () => {
    let token;

    const execute = async () => {
      const customerId = ObjectId();
      return await request(server)
        .delete('/api/customers/' + customerId)
        .set('x-auth-token', token)
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
    })

    it('should return 401 if is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 400 if invalid objectid is given', async () => {
      const res = await request(server).get('/api/customers/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const customerId = ObjectId();
      const res = await request(server).get('/api/customers/' + customerId);
      expect(res.status).toBe(404);
    })

    it('should delete the category if it is valid', async () => {
      const res = await execute();
      const category = await Customer.findById(res._id);
      expect(category).toBeNull();
    })
  })
})