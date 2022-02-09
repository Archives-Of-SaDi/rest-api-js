const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('config');
const { StatusCodes } = require('http-status-codes');
const { Category } = require('../../../src/models/category');
const { User } = require('../../../src/models/user');

let server;
describe('/api/categories', () => {
  beforeEach(() => {
    server = require('../../../src/index');
  });

  afterEach(async () => {
    server.close();
    await Category.remove({});
  });

  describe('GET /', () => {
    it('should return categories', async () => {
      await Category.collection.insertMany([
        { name: 'Category 1' },
        { name: 'Category 2' },
        { name: 'Category 3' },
      ]);

      const response = await request(server).get('/api/categories');
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.length).toBe(3);
      expect(response.body.some(c => c.name === 'Category 1')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('should return 400 if invalid id is given', async () => {
      const response = await request(server).get('/api/categories/test');
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if invalid id is given', async () => {
      const category = mongoose.Types.ObjectId();
      const response = await request(server).get(`/api/categories/${category}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return a category if valid id is given', async () => {
      const category = new Category({ name: 'Category 1' });
      await category.save();

      const response = await request(server).get(
        `/api/categories/${category._id}`
      );
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Category 1');
    });
  });

  describe('POST', () => {
    let token;
    let category = {};

    const execute = async () => {
      return await request(server)
        .post('/api/categories')
        .set('x-auth-token', token)
        .send(category);
    };

    beforeEach(() => {
      token = jwt.sign({ _id: User._id }, config.get('jwtPrivateKey'));
      category = { name: 'Category 1' };
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const response = await execute();
      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return 400 if category is less than 3 characters', async () => {
      category = { name: 'Ca' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if category is more than 50 characters', async () => {
      category = { name: new Array(52).join('a') };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should save the category if it is valid', async () => {
      await execute();
      category = await Category.find({ name: 'Category 1' });
      expect(category).not.toBeNull();
    });

    it('should return the category if it is valid', async () => {
      const response = await execute();
      expect(response.status).toBe(StatusCodes.CREATED);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Category 1');
    });
  });

  describe('PUT /:id', () => {
    let token;
    let category = {};

    const execute = async () => {
      const categoryId = mongoose.Types.ObjectId();

      return await request(server)
        .put(`/api/categories/${categoryId}`)
        .set('x-auth-token', token)
        .send(category);
    };

    beforeEach(() => {
      token = jwt.sign({ _id: User._id }, config.get('jwtPrivateKey'));
      category = { name: 'Category 1' };
    });

    it('should return 400 if invalid id is given', async () => {
      const response = await request(server).get('/api/categories/test');
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if invalid id is given', async () => {
      category = mongoose.Types.ObjectId();
      const response = await request(server).get(`/api/categories/${category}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return a category if valid id is given', async () => {
      category = new Category({ name: 'Category 1' });
      await category.save();

      const response = await request(server).get(
        `/api/categories/${category._id}`
      );
      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Category 1');
    });

    it('should return 400 if category is less than 3 characters', async () => {
      category = { name: 'Ca' };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 400 if category is more than 50 characters', async () => {
      category = { name: new Array(52).join('a') };
      const response = await execute();
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should save the category if it is valid', async () => {
      await execute();
      category = await Category.find({ name: 'Category 1' });
      expect(category).not.toBeNull();
    });

    it('should return the category if it is valid', async () => {
      category = new Category({ name: 'Category 1' });
      await category.save();

      const newCategory = { name: 'Category 2' };

      const response = await request(server)
        .put(`/api/categories/${category._id}`)
        .set('x-auth-token', token)
        .send(newCategory);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', 'Category 2');
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
      const response = await request(server).get('/api/categories/test');
      expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it('should return 404 if invalid id is given', async () => {
      category = mongoose.Types.ObjectId();
      const response = await request(server).get(`/api/categories/${category}`);
      expect(response.status).toBe(StatusCodes.NOT_FOUND);
    });

    it('should return 403 if user is not an admin', async () => {
      token = jwt.sign(
        { _id: User._id, isAdmin: false },
        config.get('jwtPrivateKey')
      );

      const category = new Category({ name: 'Category 1' });
      await category.save();

      const response = await request(server)
        .delete(`/api/categories/${category._id}`)
        .set('x-auth-token', token);

      expect(response.status).toBe(StatusCodes.FORBIDDEN);
    });

    it('should return the category if it is valid', async () => {
      const category = new Category({ name: 'Category 1' });
      await category.save();

      const response = await request(server)
        .delete(`/api/categories/${category._id}`)
        .set('x-auth-token', token);

      expect(response.status).toBe(StatusCodes.OK);
      expect(category).not.toBeNull();
    });
  });
});
