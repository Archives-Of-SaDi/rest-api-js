const request = require('supertest');
const { Types: { ObjectId } } = require('mongoose');
const { Course } = require('../../../models/course.model');
const { User } = require('../../../models/user.models');
let server;

describe('/api/categories', () => {
  beforeEach(() => {
    server = require('../../../index');
  })

  afterEach(async () => {
    server.close();
    await Course.remove({});
  })

  describe('GET /', () => {
    it('should return all categories', async () => {
      const categoryId = ObjectId();
      await Course.collection.insertMany([
        {
          title: 'JavaScript',
          category: {
            _id: categoryId,
            name: 'Dasturlash'
          },
          trainer: 'Abbasov Sayidulloh',
          tags: ['web', 'js'],
          status: 'Active',
          fee: 10
        },
        {
          title: 'JavaScript',
          category: {
            _id: categoryId,
            name: 'Dasturlash'
          },
          trainer: 'Abbasov Sayidulloh',
          tags: ['web', 'js'],
          status: 'Active',
          fee: 10
        },
        {
          title: 'JavaScript',
          category: {
            _id: categoryId,
            name: 'Dasturlash'
          },
          trainer: 'Abbasov Sayidulloh',
          tags: ['web', 'js'],
          status: 'Active',
          fee: 10
        }
      ])

      const res = await request(server).get('/api/courses');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some(c => c.title === 'JavaScript')).toBeTruthy();
    })
  })

  describe('GET /:id', () => {
    it('should return 404 if invalid objectid is given', async () => {
      const res = await request(server).get('/api/courses/123');
      expect(res.status).toBe(400);
    })

    it('should return 404 if invalid id is given', async () => {
      const courseId = ObjectId();
      const res = await request(server).get('/api/courses/' + courseId);
      expect(res.status).toBe(404);
    })

    it('should return a course if valid id is given', async () => {
      const categoryId = ObjectId();
      const course = new Course({
        title: 'JavaScript',
        category: {
          _id: categoryId,
          name: 'Dasturlash'
        },
        trainer: 'Abbasov Sayidulloh',
        tags: ['web', 'js'],
        status: 'Active',
        fee: 10
      });
      await course.save();

      const res = await request(server).get('/api/courses/' + course._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'JavaScript');
    })
  })

  describe('POST /', () => {
    let token;
    let body;

    const execute = async () => {
      return await request(server)
        .post('/api/courses')
        .set('x-auth-token', token)
        .send(body)
    }

    beforeEach(() => {
      const categoryId = ObjectId();
      token = new User().generateAuthToken();
      body = {
        title: 'Node JS',
        category: {
          _id: categoryId,
          name: 'Dasturlash'
        },
        trainer: 'Abbasov Sayidulloh',
        tags: ['web', 'js'],
        status: 'Active',
        fee: 10
      }
    })

    it('should return 401 if is not logged in', async () => {
      token = '';
      const res = await execute();
      expect(res.status).toBe(401);
    })

    it('should save the category if it is valid', async () => {
      await execute();
      const course = await Course.find({ title: 'JavaScript' });
      expect(course).not.toBeNull();
    })

    it('should return the category if it is saved', async () => {
      const res = await execute();
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('title', 'Node JS');
    })
  })
})