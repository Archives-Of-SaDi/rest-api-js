const request = require('supertest');
const { Types: { ObjectId } } = require('mongoose');
const { Category } = require('../../../models/category.model');
const { User } = require('../../../models/user.models');
let server;

describe('/api/categories', () => {
  beforeEach(() => {
    server = require('../../../index');
  })

  afterEach(async () => {
    server.close();
    await Category.remove({});
  })

  describe('GET /', () => {
    it('should return all categories', async () => {
      await Category.collection.insertMany([
        { name: 'Dasturlash' },
        { name: 'Tarmoqlar' },
        { name: 'Dizayn' },
      ])

      const res = await request(server).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some(c => c.name === 'Dasturlash')).toBeTruthy();
    })
  })

  describe('GET /:id', () => {
    it('should return 404 if invalid objectid is given', async () => {
      const res = await request(server).get('/api/categories/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const categoryId = ObjectId();
      const res = await request(server).get('/api/categories/' + categoryId);
      expect(res.status).toBe(404);
    })

    it('should return a category if valid id is given', async () => {
      const category = new Category({ name: 'Dasturlash' });
      await category.save();

      const res = await request(server).get('/api/categories/' + category._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Dasturlash');
    })
  })

  describe('POST /', () => {
    let token;
    let body;

    const execute = async () => {
      return await request(server)
        .post('/api/categories')
        .set('x-auth-token', token)
        .send(body)
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      body = {
        name: 'Dasturlash'
      }
    })

    it('should return 401 if is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 400 if category name is less than 3 characters', async () => {
      body = {
        name: '12'
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if category name is more than 50 characters', async () => {
      body = {
        name: new Array(52).join('c')
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should save the category if it is valid', async () => {
      await execute();
      const category = await Category.find({ name: 'Dasturlash' });
      expect(category).not.toBeNull();
    })

    it('should return the category if it is saved', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Dasturlash');
    })
  })

  describe('PUT /:id', () => {
    let token;
    let body;

    const execute = async () => {
      const categoryId = ObjectId();
      return await request(server)
        .put('/api/categories/' + categoryId)
        .set('x-auth-token', token)
        .send(body)
    }

    beforeEach(() => {
      token = new User().generateAuthToken();
      body = {
        name: 'Dasturlash'
      }
    })

    it('should return 401 if is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should return 404 if invalid objectid is given', async () => {
      const res = await request(server).get('/api/categories/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const categoryId = ObjectId();
      const res = await request(server).get('/api/categories/' + categoryId);
      expect(res.status).toBe(404);
    })

    it('should return 400 if category name is less than 3 characters', async () => {
      body = {
        name: '12'
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should return 400 if category name is more than 50 characters', async () => {
      body = {
        name: new Array(52).join('c')
      }
      const res = await execute();
      expect(res.status).toBe(400);
    })

    it('should save the category if it is valid', async () => {
      await execute();
      const category = await Category.find({ name: 'Dasturlash' });
      expect(category).not.toBeNull();
    })
  })

  describe('DELETE /:id', () => {
    let token;

    const execute = async () => {
      const categoryId = ObjectId();
      return await request(server)
        .delete('/api/categories/' + categoryId)
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
      const res = await request(server).get('/api/categories/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const categoryId = ObjectId();
      const res = await request(server).get('/api/categories/' + categoryId);
      expect(res.status).toBe(404);
    })

    it('should delete the category if it is valid', async () => {
      const res = await execute();
      const category = await Category.findById(res._id);
      expect(category).toBeNull();
    })
  })
})