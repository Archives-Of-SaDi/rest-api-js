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
          name: 'James',
          phone: '+123456789',
        },
        {
          name: 'Robert',
          phone: '+123456789',
        },
        {
          name: 'Johnson',
          phone: '+123456789',
        }
      ])

      const response = await request(server).get('/api/customers');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(3);
      expect(response.body.some(c => c.name === 'James')).toBeTruthy();
    })
  })

  describe('GET /:id', () => {
    it('should return 404 if invalid id is given', async () => {
      const response = await request(server).get('/api/customers/123');
      expect(response.status).toBe(404);
    })

    it('should return 404 if no customer with the id exist', async () => {
      const customerId = ObjectId();
      const response = await request(server).get('/api/customers/' + customerId);
      expect(response.status).toBe(404);
    })

    it('should return a customer if valid id is given', async () => {
      const customer = new Customer({
        name: 'James',
        phone: '+123456789',
      });
      await customer.save();

      const response = await request(server).get('/api/customers/' + customer._id);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'James');
    })
  })

  describe('POST /', () => {
    let token;
    let body;

    const execute = async () => {
      return await request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send(body);
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      body = {
        name: 'James',
        isVip: false,
        phone: '+123456789',
        bonusPoints: 0
      };
    })

    it('should return 401 if user is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 400 if customer name is less than 5 characters', async () => {
      body = {
        name: 'John',
        phone: '+123456789',
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer name is more than 50 characters', async () => {
      body = {
        name: new Array(52).join('c'),
        phone: '+123456789',
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is less than 5 characters', async () => {
      body = {
        name: 'James',
        phone: '+12',
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is more than 50 characters', async () => {
      body = {
        name: 'James',
        phone: new Array(52).join('9')
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should save the customer if it is valid', async () => {
      await execute();
      const customer = await Customer.find({ name: 'James' });
      expect(customer).not.toBeNull();
    })

    it('should return the customer if it is valid', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'James');
    })
  })

  describe('PUT /:id', () => {
    let token;
    let body;

    const execute = async () => {
      return await request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send(body);
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      body = {
        name: 'James',
        isVip: false,
        phone: '+123456789',
        bonusPoints: 0
      };
    })

    it('should return 401 if user is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 404 if invalid id is given', async () => {
      const response = await request(server).get('/api/customers/123');
      expect(response.status).toBe(404);
    })

    it('should return 404 if no customer with the id exist', async () => {
      const customerId = ObjectId();
      const response = await request(server).get('/api/customers/' + customerId);
      expect(response.status).toBe(404);
    })

    it('should return 400 if customer name is less than 5 characters', async () => {
      body = {
        name: 'John',
        phone: '+123456789',
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer name is more than 50 characters', async () => {
      body = {
        name: new Array(52).join('c'),
        phone: '+123456789',
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is less than 5 characters', async () => {
      body = {
        name: 'James',
        phone: '+12',
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if customer phone is more than 50 characters', async () => {
      body = {
        name: 'James',
        phone: new Array(52).join('9')
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should save the customer if it is valid', async () => {
      await execute();
      const customer = await Customer.find({ name: 'James' });
      expect(customer).not.toBeNull();
    })

    it('should return the customer if it is valid', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'James');
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

    it('should return 401 if user is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 404 if invalid id is given', async () => {
      const response = await request(server).get('/api/customers/123');
      expect(response.status).toBe(404);
    })

    it('should return 404 if no customer with the id exist', async () => {
      const customerId = ObjectId();
      const response = await request(server).get('/api/customers/' + customerId);
      expect(response.status).toBe(404);
    })

    it('should delete the customer if it is valid', async () => {
      const res = await execute();
      const customer = await Customer.findOne({ _id: res._id });
      expect(customer).toBeNull();
    })
  })
})