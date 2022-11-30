const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('config');
const { StatusCodes } = require('http-status-codes');
const { Customer } = require('../../../src/models/customer');
const { User } = require('../../../src/models/user');

const API = '/api/customers';
let server;

describe(API, () => {
  beforeEach(() => {
    server = require('../../../src/index');
  });

  afterEach(async () => {
    server.close();
    await Customer.remove({});
  });

  describe('GET /', () => {
    it('should return customers', async () => {
      await Customer.collection.insertMany([
        {
          name: 'Customer 1',
          isVip: true,
          phone: '+380991234567',
        },
        {
          name: 'Customer 2',
          isVip: true,
          phone: '+380991234567',
        },
        {
          name: 'Customer 3',
          isVip: true,
          phone: '+380991234567',
        },
      ]);

      const response = await request(server).get(API);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.length).toBe(3);
      expect(response.body.some(c => c.name === 'Customer 1')).toBeTruthy();
      expect(response.body.some(c => c.isVip === true)).toBeTruthy();
      expect(response.body.some(c => c.phone === '+380991234567')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 400 if invalid id is given', async () => {
      const response = await request(server).get(`${API}/test`);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if invalid id is given', async () => {
      const customer = mongoose.Types.ObjectId();
      const response = await request(server).get(`${API}/${customer}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return a customer if valid id is given', async () => {
      const customer = new Customer({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      await customer.save();

      const response = await request(server).get(`${API}/${customer._id}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Customer 1');
      expect(response.body).toHaveProperty('isVip', true);
      expect(response.body).toHaveProperty('phone', '+380991234567');
    });
  });

  describe('POST', () => {
    let token;
    let customer = {};

    const execute = async () => {
      return await request(server)
        .post(API)
        .set('x-auth-token', token)
        .send(customer);
    };

    beforeEach(() => {
      token = jwt.sign({ _id: User._id }, config.get('jwtPrivateKey'));
      customer = {
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      };
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const response = await execute();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 400 if name is null', async () => {
      customer = { isVip: true, phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if name is less than 5 characters', async () => {
      customer = { name: 'Cust', isVip: true, phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if name is more than 50 characters', async () => {
      customer = {
        name: new Array(52).join('a'),
        isVip: true,
        phone: '+380991234567',
      };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if isVip is null', async () => {
      customer = { name: 'Customer 1', phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if isVip not a boolean', async () => {
      customer = { name: 'Cust', isVip: 'test', phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if phone is null', async () => {
      customer = { name: 'Customer 1', isVip: true };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if phone is less than 5 characters', async () => {
      customer = { name: 'Customer 1', isVip: true, phone: '+123' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if phone is more than 50 characters', async () => {
      customer = {
        name: 'Customer 1',
        isVip: true,
        phone: new Array(52).join('a'),
      };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should save the customer if it is valid', async () => {
      await execute();
      customer = await Customer.find({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      const response = await execute();
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Customer 1');
      expect(response.body).toHaveProperty('isVip', true);
      expect(response.body).toHaveProperty('phone', '+380991234567');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let customer = {};

    const execute = async () => {
      const customerId = mongoose.Types.ObjectId();

      return await request(server)
        .put(`${API}/${customerId}`)
        .set('x-auth-token', token)
        .send(customer);
    };

    beforeEach(() => {
      token = jwt.sign({ _id: User._id }, config.get('jwtPrivateKey'));
      customer = { name: 'Customer 1', isVip: true, phone: '+380991234567' };
    });

    it('should return 400 if invalid id is given', async () => {
      const response = await request(server).get(`${API}/test`);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if invalid id is given', async () => {
      customer = mongoose.Types.ObjectId();
      const response = await request(server).get(`${API}/${customer}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return a customer if valid id is given', async () => {
      customer = new Customer({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      await customer.save();

      const response = await request(server).get(`${API}/${customer._id}`);
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Customer 1');
      expect(response.body).toHaveProperty('isVip', true);
      expect(response.body).toHaveProperty('phone', '+380991234567');
    });

    it('should return 400 if name is null', async () => {
      customer = { isVip: true, phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if name is less than 5 characters', async () => {
      customer = { name: 'Cust', isVip: true, phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if name is more than 50 characters', async () => {
      customer = {
        name: new Array(52).join('a'),
        isVip: true,
        phone: '+380991234567',
      };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if isVip is null', async () => {
      customer = { name: 'Customer 1', phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if isVip not a boolean', async () => {
      customer = { name: 'Cust', isVip: 'test', phone: '+380991234567' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if phone is null', async () => {
      customer = { name: 'Customer 1', isVip: true };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if phone is less than 5 characters', async () => {
      customer = { name: 'Customer 1', isVip: true, phone: '+123' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if phone is more than 50 characters', async () => {
      customer = {
        name: 'Customer 1',
        isVip: true,
        phone: new Array(52).join('a'),
      };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should save the customer if it is valid', async () => {
      await execute();
      customer = await Customer.find({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      customer = new Customer({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      await customer.save();

      const newCustomer = {
        name: 'Customer 2',
        isVip: false,
        phone: '+380991234589',
      };

      const response = await request(server)
        .put(`${API}/${customer._id}`)
        .set('x-auth-token', token)
        .send(newCustomer);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Customer 2');
      expect(response.body).toHaveProperty('isVip', false);
      expect(response.body).toHaveProperty('phone', '+380991234589');
    });
  });

  describe('DELETE /:id', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { _id: User._id, isAdmin: true },
        config.get('jwtPrivateKey')
      );
    });

    it('should return 400 if invalid id is given', async () => {
      const response = await request(server).get(`${API}/test`);
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if invalid id is given', async () => {
      const customer = mongoose.Types.ObjectId();
      const response = await request(server).get(`${API}/${customer}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 403 if user is not an admin', async () => {
      token = jwt.sign(
        { _id: User._id, isAdmin: false },
        config.get('jwtPrivateKey')
      );

      const customer = new Customer({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      await customer.save();

      const response = await request(server)
        .delete(`${API}/${customer._id}`)
        .set('x-auth-token', token);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return the customer if it is valid', async () => {
      const customer = new Customer({
        name: 'Customer 1',
        isVip: true,
        phone: '+380991234567',
      });
      await customer.save();

      const response = await request(server)
        .delete(`${API}/${customer._id}`)
        .set('x-auth-token', token);

      expect(response.status).toBe(StatusCodes.OK);
      expect(customer).not.toBeNull();
    });
  });
});
